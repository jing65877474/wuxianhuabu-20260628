#!/usr/bin/env python3
"""Search the awesome-gpt-image-2 README supplemental case library."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


SKILL_DIR = Path(__file__).resolve().parent.parent
CASES_FILE = SKILL_DIR / "references" / "awesome-readme-cases.json"


def normalize(value: object) -> str:
    return str(value or "").casefold()


def compact(value: str, limit: int = 420) -> str:
    value = re.sub(r"\s+", " ", value or "").strip()
    return value if len(value) <= limit else f"{value[: limit - 1]}..."


def case_text(case: dict) -> str:
    prompts = " ".join((case.get("prompts") or {}).values())
    titles = " ".join((case.get("titles") or {}).values())
    descriptions = " ".join((case.get("descriptions") or {}).values())
    values = [
        case.get("id"),
        case.get("sourceId"),
        case.get("title"),
        titles,
        descriptions,
        case.get("category"),
        " ".join(case.get("styleTags") or []),
        " ".join(case.get("sceneTags") or []),
        case.get("author"),
        prompts,
    ]
    return normalize(" ".join(str(value or "") for value in values))


def matches(case: dict, args: argparse.Namespace) -> bool:
    if args.id and normalize(args.id) not in {normalize(case.get("id")), normalize(case.get("sourceId"))}:
        return False
    if args.category and normalize(args.category) not in normalize(case.get("category")):
        return False
    if args.style and normalize(args.style) not in {normalize(tag) for tag in case.get("styleTags") or []}:
        return False
    if args.scene and normalize(args.scene) not in {normalize(tag) for tag in case.get("sceneTags") or []}:
        return False
    if args.language and args.language not in (case.get("prompts") or {}):
        return False
    text = case_text(case)
    return all(normalize(term) in text for term in args.query)


def render(case: dict, language: str | None, full_prompt: bool) -> str:
    prompts = case.get("prompts") or {}
    chosen_language = language if language in prompts else ("zh" if "zh" in prompts else "en")
    prompt = prompts.get(chosen_language) or next(iter(prompts.values()), "")
    if not full_prompt:
        prompt = compact(prompt)
    lines = [
        f"Case {case.get('id')}: {case.get('title', '')}",
        f"Category: {case.get('category', '')}",
        f"Styles: {', '.join(case.get('styleTags') or []) or 'None'}",
        f"Scenes: {', '.join(case.get('sceneTags') or []) or 'None'}",
        f"Prompt ({chosen_language or 'unknown'}): {prompt}",
    ]
    if case.get("images"):
        lines.append(f"Preview image: {case['images'][0]}")
    if case.get("galleryUrl"):
        lines.append(f"Gallery: {case['galleryUrl']}")
    if case.get("sourceUrl"):
        lines.append(f"Source: {case['sourceUrl']}")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("query", nargs="*", help="Keywords that must all match")
    parser.add_argument("--id", help="Exact ID such as awesome-readme-13460 or source ID 13460")
    parser.add_argument("--category", help="Category substring")
    parser.add_argument("--style", help="Exact inferred style tag")
    parser.add_argument("--scene", help="Exact inferred scene tag")
    parser.add_argument("--language", choices=("zh", "en"))
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--full-prompt", action="store_true")
    args = parser.parse_args()

    data = json.loads(CASES_FILE.read_text(encoding="utf-8"))
    results = [case for case in data.get("cases") or [] if matches(case, args)]
    results.sort(key=lambda item: int(item.get("sourceId") or item.get("readmeNumber") or 0), reverse=True)
    for case in results[: max(args.limit, 0)]:
        print(render(case, args.language, args.full_prompt))
        print()
    print(f"Matched {len(results)} case(s); displayed {min(len(results), args.limit)}.")


if __name__ == "__main__":
    main()
