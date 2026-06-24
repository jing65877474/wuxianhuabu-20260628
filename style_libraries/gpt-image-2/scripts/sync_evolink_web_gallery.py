#!/usr/bin/env python3
"""Sync the public EvoLink GPT Image 2 prompt gallery page."""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import urllib.request
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from typing import Any


SKILL_DIR = Path(__file__).resolve().parent.parent
REFERENCES_DIR = SKILL_DIR / "references"
CASES_FILE = REFERENCES_DIR / "evolink-web-gallery-cases.json"
CATALOG_FILE = REFERENCES_DIR / "evolink-web-gallery-catalog.md"
WEB_URL = "https://evolink.ai/gpt-image-2-prompts"
USER_AGENT = "Mozilla/5.0 Codex-EvoLink-Web-Gallery-Sync/1.0"


STYLE_KEYWORDS = {
    "cinematic": ["cinematic", "movie", "film", "trailer"],
    "editorial": ["editorial", "magazine", "layout", "typography"],
    "photorealistic": ["photorealistic", "realistic", "photography", "photo"],
    "illustration": ["illustration", "hand-drawn", "watercolor", "anime", "cartoon"],
    "product": ["product", "e-commerce", "commercial", "advertisement", "ad "],
    "ui": ["ui", "mockup", "infographic", "dashboard", "interface"],
    "character": ["character", "turnaround", "sheet", "concept art"],
    "poster": ["poster", "key visual", "headline"],
    "retro": ["retro", "vintage", "film grain"],
    "3d": ["3d", "isometric", "diorama", "miniature"],
}

SCENE_KEYWORDS = {
    "commercial": ["campaign", "advertisement", "brand", "product", "e-commerce"],
    "portrait": ["portrait", "face", "skin", "model"],
    "city": ["city", "urban", "skyline", "street"],
    "food": ["food", "drink", "cafe", "restaurant", "tomato"],
    "fashion": ["fashion", "editorial", "outfit", "streetwear"],
    "sports": ["sports", "football", "stadium", "goal"],
    "travel": ["travel", "destination", "map", "landmark"],
    "game": ["game", "character sheet", "rpg", "anime"],
    "tech": ["sci-fi", "holographic", "data", "cyber"],
}

RISK_PATTERNS = {
    "brand_or_celebrity": re.compile(
        r"\b(?:nike|adidas|coca[- ]?cola|pepsi|sprite|fifa|messi|sam altman|gta|persona5|vogue|chanel|dior|tesla|apple|iphone|starbucks|mcdonald|kfc|lego|disney|marvel|rolls[- ]?royce)\b",
        re.I,
    ),
    "signature_or_watermark": re.compile(r"\b(?:signature|watermark|logo|signed|署名|落款)\b", re.I),
    "text_rendering": re.compile(r"\b(?:typography|text|reads|title|headline|字|文字|标题|排版|logo)\b", re.I),
    "reference_required": re.compile(r"\b(?:reference image|uploaded image|provided image|attached image|参考图|上传|照片参考)\b", re.I),
}


class TokenParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.stack: list[str] = []
        self.tokens: list[dict[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = {key: value or "" for key, value in attrs}
        self.stack.append(tag)
        if tag == "img":
            self.tokens.append(
                {
                    "type": "img",
                    "tag": tag,
                    "src": attrs_dict.get("src", ""),
                    "alt": attrs_dict.get("alt", ""),
                }
            )

    def handle_endtag(self, tag: str) -> None:
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index] == tag:
                del self.stack[index:]
                break

    def handle_data(self, data: str) -> None:
        text = " ".join(html.unescape(data).split())
        if text:
            self.tokens.append({"type": "text", "tag": self.stack[-1] if self.stack else "", "text": text})


def now_iso() -> str:
    return datetime.now().astimezone().isoformat()


def compact(value: str, limit: int = 420) -> str:
    value = re.sub(r"\s+", " ", value or "").strip()
    return value if len(value) <= limit else f"{value[: limit - 1]}..."


def slugify(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value.lower()).strip("-")
    return value or "case"


def sha12(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:12]


def infer_tags(prompt: str, table: dict[str, list[str]]) -> list[str]:
    text = prompt.casefold()
    tags = [tag for tag, terms in table.items() if any(term in text for term in terms)]
    return tags[:6]


def risk_flags(prompt: str) -> list[str]:
    return [name for name, pattern in RISK_PATTERNS.items() if pattern.search(prompt)]


def fetch_html(timeout: int) -> str:
    request = urllib.request.Request(WEB_URL, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        if response.status < 200 or response.status >= 300:
            raise RuntimeError(f"HTTP {response.status}: {WEB_URL}")
        return response.read().decode("utf-8", errors="replace")


def nearest_image(tokens: list[dict[str, str]], index: int) -> tuple[str, str]:
    for token in reversed(tokens[max(0, index - 16) : index]):
        if token.get("type") == "img" and "GPT Image 2" in token.get("alt", ""):
            return token.get("src", ""), token.get("alt", "")
    return "", ""


def nearest_author_and_category(tokens: list[dict[str, str]], index: int) -> tuple[str, str, str]:
    author = ""
    category = ""
    difficulty = ""
    for token in reversed(tokens[max(0, index - 24) : index]):
        text = token.get("text", "")
        if text.startswith("@") and not author:
            author = text.lstrip("@")
        if "Static " in text and not category:
            category = text
            parts = text.split()
            if len(parts) >= 2:
                difficulty = parts[1]
        if author and category:
            break
    return author, category, difficulty


def category_from_label(label: str) -> str:
    for candidate in (
        "Character Design",
        "UI Mockups",
        "Posters",
        "Portraits",
        "Marketing Visuals",
        "Product Photography",
        "Community Showcase",
    ):
        if candidate in label:
            return candidate
    return label.replace("Static", "").strip() or "EvoLink Web Gallery"


def prompt_after_heading(tokens: list[dict[str, str]], start: int, end: int) -> tuple[str, list[str]]:
    prompt_parts: list[str] = []
    tags: list[str] = []
    after_show_prompt = False
    skip = {
        "IMAGE",
        "Show Prompt",
        "Copy",
        "Use",
        "All",
        "Character Design",
        "UI Mockups",
        "Posters",
        "Portraits",
        "Marketing Visuals",
        "Product Photography",
        "Community Showcase",
    }
    for token in tokens[start:end]:
        if token.get("type") != "text":
            continue
        text = token.get("text", "")
        if text == "Show Prompt":
            after_show_prompt = True
            continue
        if text in {"Copy", "Use"}:
            continue
        if after_show_prompt:
            noisy = (
                text in skip
                or text in {"IMAGE", "on X", "Static", "Beginner", "Intermediate", "Advanced", "Expert"}
                or text.startswith("Static ")
                or text.endswith(" on X")
                or any(label in text for label in (
                    "Character Design",
                    "UI Mockups",
                    "Posters",
                    "Portraits",
                    "Marketing Visuals",
                    "Product Photography",
                    "Community Showcase",
                ))
            )
            if noisy:
                continue
            if 2 <= len(text) <= 80 and not text.startswith("@"):
                tags.extend(part.strip() for part in re.split(r"[,#]", text) if part.strip())
            continue
        if text in skip or text.startswith("@") or text.startswith("Static "):
            continue
        prompt_parts.append(text)
    return " ".join(prompt_parts).strip(), tags[:8]


def parse_cases(source_html: str) -> list[dict[str, Any]]:
    parser = TokenParser()
    parser.feed(source_html)
    tokens = parser.tokens
    h3_indices = [
        index
        for index, token in enumerate(tokens)
        if token.get("type") == "text" and token.get("tag") == "h3"
    ]
    cases: list[dict[str, Any]] = []
    for order, index in enumerate(h3_indices):
        title = tokens[index].get("text", "")
        if title.startswith("What ") or title.startswith("Can ") or title.startswith("How "):
            continue
        end = h3_indices[order + 1] if order + 1 < len(h3_indices) else len(tokens)
        segment_text = " ".join(token.get("text", "") for token in tokens[index:end] if token.get("type") == "text")
        if "How To Write Better GPT Image 2 Prompts" in segment_text:
            break
        prompt, visible_tags = prompt_after_heading(tokens, index + 1, end)
        if len(prompt) < 40:
            continue
        image, image_alt = nearest_image(tokens, index)
        author, category_label, difficulty = nearest_author_and_category(tokens, index)
        category = category_from_label(category_label)
        case_id = f"evolink-web-{slugify(title)}-{sha12(prompt)[:8]}"
        all_tags = visible_tags + infer_tags(prompt, STYLE_KEYWORDS)
        style_tags = []
        for tag in all_tags:
            if tag and tag not in style_tags:
                style_tags.append(tag)
        cases.append(
            {
                "id": case_id,
                "source": "evolink_web_gallery",
                "sourceId": case_id.removeprefix("evolink-web-"),
                "title": title,
                "author": author,
                "category": category,
                "difficulty": difficulty,
                "galleryUrl": WEB_URL,
                "sourceUrl": WEB_URL,
                "images": [image] if image else [],
                "imageAlt": image_alt,
                "prompts": {"en": prompt},
                "promptPreview": compact(prompt),
                "styleTags": style_tags[:8],
                "sceneTags": infer_tags(prompt, SCENE_KEYWORDS),
                "riskFlags": risk_flags(prompt),
                "promptHash": sha12(prompt),
                "language": "en",
            }
        )
    return cases


def build_catalog(cases: list[dict[str, Any]]) -> None:
    lines = [
        "# EvoLink Web Gallery Supplemental Catalog",
        "",
        f"Source: `{WEB_URL}`.",
        f"Imported cases: **{len(cases)}**.",
        "",
        "| ID | Title | Category | Styles | Scenes | Risks |",
        "|---|---|---|---|---|---|",
    ]
    for case in cases:
        def cell(value: object) -> str:
            return str(value or "").replace("|", "\\|")
        lines.append(
            "| {id} | {title} | {category} | {styles} | {scenes} | {risks} |".format(
                id=cell(case["id"]),
                title=cell(case["title"]),
                category=cell(case["category"]),
                styles=cell(", ".join(case.get("styleTags") or [])),
                scenes=cell(", ".join(case.get("sceneTags") or [])),
                risks=cell(", ".join(case.get("riskFlags") or [])),
            )
        )
    CATALOG_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--timeout", type=int, default=20)
    parser.add_argument("--html-file", help="Use a saved HTML file instead of fetching the live page")
    args = parser.parse_args()

    if args.html_file:
        source_html = Path(args.html_file).read_text(encoding="utf-8", errors="replace")
    else:
        source_html = fetch_html(args.timeout)
    page_hash = sha12(source_html)
    cases = parse_cases(source_html)
    payload = {
        "source": "evolink_web_gallery",
        "sourceUrl": WEB_URL,
        "fetchedAt": now_iso(),
        "pageHash": page_hash,
        "importedCases": len(cases),
        "cases": cases,
    }
    REFERENCES_DIR.mkdir(parents=True, exist_ok=True)
    CASES_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    build_catalog(cases)
    print(f"Synced {len(cases)} EvoLink web gallery cases; page hash {page_hash}.")


if __name__ == "__main__":
    main()
