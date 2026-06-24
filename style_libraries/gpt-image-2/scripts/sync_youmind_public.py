#!/usr/bin/env python3
"""Sync GPT Image 2 prompt cases from the public YouMind web pagination API."""

from __future__ import annotations

import argparse
import json
import re
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path


SKILL_DIR = Path(__file__).resolve().parent.parent
OUTPUT_FILE = SKILL_DIR / "references" / "youmind-public-cases.json"
CATALOG_FILE = SKILL_DIR / "references" / "youmind-public-catalog.md"
API_URL = "https://youmind.com/youmarketing-api/prompts"
EXPLORE_URL = "https://youmind.com/zh-CN/gpt-image-2-prompts/explore?sortBy=views&sortOrder=desc"
USER_AGENT = "Mozilla/5.0 Codex-YouMind-Public-Sync/1.0"

CATEGORY_RULES = [
    ("Products & Commerce", ("product", "e-commerce", "commerce", "packaging", "广告", "商品", "主图", "产品")),
    ("Posters & Typography", ("poster", "flyer", "campaign", "typography", "cover", "海报", "字体", "封面")),
    ("UI & Interfaces", ("ui", "interface", "app", "web", "dashboard", "mockup", "界面", "网页", "应用")),
    ("Charts & Infographics", ("infographic", "diagram", "chart", "explainer", "map", "timeline", "信息图", "图解")),
    ("Brand & Identity", ("brand", "logo", "identity", "品牌", "标志", "视觉系统")),
    ("Photography & Portraits", ("photo", "photography", "portrait", "selfie", "model", "摄影", "人像")),
    ("Illustration & Characters", ("illustration", "anime", "manga", "comic", "character", "插画", "动漫", "角色")),
    ("Architecture & Spaces", ("architecture", "interior", "room", "cityscape", "建筑", "室内", "空间")),
    ("Food & Drink", ("food", "drink", "coffee", "restaurant", "食品", "饮料", "咖啡", "餐厅")),
    ("Documents & Editorial", ("document", "editorial", "magazine", "newspaper", "文档", "杂志", "报纸")),
]

STYLE_RULES = [
    ("3D render", ("3d", "render", "isometric", "cgi", "三维", "渲染")),
    ("cinematic", ("cinematic", "film still", "movie", "电影")),
    ("minimal", ("minimal", "clean", "simple", "white space", "极简", "留白")),
    ("editorial", ("editorial", "magazine", "layout", "编辑", "杂志", "排版")),
    ("infographic", ("infographic", "diagram", "callout", "explainer", "信息图", "图解")),
    ("photorealistic", ("photorealistic", "realistic", "photo", "lens", "studio lighting", "写实", "摄影")),
    ("illustration", ("illustration", "hand-drawn", "watercolor", "anime", "comic", "插画", "手绘", "水彩")),
    ("retro", ("retro", "vintage", "nostalgic", "复古")),
    ("sci-fi", ("sci-fi", "cyberpunk", "futuristic", "high-tech", "科幻", "赛博")),
]

SCENE_RULES = [
    ("studio", ("studio", "seamless background", "product shot", "摄影棚", "棚拍")),
    ("lifestyle", ("lifestyle", "home", "daily", "person", "model", "生活方式", "居家")),
    ("commercial", ("commercial", "advertising", "campaign", "e-commerce", "广告", "电商")),
    ("interface", ("ui", "interface", "screen", "dashboard", "界面", "屏幕")),
    ("exploded view", ("exploded view", "component", "callout", "爆炸图", "标注")),
    ("map", ("map", "city", "route", "landmark", "地图", "城市")),
]


def compact(value: str, limit: int = 320) -> str:
    value = re.sub(r"\s+", " ", value or "").strip()
    return value if len(value) <= limit else f"{value[: limit - 1]}..."


def markdown_escape(value: object) -> str:
    return str(value or "").replace("|", "\\|").replace("\n", " ")


def category_values(raw_categories: object) -> list[str]:
    values: list[str] = []
    if not isinstance(raw_categories, list):
        return values
    for item in raw_categories:
        if isinstance(item, str):
            values.append(item)
        elif isinstance(item, dict):
            for key in ("name", "title", "slug", "label"):
                if item.get(key):
                    values.append(str(item[key]))
                    break
    return values


def infer_tags(title: str, prompt: str, rules: list[tuple[str, tuple[str, ...]]]) -> list[str]:
    haystack = f"{title} {prompt[:1600]}".casefold()
    return [label for label, terms in rules if any(term.casefold() in haystack for term in terms)]


def infer_category(item: dict) -> str:
    source_categories = category_values(item.get("promptCategories"))
    if source_categories:
        return source_categories[0]
    title = str(item.get("title") or "")
    prompt = str(item.get("translatedContent") or item.get("content") or "")
    tags = infer_tags(title, prompt, CATEGORY_RULES)
    return tags[0] if tags else "General Visual Inspiration"


def request_json(body: dict, timeout: int, attempts: int = 4) -> dict:
    payload = json.dumps(body, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        API_URL,
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": USER_AGENT,
            "Referer": EXPLORE_URL,
            "Origin": "https://youmind.com",
        },
    )
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                if response.status < 200 or response.status >= 300:
                    raise RuntimeError(f"HTTP {response.status}")
                return json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, RuntimeError, ValueError) as error:
            last_error = error
            if attempt < attempts:
                time.sleep(min(attempt * 1.5, 6))
    raise RuntimeError(str(last_error))


def page_body(page: int, limit: int, locale: str, sort_by: str, sort_order: str) -> dict:
    return {
        "model": "gpt-image-2",
        "page": page,
        "limit": limit,
        "locale": locale,
        "q": "",
        "categories": None,
        "campaign": None,
        "filterMode": "all",
        "searchMode": "semantic",
        "sortBy": sort_by,
        "sortOrder": sort_order,
    }


def transform_item(item: dict) -> dict:
    source_id = item.get("id")
    prompt = str(item.get("content") or "")
    translated = str(item.get("translatedContent") or "")
    preferred = translated or prompt
    title = str(item.get("title") or "")
    description = str(item.get("description") or "")
    author = item.get("author") if isinstance(item.get("author"), dict) else {}
    category = infer_category(item)
    style_tags = infer_tags(title, preferred, STYLE_RULES)
    scene_tags = infer_tags(title, preferred, SCENE_RULES)
    slug = str(item.get("slug") or "")
    gallery_url = f"https://youmind.com/zh-CN/gpt-image-2-prompts?id={source_id}" if source_id else ""

    prompts = {}
    if prompt:
        prompts[str(item.get("language") or "source")] = prompt
    if translated:
        prompts["zh"] = translated

    return {
        "id": f"youmind-{source_id}",
        "sourceId": source_id,
        "source": "youmind_public",
        "slug": slug,
        "title": title,
        "description": description,
        "category": category,
        "sourceCategories": category_values(item.get("promptCategories")),
        "styleTags": style_tags,
        "sceneTags": scene_tags,
        "promptPreview": compact(preferred),
        "prompts": prompts,
        "language": item.get("language") or "",
        "images": item.get("media") or [],
        "thumbnails": item.get("mediaThumbnails") or [],
        "referenceImages": item.get("referenceImages") or [],
        "needReferenceImages": bool(item.get("needReferenceImages")),
        "author": author.get("name") or "",
        "authorUrl": author.get("link") or "",
        "sourceUrl": item.get("sourceLink") or "",
        "sourcePlatform": item.get("sourcePlatform") or "",
        "galleryUrl": gallery_url,
        "published": item.get("sourcePublishedAt") or "",
        "likes": item.get("likes") or 0,
        "resultsCount": item.get("resultsCount") or 0,
    }


def sync(args: argparse.Namespace) -> dict:
    first = request_json(page_body(1, args.limit, args.locale, args.sort_by, args.sort_order), args.timeout)
    total = int(first.get("total") or 0)
    total_pages = int(first.get("totalPages") or 1)
    first_page_ids = [item.get("id") for item in (first.get("prompts") or [])[:12]]
    if args.max_pages:
        total_pages = min(total_pages, args.max_pages)

    items_by_id: dict[str, dict] = {}
    pages_fetched = 0
    for page in range(1, total_pages + 1):
        payload = first if page == 1 else request_json(
            page_body(page, args.limit, args.locale, args.sort_by, args.sort_order),
            args.timeout,
        )
        pages_fetched += 1
        for item in payload.get("prompts") or []:
            if item.get("id") is None:
                continue
            items_by_id[str(item["id"])] = transform_item(item)
        if args.verbose:
            print(f"Fetched page {page}/{total_pages}; cases={len(items_by_id)}")
        if page < total_pages and args.delay > 0:
            time.sleep(args.delay)

    cases = list(items_by_id.values())
    cases.sort(key=lambda case: int(case.get("sourceId") or 0), reverse=True)
    return {
        "source": "YouMind public GPT Image 2 prompt web API",
        "apiUrl": API_URL,
        "exploreUrl": EXPLORE_URL,
        "model": "gpt-image-2",
        "locale": args.locale,
        "sortBy": args.sort_by,
        "sortOrder": args.sort_order,
        "limit": args.limit,
        "sourceTotal": total,
        "sourceTotalPages": int(first.get("totalPages") or total_pages),
        "firstPageIds": first_page_ids,
        "pagesFetched": pages_fetched,
        "importedCases": len(cases),
        "fetchedAt": datetime.now().astimezone().isoformat(),
        "note": "Public front-end pagination API. If the website changes this endpoint, keep using the cached library.",
        "cases": cases,
    }


def build_catalog(data: dict) -> None:
    lines = [
        "# YouMind Public GPT Image 2 Case Catalog",
        "",
        (
            "Supplemental public web source for `gpt-image-2-style-library`. "
            f"Imported cases: **{data.get('importedCases', 0)}** of reported "
            f"**{data.get('sourceTotal', 0)}**. "
            "Use `scripts/search_youmind_public.py` for focused retrieval."
        ),
        "",
        "Source: https://youmind.com/zh-CN/gpt-image-2-prompts/explore?sortBy=views&sortOrder=desc",
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
            str(case.get("published") or "")[:10],
        ]
        lines.append(f"| {' | '.join(markdown_escape(value) for value in values)} |")
    CATALOG_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=100, help="Page size; tested up to 100")
    parser.add_argument("--max-pages", type=int, help="Debug cap for partial sync")
    parser.add_argument("--locale", default="zh-CN")
    parser.add_argument("--sort-by", default="views")
    parser.add_argument("--sort-order", default="desc")
    parser.add_argument("--delay", type=float, default=0.15, help="Delay between page requests")
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    data = sync(args)
    OUTPUT_FILE.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    build_catalog(data)
    print(
        f"Imported {data['importedCases']} YouMind public cases "
        f"from {data['pagesFetched']} page(s); reported total {data['sourceTotal']}."
    )


if __name__ == "__main__":
    main()
