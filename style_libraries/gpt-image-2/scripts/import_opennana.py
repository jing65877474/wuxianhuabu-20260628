#!/usr/bin/env python3
"""Import and deduplicate the OpenNana ChatGPT prompt archive."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


SKILL_DIR = Path(__file__).resolve().parent.parent
PRIMARY_FILE = SKILL_DIR / "references" / "cases.json"
OUTPUT_FILE = SKILL_DIR / "references" / "opennana-cases.json"
CATALOG_FILE = SKILL_DIR / "references" / "opennana-catalog.md"

CATEGORY_RULES = [
    ("UI & Interfaces", ("ui", "界面", "网页", "网站", "app", "仪表盘", "dashboard", "截图")),
    ("Charts & Infographics", ("信息图", "infographic", "图解", "科普", "时间线", "timeline", "教程图")),
    ("Products & Commerce", ("产品", "电商", "商品", "包装", "product", "commercial", "广告", "主图")),
    ("Posters & Typography", ("海报", "poster", "封面", "cover", "campaign", "排版", "typography")),
    ("Brand & Identity", ("品牌", "logo", "标志", "brand", "identity", "视觉系统")),
    ("Photography & Portraits", ("人像", "写真", "摄影", "自拍", "portrait", "photo", "模特", "时尚")),
    ("Illustration & Characters", ("插画", "illustration", "动漫", "anime", "角色", "绘本", "水彩", "手绘")),
    ("Architecture & Spaces", ("建筑", "室内", "空间", "家居", "architecture", "interior", "城市")),
    ("Food & Drink", ("美食", "食品", "饮料", "咖啡", "餐厅", "food", "drink", "coffee")),
    ("Documents & Editorial", ("杂志", "报纸", "试卷", "文档", "document", "editorial", "说明书")),
]


def normalize(value: object) -> str:
    return re.sub(r"\s+", "", str(value or "")).casefold()


def compact(value: str, limit: int = 280) -> str:
    value = re.sub(r"\s+", " ", value or "").strip()
    return value if len(value) <= limit else f"{value[: limit - 1]}..."


def contains_term(haystack: str, term: str) -> bool:
    term = term.casefold()
    if term.isascii() and term.replace("-", "").isalnum():
        return re.search(rf"(?<![a-z0-9]){re.escape(term)}(?![a-z0-9])", haystack) is not None
    return term in haystack


def infer_category(item: dict) -> str:
    prompt_text = " ".join(str(p.get("text") or "")[:500] for p in item.get("prompts") or [])
    fields = [
        f"{item.get('title', '')} {' '.join(item.get('tags') or [])}".casefold(),
        prompt_text.casefold(),
    ]
    for haystack in fields:
        for category, terms in CATEGORY_RULES:
            if any(contains_term(haystack, term) for term in terms):
                return category
    return "General Visual Inspiration"


def load_primary_signatures() -> tuple[set[str], set[str]]:
    data = json.loads(PRIMARY_FILE.read_text(encoding="utf-8"))
    titles = {normalize(case.get("title")) for case in data.get("cases") or []}
    prompts = {normalize(case.get("prompt")) for case in data.get("cases") or []}
    return titles, prompts


def transform(source: dict) -> dict:
    primary_titles, primary_prompts = load_primary_signatures()
    source_items = source.get("items") or []
    source_latest = max(
        source_items,
        key=lambda item: (item.get("reviewed_at") or "", item.get("id") or 0),
        default={},
    )
    seen_titles: set[str] = set()
    seen_slugs: set[str] = set()
    cases: list[dict] = []
    skipped = {"primary_title": 0, "primary_prompt": 0, "duplicate_title": 0, "duplicate_slug": 0}

    for item in source_items:
        title_key = normalize(item.get("title"))
        slug = str(item.get("slug") or "")
        prompt_keys = {normalize(p.get("text")) for p in item.get("prompts") or [] if p.get("text")}

        if title_key in primary_titles:
            skipped["primary_title"] += 1
            continue
        if prompt_keys & primary_prompts:
            skipped["primary_prompt"] += 1
            continue
        if title_key and title_key in seen_titles:
            skipped["duplicate_title"] += 1
            continue
        if slug and slug in seen_slugs:
            skipped["duplicate_slug"] += 1
            continue

        seen_titles.add(title_key)
        seen_slugs.add(slug)
        prompts = {
            str(p.get("type") or p.get("lang") or "unknown"): str(p.get("text") or "")
            for p in item.get("prompts") or []
            if p.get("text")
        }
        preferred = prompts.get("zh") or prompts.get("en") or next(iter(prompts.values()), "")
        cases.append(
            {
                "id": f"opennana-{item.get('id')}",
                "sourceId": item.get("id"),
                "slug": slug,
                "title": item.get("title") or "",
                "category": infer_category(item),
                "tags": item.get("tags") or [],
                "promptPreview": compact(preferred),
                "prompts": prompts,
                "images": item.get("images") or [],
                "thumbnail": item.get("thumbnail") or "",
                "creator": item.get("source_name") or "",
                "creatorUrl": item.get("source_url") or "",
                "sourceUrl": item.get("url") or "",
                "createdAt": item.get("created_at") or "",
                "updatedAt": item.get("updated_at") or "",
            }
        )

    return {
        "source": source.get("source"),
        "apiBase": source.get("api_base"),
        "model": source.get("model"),
        "sourceFetchedAt": source.get("fetched_at"),
        "sourceTotal": int(source.get("total_archived") or len(source_items)),
        "sourceLatestId": source_latest.get("id"),
        "sourceLatestReviewedAt": source_latest.get("reviewed_at") or "",
        "importedCases": len(cases),
        "skipped": skipped,
        "cases": cases,
    }


def build_catalog(data: dict) -> None:
    lines = [
        "# OpenNana Supplemental Case Catalog",
        "",
        (
            "Secondary trend-oriented source for `gpt-image-2-style-library`. "
            f"Total deduplicated cases: **{len(data.get('cases') or [])}**. "
            "Use `scripts/search_opennana.py` for focused retrieval."
        ),
        "",
        "| ID | Title | Category | Tags | Updated |",
        "|---|---|---|---|---|",
    ]
    for case in data.get("cases") or []:
        values = [
            case.get("id"),
            case.get("title"),
            case.get("category"),
            ", ".join(case.get("tags") or []),
            str(case.get("updatedAt") or "")[:10],
        ]
        escaped = [str(value or "").replace("|", "\\|").replace("\n", " ") for value in values]
        lines.append(f"| {' | '.join(escaped)} |")
    CATALOG_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Path to OpenNana chatgpt-prompts.json")
    args = parser.parse_args()

    source = json.loads(args.source.read_text(encoding="utf-8"))
    output = transform(source)
    OUTPUT_FILE.write_text(
        json.dumps(output, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    build_catalog(output)
    print(f"Imported {output['importedCases']} cases to {OUTPUT_FILE}")
    print(f"Skipped: {json.dumps(output['skipped'], ensure_ascii=False)}")


if __name__ == "__main__":
    main()
