#!/usr/bin/env python3
"""Synchronize the complete AIArt.Pics website prompt library.

The website list endpoint exposes metadata in pages of 50 records. Full prompt
text is available only from the per-record detail endpoint, so details are
stored in an append-only JSONL cache for safe checkpointing and resumption.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import html
import json
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


SKILL_DIR = Path(__file__).resolve().parent.parent
REFERENCES_DIR = SKILL_DIR / "references"
CACHE_DIR = REFERENCES_DIR / ".cache"
OUTPUT_FILE = REFERENCES_DIR / "aiart-pics-cases.json"
CATALOG_FILE = REFERENCES_DIR / "aiart-pics-catalog.md"
DETAIL_CACHE_FILE = CACHE_DIR / "aiart-pics-details.jsonl"
METADATA_CACHE_FILE = CACHE_DIR / "aiart-pics-metadata.json"
LOCK_FILE = CACHE_DIR / "aiart-pics-sync.lock"
REPOSITORY = "https://github.com/Jermic/awesome-aiart-pics-prompts"
WEBSITE = "https://aiart.pics"
API_URL = f"{WEBSITE}/api/prompts"
IMAGE_BASE_URL = "https://img1.aiart.pics/"
COMMIT_API = "https://api.github.com/repos/Jermic/awesome-aiart-pics-prompts/commits/master"
RAW_README = (
    "https://raw.githubusercontent.com/Jermic/"
    "awesome-aiart-pics-prompts/master/README.md"
)
USER_AGENT = "Mozilla/5.0 Codex-Style-Library-AIArt-Pics-Sync/2.0"
PAGE_SIZE = 50

CASE_HEADING_RE = re.compile(
    r"^### \[([^\]]+)\]\((https://aiart\.pics/prompt/([^)]+))\)\s*$",
    re.MULTILINE,
)
FENCE_RE = re.compile(r"^```[^\n]*\n(.*?)^```\s*$", re.MULTILINE | re.DOTALL)
IMAGE_RE = re.compile(r'<img\s+src="([^"]+)"', re.IGNORECASE)
AUTHOR_RE = re.compile(r"\*\*作者\*\*:\s*\[@?([^\]]+)\]\(([^)]+)\)")
SOURCE_RE = re.compile(r"\*\*来源\*\*:\s*\[([^\]]+)\]\(([^)]+)\)")

CATEGORY_RULES = [
    ("UI & Interfaces", ("ui", "ux", "interface", "website", "landing page", "dashboard", "app screen")),
    ("Charts & Infographics", ("infographic", "chart", "diagram", "data visualization", "sankey", "flowchart")),
    ("Brand & Logos", ("logo", "brand identity", "branding", "visual identity", "packaging system")),
    ("Products & E-commerce", ("product photo", "product photography", "e-commerce", "ecommerce", "packaging", "commercial product")),
    ("Posters & Typography", ("poster", "typography", "key visual", "magazine cover", "book cover")),
    ("Architecture & Spaces", ("architecture", "interior", "building", "room design", "house design")),
    ("Photography & Realism", ("photography", "photo", "portrait", "cinematic shot", "realistic image")),
    ("Characters & People", ("character", "person", "woman", "man", "girl", "boy", "cosplay")),
    ("Illustration & Art", ("illustration", "anime", "manga", "watercolor", "painting", "sketch", "claymation")),
    ("Scenes & Storytelling", ("scene", "story", "storyboard", "comic", "film still")),
]

STYLE_RULES = {
    "Realistic": ("photorealistic", "realistic", "photography", "photo"),
    "Illustration": ("illustration", "watercolor", "painting", "sketch", "doodle"),
    "3D": ("3d", "render", "claymation", "miniature", "isometric"),
    "Poster": ("poster", "key visual", "cover", "typography"),
    "UI": ("ui", "ux", "interface", "website", "dashboard", "app screen"),
    "Brand": ("brand", "logo", "packaging", "identity"),
    "Character": ("character", "portrait", "woman", "man", "girl", "boy"),
    "Infographic": ("infographic", "chart", "diagram", "visualization"),
    "Architecture": ("architecture", "interior", "building", "room"),
}

SCENE_RULES = {
    "Commerce": ("product", "commercial", "e-commerce", "ecommerce", "advertising", "marketing", "packaging"),
    "Tech": ("technology", "tech", "ui", "dashboard", "app", "website", "futuristic"),
    "Fashion": ("fashion", "outfit", "editorial", "streetwear", "dress"),
    "Food": ("food", "restaurant", "drink", "coffee", "cake", "cuisine"),
    "Travel": ("travel", "city", "landscape", "tourism", "street"),
    "Education": ("education", "learning", "textbook", "science", "history", "infographic"),
    "Social": ("social media", "instagram", "x.com", "twitter", "sticker", "meme"),
    "Story": ("story", "storyboard", "comic", "manga", "film", "cinematic"),
}

PRINT_LOCK = threading.Lock()


def acquire_lock() -> bool:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    if LOCK_FILE.exists() and time.time() - LOCK_FILE.stat().st_mtime > 6 * 60 * 60:
        LOCK_FILE.unlink(missing_ok=True)
    try:
        descriptor = os.open(LOCK_FILE, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError:
        return False
    with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
        handle.write(f"{os.getpid()}\n{datetime.now().astimezone().isoformat()}\n")
    return True


def request_json(url: str, timeout: int, retries: int = 4) -> dict[str, Any]:
    delay = 1.0
    for attempt in range(retries):
        request = urllib.request.Request(
            url,
            headers={"Accept": "application/json", "User-Agent": USER_AGENT},
        )
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                if response.status < 200 or response.status >= 300:
                    raise RuntimeError(f"HTTP {response.status}: {url}")
                return json.loads(response.read().decode("utf-8"))
        except (OSError, ValueError, urllib.error.HTTPError) as error:
            if attempt + 1 >= retries:
                raise RuntimeError(f"{url}: {error}") from error
            time.sleep(delay)
            delay = min(delay * 2, 8)
    raise RuntimeError(f"Unable to fetch {url}")


def request_bytes(url: str, timeout: int) -> bytes:
    request = urllib.request.Request(url, headers={"Accept": "*/*", "User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read()


def read_json(path: Path, default: dict[str, Any]) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return default


def write_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(path)


def append_jsonl(path: Path, records: list[dict[str, Any]]) -> None:
    if not records:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8", newline="\n") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")


def load_detail_cache() -> dict[str, dict[str, Any]]:
    cached: dict[str, dict[str, Any]] = {}
    if not DETAIL_CACHE_FILE.is_file():
        return cached
    with DETAIL_CACHE_FILE.open("r", encoding="utf-8", errors="replace") as handle:
        for line in handle:
            try:
                item = json.loads(line)
            except ValueError:
                continue
            item_id = str(item.get("id") or "")
            if item_id:
                cached[item_id] = item
    return cached


def compact(value: str, limit: int = 420) -> str:
    value = re.sub(r"\s+", " ", value).strip()
    return value if len(value) <= limit else f"{value[: limit - 1]}..."


def unique(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        value = str(value or "").strip()
        if value and value not in seen:
            seen.add(value)
            result.append(value)
    return result


def localized(value: Any) -> str:
    if isinstance(value, dict):
        return str(value.get("zh") or value.get("en") or next(iter(value.values()), "") or "")
    return str(value or "")


def detect_language(value: str) -> str:
    chinese = len(re.findall(r"[\u4e00-\u9fff]", value))
    japanese = len(re.findall(r"[\u3040-\u30ff]", value))
    latin = len(re.findall(r"[A-Za-z]", value))
    if japanese > 20 and japanese > chinese:
        return "ja"
    if chinese > 20 and chinese >= latin * 0.12:
        return "zh"
    if latin > 20:
        return "en"
    return "multi"


def contains_keyword(text: str, keyword: str) -> bool:
    if re.fullmatch(r"[a-z0-9+-]+", keyword):
        return re.search(rf"(?<![a-z0-9]){re.escape(keyword)}(?![a-z0-9])", text) is not None
    return keyword in text


def classify_category(text: str) -> str:
    normalized = text.casefold()
    for category, needles in CATEGORY_RULES:
        if any(contains_keyword(normalized, needle) for needle in needles):
            return category
    return "Other Use Cases"


def infer_tags(text: str, rules: dict[str, tuple[str, ...]]) -> list[str]:
    normalized = text.casefold()
    return [
        tag
        for tag, needles in rules.items()
        if any(contains_keyword(normalized, needle) for needle in needles)
    ]


def absolute_media_url(path: str) -> str:
    if not path:
        return ""
    if path.startswith(("http://", "https://")):
        return path
    return urllib.parse.urljoin(IMAGE_BASE_URL, path.lstrip("/"))


def milliseconds_to_iso(value: Any) -> str:
    try:
        return datetime.fromtimestamp(int(value) / 1000, tz=timezone.utc).isoformat()
    except (TypeError, ValueError, OSError):
        return ""


def fetch_page(offset: int, timeout: int) -> dict[str, Any]:
    query = urllib.parse.urlencode({"limit": PAGE_SIZE, "offset": offset})
    return request_json(f"{API_URL}?{query}", timeout)


def fetch_all_metadata(timeout: int, workers: int) -> tuple[list[dict[str, Any]], int]:
    first = fetch_page(0, timeout)
    total = int(first.get("total") or 0)
    items = list(first.get("prompts") or [])
    offsets = list(range(PAGE_SIZE, total, PAGE_SIZE))

    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(fetch_page, offset, timeout): offset for offset in offsets}
        completed = 1
        for future in concurrent.futures.as_completed(futures):
            payload = future.result()
            items.extend(payload.get("prompts") or [])
            completed += 1
            if completed % 25 == 0 or completed == len(offsets) + 1:
                with PRINT_LOCK:
                    print(f"AIArt.Pics index pages: {completed}/{len(offsets) + 1}", flush=True)

    unique_items: dict[str, dict[str, Any]] = {}
    for item in items:
        item_id = str(item.get("id") or "")
        if item_id:
            unique_items[item_id] = item
    ordered = sorted(
        unique_items.values(),
        key=lambda item: int(item.get("createdAt") or 0),
        reverse=True,
    )
    return ordered, total


def fetch_detail(item_id: str, timeout: int) -> dict[str, Any]:
    payload = request_json(f"{API_URL}/{urllib.parse.quote(item_id)}", timeout)
    if not payload.get("success") or not isinstance(payload.get("data"), dict):
        raise RuntimeError(f"Invalid detail response for {item_id}")
    return payload["data"]


def fill_detail_cache(
    metadata: list[dict[str, Any]],
    cached: dict[str, dict[str, Any]],
    timeout: int,
    workers: int,
    checkpoint: int,
    max_details: int,
) -> tuple[dict[str, dict[str, Any]], list[str]]:
    missing = [str(item["id"]) for item in metadata if str(item["id"]) not in cached]
    if max_details > 0:
        missing = missing[:max_details]
    if not missing:
        return cached, []

    failures: list[str] = []
    pending_write: list[dict[str, Any]] = []
    completed = 0
    started = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(fetch_detail, item_id, timeout): item_id for item_id in missing}
        for future in concurrent.futures.as_completed(futures):
            item_id = futures[future]
            try:
                detail = future.result()
                cached[item_id] = detail
                pending_write.append(detail)
            except Exception as error:  # noqa: BLE001 - continue and retry next run.
                failures.append(item_id)
                with PRINT_LOCK:
                    print(f"AIArt.Pics detail failed {item_id}: {error}", flush=True)
            completed += 1
            if len(pending_write) >= checkpoint:
                append_jsonl(DETAIL_CACHE_FILE, pending_write)
                pending_write.clear()
            if completed % 100 == 0 or completed == len(missing):
                elapsed = max(time.time() - started, 0.1)
                rate = completed / elapsed
                remaining = (len(missing) - completed) / rate if rate else 0
                with PRINT_LOCK:
                    print(
                        f"AIArt.Pics details: {completed}/{len(missing)} "
                        f"({rate:.1f}/s, ETA {remaining / 60:.1f} min, failures {len(failures)})",
                        flush=True,
                    )
    append_jsonl(DETAIL_CACHE_FILE, pending_write)
    return cached, failures


def website_case(metadata: dict[str, Any], detail: dict[str, Any] | None) -> dict[str, Any]:
    merged = dict(metadata)
    if detail:
        merged.update(detail)
    item_id = str(merged.get("id") or "")
    title = localized(merged.get("title"))
    description = localized(merged.get("description"))
    prompts = unique([str(value) for value in merged.get("prompts") or []])
    prompt = "\n\n--- Alternative prompt ---\n\n".join(prompts)
    tags = unique([str(value) for value in merged.get("tags") or []])
    searchable = "\n".join([title, description, " ".join(tags), prompt])
    author = merged.get("author") if isinstance(merged.get("author"), dict) else {}
    images = [
        absolute_media_url(str(image.get("path") or image.get("sPath") or ""))
        for image in merged.get("images") or []
        if isinstance(image, dict)
    ]
    video_covers = [
        absolute_media_url(str(video.get("cover") or ""))
        for video in merged.get("videos") or []
        if isinstance(video, dict) and video.get("cover")
    ]
    return {
        "id": f"aiart-pics-{item_id}",
        "sourceId": item_id,
        "title": title,
        "description": description,
        "category": classify_category(searchable),
        "styleTags": infer_tags(searchable, STYLE_RULES),
        "sceneTags": infer_tags(searchable, SCENE_RULES),
        "sourceTags": tags,
        "prompt": prompt,
        "promptPreview": compact(prompt or description or " ".join(tags)),
        "language": detect_language(prompt or description or title),
        "model": str(merged.get("model") or ""),
        "mediaType": str(merged.get("mediaType") or "image"),
        "images": unique(images + video_covers),
        "referenceImages": [],
        "galleryUrl": f"{WEBSITE}/?prompt={item_id}",
        "sourceUrl": str(merged.get("originUrl") or author.get("url") or f"{WEBSITE}/?prompt={item_id}"),
        "author": str(author.get("name") or author.get("username") or ""),
        "authorUrl": str(author.get("url") or ""),
        "platform": str(merged.get("platform") or ""),
        "publishedAt": milliseconds_to_iso(merged.get("publishedAt")),
        "createdAt": milliseconds_to_iso(merged.get("createdAt")),
        "isFeatured": bool(merged.get("isFeatured")),
        "hasFullDetail": detail is not None,
        "license": "AIArt.Pics community content; preserve attribution and verify original creator rights",
        "attribution": (
            f"{author.get('name') or author.get('username')} via "
            f"{merged.get('originUrl') or author.get('url') or WEBSITE}"
        ).strip(),
    }


def render_catalog(data: dict[str, Any]) -> str:
    lines = [
        "# AIArt.Pics Prompt Catalog",
        "",
        f"- Source API: {data['sourceApi']}",
        f"- Website total: {data['sourceTotal']}",
        f"- Imported: {data['importedCases']}",
        f"- Full details: {data['detailCases']}",
        f"- Metadata only: {data['metadataOnlyCases']}",
        f"- Updated: {data['fetchedAt']}",
        "",
    ]
    for case in data["cases"]:
        lines.extend(
            [
                f"## {case['id']} - {case['title']}",
                f"- Category: {case['category']}",
                f"- Model: {case['model']}",
                f"- Media: {case['mediaType']}",
                f"- Styles: {', '.join(case['styleTags']) or 'None'}",
                f"- Author: {case['author'] or 'Unknown'}",
                f"- Gallery: {case['galleryUrl']}",
                f"- Prompt: {case['promptPreview']}",
                "",
            ]
        )
    return "\n".join(lines)


def fallback_readme_cases(timeout: int) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    readme_bytes = request_bytes(RAW_README, timeout)
    readme = readme_bytes.decode("utf-8")
    headings = list(CASE_HEADING_RE.finditer(readme))
    cases: list[dict[str, Any]] = []
    for index, heading in enumerate(headings):
        end = headings[index + 1].start() if index + 1 < len(headings) else len(readme)
        block = readme[heading.end() : end]
        prompt_parts = unique(
            [html.unescape(part.strip()) for part in FENCE_RE.findall(block) if part.strip()]
        )
        if not prompt_parts:
            continue
        title = html.unescape(heading.group(1).strip())
        gallery_url = heading.group(2)
        slug = heading.group(3)
        author_match = AUTHOR_RE.search(block)
        source_match = SOURCE_RE.search(block)
        author = html.unescape(author_match.group(1).strip()) if author_match else ""
        source_url = source_match.group(2).strip() if source_match else gallery_url
        prompt = "\n\n--- Alternative prompt ---\n\n".join(prompt_parts)
        searchable = f"{title}\n{prompt}"
        cases.append(
            {
                "id": f"aiart-pics-readme-{index + 1}-{slug}",
                "sourceId": f"readme-{index + 1}-{slug}",
                "title": title,
                "category": classify_category(searchable),
                "styleTags": infer_tags(searchable, STYLE_RULES),
                "sceneTags": infer_tags(searchable, SCENE_RULES),
                "prompt": prompt,
                "promptPreview": compact(prompt),
                "language": detect_language(prompt),
                "images": unique([html.unescape(url) for url in IMAGE_RE.findall(block)]),
                "referenceImages": [],
                "galleryUrl": gallery_url,
                "sourceUrl": source_url,
                "author": author,
                "hasFullDetail": True,
            }
        )
    commit = request_json(COMMIT_API, timeout)
    return cases, {
        "sourceCommit": commit.get("sha") or "",
        "sourceReadmeSha256": hashlib.sha256(readme_bytes).hexdigest(),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Re-fetch all details, not only missing IDs")
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("--workers", type=int, default=8, help="Concurrent website requests")
    parser.add_argument("--checkpoint", type=int, default=25, help="Details appended per cache checkpoint")
    parser.add_argument("--max-details", type=int, default=0, help="Limit detail requests for testing; 0 means all")
    parser.add_argument("--metadata-only", action="store_true", help="Refresh all metadata without detail calls")
    args = parser.parse_args()

    if not acquire_lock():
        print("AIArt.Pics synchronization is already running; using the current cache.")
        return 0

    workers = max(1, min(args.workers, 16))
    try:
        cached_details = {} if args.force else load_detail_cache()
        metadata, reported_total = fetch_all_metadata(args.timeout, workers)
        write_json(
            METADATA_CACHE_FILE,
            {
                "sourceApi": API_URL,
                "sourceTotal": reported_total,
                "fetchedAt": datetime.now().astimezone().isoformat(),
                "prompts": metadata,
            },
        )
        failures: list[str] = []
        if not args.metadata_only:
            cached_details, failures = fill_detail_cache(
                metadata,
                cached_details,
                args.timeout,
                workers,
                max(args.checkpoint, 1),
                args.max_details,
            )
        cases = [
            website_case(item, cached_details.get(str(item.get("id") or "")))
            for item in metadata
        ]
        detail_count = sum(bool(case.get("hasFullDetail")) for case in cases)
        data = {
            "source": "AIArt.Pics website API",
            "sourceApi": API_URL,
            "sourceWebsite": WEBSITE,
            "sourceRepositoryFallback": REPOSITORY,
            "sourceTotal": reported_total,
            "indexedUniqueCases": len(metadata),
            "importedCases": len(cases),
            "detailCases": detail_count,
            "metadataOnlyCases": len(cases) - detail_count,
            "failedDetailIds": failures,
            "fetchedAt": datetime.now().astimezone().isoformat(),
            "rightsNote": (
                "Preserve original creator attribution and verify rights before commercial reuse. "
                "The GitHub fallback advertises CC BY 4.0 for its collection."
            ),
            "cases": cases,
        }
        write_json(OUTPUT_FILE, data)
        CATALOG_FILE.write_text(render_catalog(data), encoding="utf-8")
        print(
            f"AIArt.Pics website sync complete: total={reported_total}, "
            f"indexed={len(metadata)}, details={detail_count}, "
            f"metadata_only={len(cases) - detail_count}.",
            flush=True,
        )
        return 0 if len(metadata) == reported_total and not failures else 2
    except Exception as error:  # noqa: BLE001 - keep existing cache or use README fallback.
        print(f"AIArt.Pics website API failed: {error}", flush=True)
        if OUTPUT_FILE.is_file():
            print("Keeping the existing AIArt.Pics cache.", flush=True)
            return 0
        cases, fallback = fallback_readme_cases(args.timeout)
        data = {
            "source": "AIArt.Pics GitHub README fallback",
            "sourceWebsite": WEBSITE,
            "sourceRepositoryFallback": REPOSITORY,
            "sourceTotal": len(cases),
            "indexedUniqueCases": len(cases),
            "importedCases": len(cases),
            "detailCases": len(cases),
            "metadataOnlyCases": 0,
            "fetchedAt": datetime.now().astimezone().isoformat(),
            "cases": cases,
            **fallback,
        }
        write_json(OUTPUT_FILE, data)
        CATALOG_FILE.write_text(render_catalog(data), encoding="utf-8")
        print(f"Imported {len(cases)} README fallback cases.", flush=True)
        return 0
    finally:
        LOCK_FILE.unlink(missing_ok=True)


if __name__ == "__main__":
    raise SystemExit(main())
