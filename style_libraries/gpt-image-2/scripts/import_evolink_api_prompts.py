#!/usr/bin/env python3
"""Import EvoLinkAI awesome-gpt-image-2-API-and-Prompts cases."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import tempfile
import urllib.request
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Any


SKILL_DIR = Path(__file__).resolve().parent.parent
REFERENCES_DIR = SKILL_DIR / "references"
CASES_FILE = REFERENCES_DIR / "evolink-api-prompts-cases.json"
CATALOG_FILE = REFERENCES_DIR / "evolink-api-prompts-catalog.md"
REPO = "EvoLinkAI/awesome-gpt-image-2-API-and-Prompts"
ZIP_URL = f"https://github.com/{REPO}/archive/refs/heads/main.zip"
REPO_URL = f"https://github.com/{REPO}"
USER_AGENT = "Mozilla/5.0 Codex-EvoLink-API-Prompts-Importer/1.0"

DEFAULT_ROOT = Path(
    r"C:\Users\pc\Downloads\awesome-gpt-image-2-API-and-Prompts-main"
    r"\awesome-gpt-image-2-API-and-Prompts-main"
)

CATEGORY_LABELS = {
    "ad-creative": "Marketing Visuals",
    "character": "Character Design",
    "comparison": "Comparison & Community Examples",
    "ecommerce": "Product Photography",
    "portrait": "Portraits",
    "poster": "Posters",
    "ui": "UI Mockups",
}

STYLE_KEYWORDS = {
    "cinematic": ["cinematic", "movie", "film", "trailer"],
    "editorial": ["editorial", "magazine", "layout", "typography"],
    "photorealistic": ["photorealistic", "realistic", "photography", "photo"],
    "illustration": ["illustration", "hand-drawn", "watercolor", "anime", "cartoon"],
    "product": ["product", "e-commerce", "commercial", "advertisement", "ad "],
    "ui": ["ui", "mockup", "infographic", "dashboard", "interface"],
    "character": ["character", "turnaround", "sheet", "concept art"],
    "poster": ["poster", "key visual", "headline"],
    "retro": ["retro", "vintage", "film grain", "1950s", "1970s"],
    "3d": ["3d", "isometric", "diorama", "miniature"],
}

SCENE_KEYWORDS = {
    "commercial": ["campaign", "advertisement", "brand", "product", "e-commerce"],
    "portrait": ["portrait", "face", "skin", "model"],
    "city": ["city", "urban", "skyline", "street"],
    "food": ["food", "drink", "cafe", "restaurant", "burger", "tomato"],
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


def now_iso() -> str:
    return datetime.now().astimezone().isoformat()


def slugify(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value.lower()).strip("-")
    return value or "case"


def compact(value: str, limit: int = 420) -> str:
    value = re.sub(r"\s+", " ", value or "").strip()
    return value if len(value) <= limit else f"{value[: limit - 1]}..."


def sha12(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:12]


def request_bytes(url: str, timeout: int) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        if response.status < 200 or response.status >= 300:
            raise RuntimeError(f"HTTP {response.status}: {url}")
        return response.read()


def download_github_zip(timeout: int) -> Path:
    tmp = Path(tempfile.mkdtemp(prefix="evolink_api_prompts_"))
    archive = tmp / "repo.zip"
    archive.write_bytes(request_bytes(ZIP_URL, timeout))
    with zipfile.ZipFile(archive) as zf:
        zf.extractall(tmp)
    roots = [path for path in tmp.iterdir() if path.is_dir()]
    if not roots:
        raise RuntimeError("GitHub zip did not contain a repository root.")
    return roots[0]


def find_root(explicit: str | None) -> Path | None:
    candidates: list[Path] = []
    if explicit:
        candidates.append(Path(explicit))
    candidates.append(DEFAULT_ROOT)
    downloads = Path.home() / "Downloads"
    if downloads.exists():
        candidates.extend(downloads.glob("awesome-gpt-image-2-API-and-Prompts-main*/**/README.md"))
    for candidate in candidates:
        root = candidate.expanduser().resolve()
        if root.is_file():
            root = root.parent
        if (root / "README.md").is_file() and (root / "cases").is_dir():
            return root
    return None


def infer_tags(prompt: str, table: dict[str, list[str]]) -> list[str]:
    text = prompt.casefold()
    tags = [tag for tag, terms in table.items() if any(term in text for term in terms)]
    return tags[:6]


def risk_flags(prompt: str) -> list[str]:
    return [name for name, pattern in RISK_PATTERNS.items() if pattern.search(prompt)]


def image_urls(segment: str) -> list[str]:
    urls = re.findall(r'<img\s+[^>]*src="([^"]+)"', segment, re.I)
    cleaned: list[str] = []
    for url in urls:
        url = url.strip()
        if url.startswith("../images/"):
            url = f"https://raw.githubusercontent.com/{REPO}/main/{url[3:]}"
        elif url.startswith("images/"):
            url = f"https://raw.githubusercontent.com/{REPO}/main/{url}"
        if url not in cleaned:
            cleaned.append(url)
    return cleaned


def parse_case_file(path: Path, root: Path) -> list[dict[str, Any]]:
    category_key = path.stem
    category = CATEGORY_LABELS.get(category_key, category_key.replace("-", " ").title())
    text = path.read_text(encoding="utf-8", errors="replace")
    heading = re.compile(
        r'^### Case\s+(\d+):\s+\[(.*?)\]\((.*?)\)\s+\(by\s+\[(.*?)\]\((.*?)\)\)',
        re.M,
    )
    matches = list(heading.finditer(text))
    cases: list[dict[str, Any]] = []
    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        segment = text[start:end]
        prompts = [
            prompt.strip()
            for prompt in re.findall(r'\*\*Prompt:\*\*\s*\n\s*```\s*\n(.*?)\n```', segment, re.S)
            if prompt.strip()
        ]
        if not prompts:
            continue
        prompt = "\n\n---\n\n".join(prompts)
        case_number, title, source_url, author, author_url = match.groups()
        image_list = image_urls(segment)
        case_id = f"evolink-api-{category_key}-{case_number}"
        source_anchor = f"{REPO_URL}/blob/main/cases/{path.name}#case-{case_number}"
        cases.append(
            {
                "id": case_id,
                "source": "evolink_api_prompts",
                "sourceId": f"{category_key}-{case_number}",
                "caseNumber": int(case_number),
                "categoryKey": category_key,
                "category": category,
                "title": title.strip(),
                "author": author.strip().lstrip("@"),
                "authorUrl": author_url.strip(),
                "sourceUrl": source_url.strip(),
                "galleryUrl": source_anchor,
                "images": image_list,
                "prompts": {"en": prompt},
                "promptPreview": compact(prompt),
                "styleTags": infer_tags(prompt, STYLE_KEYWORDS),
                "sceneTags": infer_tags(prompt, SCENE_KEYWORDS),
                "riskFlags": risk_flags(prompt),
                "promptHash": sha12(prompt),
                "language": "en",
            }
        )
    return cases


def existing_source_urls() -> set[str]:
    urls: set[str] = set()
    for name in (
        "cases.json",
        "youmind-public-cases.json",
        "awesome-readme-cases.json",
        "opennana-cases.json",
        "evolink-web-gallery-cases.json",
    ):
        path = REFERENCES_DIR / name
        if not path.is_file():
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except ValueError:
            continue
        for case in data.get("cases") or []:
            url = str(case.get("sourceUrl") or "").strip()
            if url:
                urls.add(url)
    return urls


def build_catalog(cases: list[dict[str, Any]], skipped: int) -> None:
    lines = [
        "# EvoLink API & Prompts Supplemental Catalog",
        "",
        f"Source: `{REPO_URL}`.",
        f"Imported cases: **{len(cases)}**. Skipped duplicate source URLs: **{skipped}**.",
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


def import_root(root: Path, keep_duplicates: bool) -> dict[str, Any]:
    cases: list[dict[str, Any]] = []
    for path in sorted((root / "cases").glob("*.md")):
        if "_" in path.stem:
            continue
        cases.extend(parse_case_file(path, root))

    seen_keys: set[tuple[str, str, str]] = set()
    duplicate_urls = existing_source_urls() if not keep_duplicates else set()
    deduped: list[dict[str, Any]] = []
    skipped = 0
    for case in cases:
        key = (
            str(case.get("sourceUrl") or ""),
            str(case.get("title") or "").casefold(),
            str(case.get("promptHash") or ""),
        )
        if key in seen_keys or (case.get("sourceUrl") and case["sourceUrl"] in duplicate_urls):
            skipped += 1
            continue
        seen_keys.add(key)
        deduped.append(case)

    payload = {
        "source": "evolink_api_prompts",
        "sourceRepository": REPO_URL,
        "fetchedAt": now_iso(),
        "importedCases": len(deduped),
        "skippedDuplicateSourceUrls": skipped,
        "cases": deduped,
    }
    REFERENCES_DIR.mkdir(parents=True, exist_ok=True)
    CASES_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    build_catalog(deduped, skipped)
    return payload


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", nargs="?", help="Path to awesome-gpt-image-2-API-and-Prompts repository root")
    parser.add_argument("--github-zip", action="store_true", help="Download and import the GitHub main branch zip")
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("--keep-duplicates", action="store_true", help="Do not skip source URLs already present in other cached datasets")
    args = parser.parse_args()

    temp_root: Path | None = None
    if args.github_zip:
        root = download_github_zip(args.timeout)
        temp_root = root.parent
    else:
        root = find_root(args.root)
        if root is None:
            raise SystemExit("EvoLink API prompts repository root was not found.")

    try:
        payload = import_root(root, args.keep_duplicates)
        print(
            "Imported {count} EvoLink API prompt cases; skipped {skipped} duplicate source URLs.".format(
                count=payload["importedCases"],
                skipped=payload["skippedDuplicateSourceUrls"],
            )
        )
    finally:
        if temp_root is not None:
            shutil.rmtree(temp_root, ignore_errors=True)


if __name__ == "__main__":
    main()
