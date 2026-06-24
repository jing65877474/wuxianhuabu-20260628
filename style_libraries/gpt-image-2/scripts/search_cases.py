#!/usr/bin/env python3
"""Search and index the bundled awesome-gpt-image-2 case catalog."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


SKILL_DIR = Path(__file__).resolve().parent.parent
CASES_FILE = SKILL_DIR / "references" / "cases.json"
INDEX_FILE = SKILL_DIR / "references" / "case-catalog.md"


def load_data() -> dict:
    return json.loads(CASES_FILE.read_text(encoding="utf-8"))


def normalized(value: object) -> str:
    return str(value or "").casefold()


def case_text(case: dict) -> str:
    values = [
        case.get("id"),
        case.get("title"),
        case.get("imageAlt"),
        case.get("prompt"),
        case.get("promptPreview"),
        case.get("category"),
        " ".join(case.get("styles") or []),
        " ".join(case.get("scenes") or []),
    ]
    return normalized(" ".join(str(value or "") for value in values))


def matches(case: dict, args: argparse.Namespace) -> bool:
    if args.id is not None and int(case.get("id", -1)) != args.id:
        return False
    if args.category and normalized(args.category) not in normalized(case.get("category")):
        return False
    if args.style and normalized(args.style) not in {
        normalized(value) for value in case.get("styles") or []
    }:
        return False
    if args.scene and normalized(args.scene) not in {
        normalized(value) for value in case.get("scenes") or []
    }:
        return False
    terms = [normalized(term) for term in args.query]
    text = case_text(case)
    return all(term in text for term in terms)


def compact(value: str, limit: int = 240) -> str:
    value = re.sub(r"\s+", " ", value or "").strip()
    return value if len(value) <= limit else f"{value[: limit - 1]}..."


def render_case(case: dict, full_prompt: bool) -> str:
    lines = [
        f"Case {case['id']}: {case.get('title', '')}",
        f"Category: {case.get('category', '')}",
        f"Styles: {', '.join(case.get('styles') or []) or 'None'}",
        f"Scenes: {', '.join(case.get('scenes') or []) or 'None'}",
    ]
    prompt = case.get("prompt") if full_prompt else case.get("promptPreview")
    lines.append(f"Prompt: {prompt or ''}")
    if case.get("githubUrl"):
        lines.append(f"Source: {case['githubUrl']}")
    return "\n".join(lines)


def build_index(data: dict) -> None:
    cases = sorted(data.get("cases") or [], key=lambda item: int(item["id"]))
    lines = [
        "# GPT-Image2 Complete Case Catalog",
        "",
        (
            f"Source dataset: `references/cases.json`. Total cases: "
            f"**{len(cases)}**. Search full prompts with `scripts/search_cases.py`."
        ),
        "",
        "| ID | Title | Category | Styles | Scenes |",
        "|---:|---|---|---|---|",
    ]
    for case in cases:
        title = str(case.get("title") or "").replace("|", "\\|")
        category = str(case.get("category") or "").replace("|", "\\|")
        styles = ", ".join(case.get("styles") or []).replace("|", "\\|")
        scenes = ", ".join(case.get("scenes") or []).replace("|", "\\|")
        lines.append(f"| {case['id']} | {title} | {category} | {styles} | {scenes} |")
    INDEX_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Built {INDEX_FILE} with {len(cases)} cases.")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("query", nargs="*", help="Keywords that must all match")
    parser.add_argument("--id", type=int, help="Exact case ID")
    parser.add_argument("--category", help="Category substring")
    parser.add_argument("--style", help="Exact style tag")
    parser.add_argument("--scene", help="Exact scene tag")
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--full-prompt", action="store_true")
    parser.add_argument("--build-index", action="store_true")
    args = parser.parse_args()

    data = load_data()
    if args.build_index:
        build_index(data)
        return

    results = [case for case in data.get("cases") or [] if matches(case, args)]
    results.sort(key=lambda item: int(item["id"]), reverse=True)
    for case in results[: max(args.limit, 0)]:
        print(render_case(case, args.full_prompt))
        print()
    print(f"Matched {len(results)} case(s); displayed {min(len(results), args.limit)}.")


if __name__ == "__main__":
    main()
