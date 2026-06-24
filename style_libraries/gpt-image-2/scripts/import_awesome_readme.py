#!/usr/bin/env python3
"""Import visible cases from the local awesome-gpt-image-2 README files."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from datetime import datetime
from pathlib import Path


SKILL_DIR = Path(__file__).resolve().parent.parent
PRIMARY_FILE = SKILL_DIR / "references" / "cases.json"
OPENNANA_FILE = SKILL_DIR / "references" / "opennana-cases.json"
OUTPUT_FILE = SKILL_DIR / "references" / "awesome-readme-cases.json"
CATALOG_FILE = SKILL_DIR / "references" / "awesome-readme-catalog.md"
DEFAULT_SOURCE_ROOT = Path(
    r"C:\Users\pc\Downloads\awesome-gpt-image-2-main (1)"
    r"\awesome-gpt-image-2-main"
)

CATEGORY_RULES = [
    ("Products & Commerce", ("product", "e-commerce", "commerce", "packaging", "live stream", "poster ad")),
    ("Posters & Typography", ("poster", "flyer", "campaign", "typography", "cover", "key visual")),
    ("UI & Interfaces", ("ui", "interface", "app", "web", "dashboard", "mockup", "screen")),
    ("Charts & Infographics", ("infographic", "diagram", "chart", "explainer", "map", "timeline", "slide")),
    ("Brand & Identity", ("brand", "logo", "identity", "visual system")),
    ("Photography & Portraits", ("photo", "photography", "portrait", "selfie", "model", "cinematic")),
    ("Illustration & Characters", ("illustration", "anime", "manga", "comic", "character", "storyboard")),
    ("Architecture & Spaces", ("architecture", "interior", "room", "cityscape", "landscape")),
    ("Food & Drink", ("food", "drink", "coffee", "restaurant", "map")),
    ("Documents & Editorial", ("document", "editorial", "magazine", "newspaper", "report")),
]

STYLE_RULES = [
    ("3D render", ("3d", "render", "isometric", "octane", "cgi")),
    ("cinematic", ("cinematic", "film still", "movie", "dramatic lighting")),
    ("minimal", ("minimal", "clean", "simple", "white space")),
    ("editorial", ("editorial", "magazine", "layout", "publication")),
    ("infographic", ("infographic", "diagram", "callout", "explainer", "timeline")),
    ("photorealistic", ("photorealistic", "realistic", "photo", "lens", "studio lighting")),
    ("illustration", ("illustration", "hand-drawn", "watercolor", "anime", "comic")),
    ("retro", ("retro", "vintage", "nostalgic")),
    ("sci-fi", ("sci-fi", "cyberpunk", "futuristic", "high-tech")),
]

SCENE_RULES = [
    ("studio", ("studio", "seamless background", "product shot")),
    ("lifestyle", ("lifestyle", "home", "daily", "person", "model")),
    ("commercial", ("commercial", "advertising", "campaign", "e-commerce")),
    ("interface", ("ui", "interface", "screen", "dashboard")),
    ("exploded view", ("exploded view", "component", "callout")),
    ("map", ("map", "city", "route", "landmark")),
]


def normalize(value: object) -> str:
    return re.sub(r"\s+", "", str(value or "")).casefold()


def compact(value: str, limit: int = 320) -> str:
    value = re.sub(r"\s+", " ", value or "").strip()
    return value if len(value) <= limit else f"{value[: limit - 1]}..."


def markdown_escape(value: object) -> str:
    return str(value or "").replace("|", "\\|").replace("\n", " ")


def read_json(path: Path, default: dict) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return default


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def infer_from_rules(title: str, prompt: str, rules: list[tuple[str, tuple[str, ...]]], fallback: str) -> str:
    haystack = f"{title} {prompt[:1200]}".casefold()
    for label, terms in rules:
        if any(term in haystack for term in terms):
            return label
    return fallback


def infer_tags(title: str, prompt: str, rules: list[tuple[str, tuple[str, ...]]]) -> list[str]:
    haystack = f"{title} {prompt[:1200]}".casefold()
    return [label for label, terms in rules if any(term in haystack for term in terms)]


def category_from_title(title: str, prompt: str) -> str:
    prefix = title.split(" - ", 1)[0].strip()
    if 3 <= len(prefix) <= 36 and "/" in prefix:
        return prefix
    return infer_from_rules(title, prompt, CATEGORY_RULES, "General Visual Inspiration")


def parse_cases(readme_path: Path, language: str) -> dict[str, dict]:
    text = readme_path.read_text(encoding="utf-8")
    sections = list(re.finditer(r"(?m)^### No\.?\s*(\d+):\s*(.+?)\s*$", text))
    cases: dict[str, dict] = {}

    for index, match in enumerate(sections):
        start = match.end()
        end = sections[index + 1].start() if index + 1 < len(sections) else len(text)
        block = text[start:end]
        title = match.group(2).strip()

        prompt_match = re.search(
            r"(?is)^####[^\n]*(?:prompt|提示)[^\n]*\n\s*```[^\n]*\n(.*?)\n```",
            block,
            flags=re.MULTILINE,
        )
        if not prompt_match:
            continue
        prompt = prompt_match.group(1).strip()
        if not prompt:
            continue

        id_match = re.search(r"gpt-image-2-prompts\?id=(\d+)", block)
        source_id = id_match.group(1) if id_match else f"{language}-{match.group(1)}"
        source_url = (
            f"https://youmind.com/gpt-image-2-prompts?id={source_id}"
            if source_id.isdigit()
            else ""
        )

        description_match = re.search(
            r"(?is)^####[^\n]*(?:description|描述)[^\n]*\n(.*?)(?=^####|\Z)",
            block,
            flags=re.MULTILINE,
        )
        description = compact(description_match.group(1), 500) if description_match else ""

        image_urls = re.findall(r'<img\s+src="([^"]+)"', block)
        author_match = re.search(r"\*\*(?:Author|作者)[^*]*:\*\*\s*\[([^\]]+)\]\(([^)]+)\)", block)
        source_match = re.search(r"\*\*(?:Source|来源)[^*]*:\*\*\s*\[([^\]]+)\]\(([^)]+)\)", block)
        published_match = re.search(r"\*\*(?:Published|发布时间)[^*]*:\*\*\s*([^\n]+)", block)

        key = source_id if source_id else normalize(title)
        cases[key] = {
            "sourceId": source_id,
            "readmeNumber": int(match.group(1)),
            "title": title,
            "description": description,
            "prompt": prompt,
            "images": image_urls,
            "author": author_match.group(1).strip() if author_match else "",
            "authorUrl": author_match.group(2).strip() if author_match else "",
            "sourceName": source_match.group(1).strip() if source_match else "",
            "sourceUrl": source_match.group(2).strip() if source_match else source_url,
            "galleryUrl": source_url,
            "published": published_match.group(1).strip() if published_match else "",
            "language": language,
        }

    return cases


def load_existing_signatures() -> tuple[set[str], set[str]]:
    titles: set[str] = set()
    prompts: set[str] = set()

    primary = read_json(PRIMARY_FILE, {})
    for case in primary.get("cases") or []:
        titles.add(normalize(case.get("title")))
        prompts.add(normalize(case.get("prompt")))

    opennana = read_json(OPENNANA_FILE, {})
    for case in opennana.get("cases") or []:
        titles.add(normalize(case.get("title")))
        for prompt in (case.get("prompts") or {}).values():
            prompts.add(normalize(prompt))

    return titles, prompts


def transform(source_root: Path) -> dict:
    english_path = source_root / "README.md"
    zh_path = source_root / "README_zh.md"
    if not english_path.is_file():
        raise FileNotFoundError(f"README.md not found under {source_root}")

    english_cases = parse_cases(english_path, "en")
    zh_cases = parse_cases(zh_path, "zh") if zh_path.is_file() else {}
    primary_titles, primary_prompts = load_existing_signatures()
    seen_titles: set[str] = set()
    seen_prompts: set[str] = set()
    output_cases: list[dict] = []
    skipped = {
        "primary_title": 0,
        "primary_prompt": 0,
        "duplicate_title": 0,
        "duplicate_prompt": 0,
    }

    for key, item in english_cases.items():
        title_key = normalize(item["title"])
        prompt_key = normalize(item["prompt"])
        if title_key in primary_titles:
            skipped["primary_title"] += 1
            continue
        if prompt_key in primary_prompts:
            skipped["primary_prompt"] += 1
            continue
        if title_key in seen_titles:
            skipped["duplicate_title"] += 1
            continue
        if prompt_key in seen_prompts:
            skipped["duplicate_prompt"] += 1
            continue

        seen_titles.add(title_key)
        seen_prompts.add(prompt_key)
        zh_item = zh_cases.get(key, {})
        prompts = {"en": item["prompt"]}
        titles = {"en": item["title"]}
        descriptions = {"en": item.get("description", "")}
        if zh_item.get("prompt"):
            prompts["zh"] = zh_item["prompt"]
        if zh_item.get("title"):
            titles["zh"] = zh_item["title"]
        if zh_item.get("description"):
            descriptions["zh"] = zh_item["description"]

        category = category_from_title(item["title"], item["prompt"])
        style_tags = infer_tags(item["title"], item["prompt"], STYLE_RULES)
        scene_tags = infer_tags(item["title"], item["prompt"], SCENE_RULES)
        source_id = item.get("sourceId") or key
        output_cases.append(
            {
                "id": f"awesome-readme-{source_id}",
                "sourceId": source_id,
                "source": "awesome_readme",
                "readmeNumber": item.get("readmeNumber"),
                "title": item["title"],
                "titles": titles,
                "category": category,
                "styleTags": style_tags,
                "sceneTags": scene_tags,
                "promptPreview": compact(item["prompt"]),
                "prompts": prompts,
                "descriptions": descriptions,
                "images": item.get("images") or zh_item.get("images") or [],
                "author": item.get("author") or zh_item.get("author") or "",
                "authorUrl": item.get("authorUrl") or zh_item.get("authorUrl") or "",
                "sourceName": item.get("sourceName") or zh_item.get("sourceName") or "",
                "sourceUrl": item.get("sourceUrl") or zh_item.get("sourceUrl") or "",
                "galleryUrl": item.get("galleryUrl") or zh_item.get("galleryUrl") or "",
                "published": item.get("published") or zh_item.get("published") or "",
            }
        )

    output_cases.sort(key=lambda case: int(case.get("sourceId") or case.get("readmeNumber") or 0))
    return {
        "source": "awesome-gpt-image-2 README visible cases",
        "sourceRoot": str(source_root),
        "sourceReadme": str(english_path),
        "sourceReadmeSha256": file_sha256(english_path),
        "sourceReadmeMtime": datetime.fromtimestamp(english_path.stat().st_mtime).astimezone().isoformat(),
        "importedAt": datetime.now().astimezone().isoformat(),
        "sourceVisibleCases": len(english_cases),
        "importedCases": len(output_cases),
        "skipped": skipped,
        "note": (
            "This import covers cases visible in the local README files. "
            "The full YouMind CMS-backed count requires CMS/API access."
        ),
        "cases": output_cases,
    }


def build_catalog(data: dict) -> None:
    lines = [
        "# Awesome GPT Image 2 README Case Catalog",
        "",
        (
            "Supplemental local README source for `gpt-image-2-style-library`. "
            f"Imported visible cases: **{data.get('importedCases', 0)}**. "
            "Use `scripts/search_awesome_readme.py` for focused retrieval."
        ),
        "",
        (
            "Note: this catalog imports only cases visible in local README files. "
            "The full YouMind gallery total needs CMS/API credentials."
        ),
        "",
        "| ID | Title | Category | Styles | Scenes | Published |",
        "|---|---|---|---|---|---|",
    ]
    for case in data.get("cases") or []:
        values = [
            case.get("id"),
            case.get("title"),
            case.get("category"),
            ", ".join(case.get("styleTags") or []),
            ", ".join(case.get("sceneTags") or []),
            case.get("published"),
        ]
        lines.append(f"| {' | '.join(markdown_escape(value) for value in values)} |")
    CATALOG_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "source_root",
        nargs="?",
        type=Path,
        default=DEFAULT_SOURCE_ROOT,
        help="Path to the awesome-gpt-image-2-main project directory",
    )
    args = parser.parse_args()

    data = transform(args.source_root.expanduser().resolve())
    OUTPUT_FILE.write_text(
        json.dumps(data, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    build_catalog(data)
    print(f"Imported {data['importedCases']} README cases to {OUTPUT_FILE}")
    print(f"Visible README cases: {data['sourceVisibleCases']}")
    print(f"Skipped: {json.dumps(data['skipped'], ensure_ascii=False)}")


if __name__ == "__main__":
    main()
