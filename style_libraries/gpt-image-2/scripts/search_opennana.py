#!/usr/bin/env python3
"""Search the deduplicated OpenNana supplemental case library."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


SKILL_DIR = Path(__file__).resolve().parent.parent
CASES_FILE = SKILL_DIR / "references" / "opennana-cases.json"


def normalize(value: object) -> str:
    return str(value or "").casefold()


def case_text(case: dict) -> str:
    values = [
        case.get("id"),
        case.get("title"),
        case.get("category"),
        " ".join(case.get("tags") or []),
        case.get("creator"),
        " ".join((case.get("prompts") or {}).values()),
    ]
    return normalize(" ".join(str(value or "") for value in values))


def matches(case: dict, args: argparse.Namespace) -> bool:
    if args.id and normalize(args.id) != normalize(case.get("id")):
        return False
    if args.category and normalize(args.category) not in normalize(case.get("category")):
        return False
    if args.tag and normalize(args.tag) not in {normalize(tag) for tag in case.get("tags") or []}:
        return False
    if args.language and args.language not in (case.get("prompts") or {}):
        return False
    return all(normalize(term) in case_text(case) for term in args.query)


def compact(value: str, limit: int = 360) -> str:
    value = re.sub(r"\s+", " ", value or "").strip()
    return value if len(value) <= limit else f"{value[: limit - 1]}..."


def render(case: dict, language: str | None, full_prompt: bool) -> str:
    prompts = case.get("prompts") or {}
    chosen_language = language if language in prompts else ("zh" if "zh" in prompts else "en")
    prompt = prompts.get(chosen_language) or next(iter(prompts.values()), "")
    if not full_prompt:
        prompt = compact(prompt)
    lines = [
        f"Case {case.get('id')}: {case.get('title', '')}",
        f"Category: {case.get('category', '')}",
        f"Tags: {', '.join(case.get('tags') or []) or 'None'}",
        f"Creator: {case.get('creator') or 'Unknown'}",
        f"Prompt ({chosen_language or 'unknown'}): {prompt}",
    ]
    if case.get("images"):
        lines.append(f"Preview image: {case['images'][0]}")
    if case.get("sourceUrl"):
        lines.append(f"Source: {case['sourceUrl']}")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("query", nargs="*", help="Keywords that must all match")
    parser.add_argument("--id", help="Exact ID such as opennana-15875")
    parser.add_argument("--category", help="Category substring")
    parser.add_argument("--tag", help="Exact source tag")
    parser.add_argument("--language", choices=("zh", "en"))
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--full-prompt", action="store_true")
    args = parser.parse_args()

    data = json.loads(CASES_FILE.read_text(encoding="utf-8"))
    results = [case for case in data.get("cases") or [] if matches(case, args)]
    results.sort(key=lambda item: (item.get("updatedAt") or "", item.get("sourceId") or 0), reverse=True)
    for case in results[: max(args.limit, 0)]:
        print(render(case, args.language, args.full_prompt))
        print()
    print(f"Matched {len(results)} case(s); displayed {min(len(results), args.limit)}.")


if __name__ == "__main__":
    main()
