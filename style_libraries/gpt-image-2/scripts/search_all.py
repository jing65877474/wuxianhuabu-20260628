#!/usr/bin/env python3
"""Rank local GPT-Image2 style-library cases across bundled datasets.

Optimized behavior:
- smart query tokenization for quoted long queries
- soft matching with minimum hit thresholds instead of requiring every token
- phrase, title, tag, category, and coverage based scoring
- optional strict-all mode for legacy behavior
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")


SKILL_DIR = Path(__file__).resolve().parent.parent
REFERENCES_DIR = SKILL_DIR / "references"


DATASET_FILES = {
    "curated": REFERENCES_DIR / "cases.json",
    "youmind_public": REFERENCES_DIR / "youmind-public-cases.json",
    "awesome_readme": REFERENCES_DIR / "awesome-readme-cases.json",
    "aiart_pics": REFERENCES_DIR / "aiart-pics-cases.json",
    "opennana": REFERENCES_DIR / "opennana-cases.json",
    "evolink_api_prompts": REFERENCES_DIR / "evolink-api-prompts-cases.json",
    "evolink_web_gallery": REFERENCES_DIR / "evolink-web-gallery-cases.json",
}

SOURCE_PRIORITY = {
    "curated": 0,
    "youmind_public": 1,
    "awesome_readme": 2,
    "aiart_pics": 3,
    "opennana": 4,
    "evolink_api_prompts": 5,
    "evolink_web_gallery": 6,
}

RISK_PATTERNS = [
    ("licensed_name_or_brand", re.compile(r"\b(?:fifa|messi|lionel messi|sam altman|rolls[- ]royce|vogue|nike|adidas|disney|marvel|coca[- ]cola|pepsi|sprite|chanel|dior|tesla|apple|iphone|starbucks|mcdonald|kfc|lego)\b", re.I)),
    ("watermark_or_signature", re.compile(r"\b(?:watermark|signature|signed by|artist signature)\b", re.I)),
    ("unsupported_quality_claim", re.compile(r"\b(?:official|award[- ]winning|guaranteed|masterpiece|best quality)\b", re.I)),
]

COMPOSITION_TERMS = {
    "composition",
    "layout",
    "poster",
    "kv",
    "grid",
    "bento",
    "hero",
    "flat lay",
    "close-up",
    "macro",
    "portrait",
    "full-body",
    "editorial",
    "low angle",
    "high angle",
    "wide angle",
}

STOPWORDS = {
    "a", "an", "and", "as", "at", "be", "by", "for", "from", "in", "into", "is", "it",
    "of", "on", "or", "same", "the", "to", "with", "without", "use", "using", "look",
    "style", "image", "images", "visual", "shot", "this", "that", "these", "those",
}


@dataclass(frozen=True)
class QueryBundle:
    raw_segments: tuple[str, ...]
    phrases: tuple[str, ...]
    terms: tuple[str, ...]
    min_hits: int


@dataclass(frozen=True)
class NormalizedCase:
    dataset: str
    source: str
    source_priority: int
    case_id: str
    source_id: str
    title: str
    category: str
    style_tags: tuple[str, ...]
    scene_tags: tuple[str, ...]
    prompt: str
    prompt_preview: str
    language: str
    images: tuple[str, ...]
    reference_images: tuple[str, ...]
    gallery_url: str
    source_url: str
    raw: dict[str, Any]


def normalize(value: object) -> str:
    return str(value or "").casefold()


def compact(value: str, limit: int = 420) -> str:
    value = re.sub(r"\s+", " ", value or "").strip()
    return value if len(value) <= limit else f"{value[: limit - 1]}..."


def listify(value: Any) -> tuple[str, ...]:
    if isinstance(value, list):
        return tuple(str(item) for item in value if item)
    if value:
        return (str(value),)
    return ()


def choose_prompt(case: dict[str, Any], language: str | None) -> tuple[str, str]:
    prompts = case.get("prompts")
    if isinstance(prompts, dict) and prompts:
        chosen_language = language if language in prompts else ("zh" if "zh" in prompts else case.get("language"))
        prompt = prompts.get(chosen_language) or next(iter(prompts.values()), "")
        return str(prompt or ""), str(chosen_language or "")
    return str(case.get("prompt") or ""), str(case.get("language") or "")


def normalize_case(dataset: str, case: dict[str, Any], language: str | None) -> NormalizedCase:
    prompt, chosen_language = choose_prompt(case, language)
    if dataset == "curated":
        case_id = str(case.get("id") or "")
        source = "curated"
        style_tags = listify(case.get("styles"))
        scene_tags = listify(case.get("scenes"))
        images = listify(case.get("image"))
        source_url = str(case.get("githubUrl") or case.get("sourceUrl") or "")
        gallery_url = ""
    elif dataset == "opennana":
        case_id = str(case.get("id") or "")
        source = "supplemental"
        style_tags = listify(case.get("tags"))
        scene_tags = ()
        images = listify(case.get("images") or case.get("thumbnail"))
        source_url = str(case.get("sourceUrl") or "")
        gallery_url = ""
    else:
        case_id = str(case.get("id") or "")
        source = "youmind_public" if dataset == "youmind_public" else "supplemental"
        style_tags = listify(case.get("styleTags"))
        scene_tags = listify(case.get("sceneTags"))
        images = listify(case.get("images") or case.get("thumbnails"))
        source_url = str(case.get("sourceUrl") or "")
        gallery_url = str(case.get("galleryUrl") or "")

    return NormalizedCase(
        dataset=dataset,
        source=source,
        source_priority=SOURCE_PRIORITY[dataset],
        case_id=case_id,
        source_id=str(case.get("sourceId") or case.get("readmeNumber") or case.get("id") or ""),
        title=str(case.get("title") or ""),
        category=str(case.get("category") or ""),
        style_tags=style_tags,
        scene_tags=scene_tags,
        prompt=prompt,
        prompt_preview=str(case.get("promptPreview") or compact(prompt)),
        language=chosen_language,
        images=images,
        reference_images=listify(case.get("referenceImages")),
        gallery_url=gallery_url,
        source_url=source_url,
        raw=case,
    )


def searchable_text(case: NormalizedCase) -> str:
    return normalize(
        " ".join(
            [
                case.case_id,
                case.source_id,
                case.title,
                case.category,
                " ".join(case.style_tags),
                " ".join(case.scene_tags),
                case.prompt_preview,
                case.prompt,
                case.source_url,
                case.gallery_url,
            ]
        )
    )


def tag_matches(needle: str | None, tags: tuple[str, ...]) -> bool:
    if not needle:
        return True
    normalized_needle = normalize(needle)
    return normalized_needle in {normalize(tag) for tag in tags}


def contains(value: str, needle: str | None) -> bool:
    return not needle or normalize(needle) in normalize(value)


def dedupe_keep_order(values: list[str]) -> tuple[str, ...]:
    seen: set[str] = set()
    output: list[str] = []
    for value in values:
        if value and value not in seen:
            seen.add(value)
            output.append(value)
    return tuple(output)


def build_query_bundle(raw_query: list[str]) -> QueryBundle:
    raw_segments = [segment.strip() for segment in raw_query if segment and segment.strip()]
    phrases: list[str] = []
    terms: list[str] = []

    for segment in raw_segments:
        normalized_segment = normalize(segment)
        if " " in normalized_segment:
            phrases.append(normalized_segment)
        split_terms = re.findall(r"[\w+-]+", normalized_segment)
        for token in split_terms:
            token = token.strip("+-_")
            if len(token) < 2 or token in STOPWORDS:
                continue
            terms.append(token)

    unique_terms = dedupe_keep_order(terms)
    unique_phrases = dedupe_keep_order(phrases)

    if not unique_terms:
        min_hits = 0
    elif len(unique_terms) <= 2:
        min_hits = 1
    elif len(unique_terms) <= 5:
        min_hits = 2
    else:
        min_hits = 3

    return QueryBundle(
        raw_segments=tuple(raw_segments),
        phrases=unique_phrases,
        terms=unique_terms,
        min_hits=min_hits,
    )


def term_coverage(bundle: QueryBundle, text: str) -> tuple[list[str], list[str]]:
    hits = [term for term in bundle.terms if term in text]
    phrase_hits = [phrase for phrase in bundle.phrases if phrase in text]
    return hits, phrase_hits


def matches(case: NormalizedCase, args: argparse.Namespace, bundle: QueryBundle) -> bool:
    if args.id:
        accepted_ids = {normalize(case.case_id), normalize(case.source_id)}
        if normalize(args.id) not in accepted_ids:
            return False
    if not contains(case.category, args.category):
        return False
    if not tag_matches(args.style, case.style_tags):
        return False
    if args.scene and not tag_matches(args.scene, case.scene_tags):
        return False
    if args.language and args.language != case.language and args.language not in (case.raw.get("prompts") or {}):
        return False
    if args.needs_reference and not case.reference_images:
        return False

    text = searchable_text(case)
    if not bundle.terms and not bundle.phrases:
        return True

    hits, phrase_hits = term_coverage(bundle, text)
    if args.strict_all:
        return all(term in text for term in bundle.terms) and all(phrase in text for phrase in bundle.phrases)

    if phrase_hits:
        return True
    return len(hits) >= bundle.min_hits


def score_case(case: NormalizedCase, args: argparse.Namespace, bundle: QueryBundle) -> tuple[int, list[str]]:
    text = searchable_text(case)
    title_text = normalize(case.title)
    category_text = normalize(case.category)
    style_text = normalize(" ".join(case.style_tags))
    scene_text = normalize(" ".join(case.scene_tags))
    title_and_prompt = normalize(f"{case.title} {case.prompt_preview} {case.prompt}")

    reasons: list[str] = []
    score = 0

    hits, phrase_hits = term_coverage(bundle, text)
    if hits:
        coverage_score = min(30, len(hits) * 6)
        score += coverage_score
        reasons.append(f"coverage:{len(hits)}/{len(bundle.terms)}")
    if phrase_hits:
        phrase_score = min(24, len(phrase_hits) * 12)
        score += phrase_score
        reasons.append("phrase")

    if args.category and contains(case.category, args.category):
        score += 35
        reasons.append("category")
    elif any(term in category_text for term in bundle.terms):
        score += 16
        reasons.append("category-query")

    if args.style and tag_matches(args.style, case.style_tags):
        score += 25
        reasons.append("style")
    elif any(term in style_text for term in bundle.terms):
        score += 14
        reasons.append("style-query")

    if args.scene and tag_matches(args.scene, case.scene_tags):
        score += 15
        reasons.append("scene")
    elif any(term in scene_text for term in bundle.terms):
        score += 10
        reasons.append("scene-query")

    commerce_terms = {"product", "products", "commerce", "commercial", "ecommerce", "skincare", "beauty", "cosmetic", "cosmetics"}
    portrait_terms = {"portrait", "portraits", "editorial"}
    if any(term in commerce_terms for term in bundle.terms):
        if "product" in category_text or "commerce" in category_text:
            score += 18
            reasons.append("intent:commerce")
        if "commercial" in scene_text:
            score += 6
            reasons.append("intent:commercial-scene")
    if any(term in portrait_terms for term in bundle.terms):
        if "portrait" in category_text:
            score += 10
            reasons.append("intent:portrait")

    title_hits = sum(1 for term in bundle.terms if term in title_text)
    if title_hits:
        title_score = min(18, title_hits * 6)
        score += title_score
        reasons.append(f"title:{title_hits}")

    subject_hits = sum(1 for term in bundle.terms if term in title_and_prompt)
    if subject_hits:
        subject_score = min(18, subject_hits * 4)
        score += subject_score
        reasons.append(f"subject:{subject_hits}")

    if any(term in text for term in COMPOSITION_TERMS) and any(term in text for term in bundle.terms):
        score += 8
        reasons.append("composition")

    if case.reference_images:
        score += 4
        reasons.append("has-reference")
    if case.images:
        score += 2
        reasons.append("has-preview")

    if args.id and normalize(args.id) in {normalize(case.case_id), normalize(case.source_id)}:
        score += 100
        reasons.append("exact-id")

    # Slight source preference so curated results stay ahead when relevance is similar.
    score += max(0, 6 - case.source_priority)

    return score, reasons


def risk_flags(text: str) -> list[str]:
    flags: list[str] = []
    for name, pattern in RISK_PATTERNS:
        if pattern.search(text):
            flags.append(name)
    return flags


def safe_prompt_preview(prompt: str, raw: bool, full_prompt: bool) -> str:
    value = prompt if full_prompt else compact(prompt)
    if raw:
        return value
    for _, pattern in RISK_PATTERNS[:1]:
        value = pattern.sub("[licensed name or brand removed]", value)
    return value


def numeric_sort_key(value: str) -> int:
    match = re.search(r"\d+", value or "")
    return int(match.group(0)) if match else 0


def load_cases(datasets: list[str], language: str | None) -> list[NormalizedCase]:
    cases: list[NormalizedCase] = []
    for dataset in datasets:
        path = DATASET_FILES[dataset]
        if not path.is_file():
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        cases.extend(normalize_case(dataset, item, language) for item in data.get("cases") or [])
    return cases


def render_text(case: NormalizedCase, score: int, reasons: list[str], args: argparse.Namespace) -> str:
    source_detail = f"{case.source}/{case.dataset}"
    lines = [
        f"Case {case.case_id} [{source_detail}] score={score}",
        f"Title: {case.title}",
        f"Category: {case.category}",
        f"Styles: {', '.join(case.style_tags) or 'None'}",
        f"Scenes: {', '.join(case.scene_tags) or 'None'}",
        f"Reason: {', '.join(reasons) or 'source-priority'}",
    ]
    prompt = case.prompt if args.full_prompt else case.prompt_preview
    flags = risk_flags(prompt)
    if flags and not args.raw:
        lines.append(f"Cleanup flags: {', '.join(flags)}")
    lines.append(f"Prompt ({case.language or 'unknown'}): {safe_prompt_preview(prompt, args.raw, args.full_prompt)}")
    if case.images:
        lines.append(f"Preview image: {case.images[0]}")
    if case.reference_images:
        lines.append(f"Reference image: {case.reference_images[0]}")
    if case.gallery_url:
        lines.append(f"Gallery: {case.gallery_url}")
    if case.source_url:
        lines.append(f"Source: {case.source_url}")
    return "\n".join(lines)


def render_json(results: list[tuple[NormalizedCase, int, list[str]]], args: argparse.Namespace) -> str:
    payload = []
    for case, score, reasons in results:
        prompt = case.prompt if args.full_prompt else case.prompt_preview
        payload.append(
            {
                "case_id": case.case_id,
                "source": case.source,
                "dataset": case.dataset,
                "score": score,
                "reasons": reasons,
                "title": case.title,
                "category": case.category,
                "style_tags": list(case.style_tags),
                "scene_tags": list(case.scene_tags),
                "language": case.language,
                "cleanup_flags": risk_flags(prompt),
                "prompt": safe_prompt_preview(prompt, args.raw, args.full_prompt),
                "preview_image": case.images[0] if case.images else "",
                "reference_image": case.reference_images[0] if case.reference_images else "",
                "gallery_url": case.gallery_url,
                "source_url": case.source_url,
            }
        )
    return json.dumps(payload, ensure_ascii=False, indent=2)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("query", nargs="*", help="Search keywords or a quoted long query")
    parser.add_argument("--id", help="Exact case ID or source ID")
    parser.add_argument("--category", help="Category substring")
    parser.add_argument("--style", help="Exact style tag")
    parser.add_argument("--scene", help="Exact scene tag")
    parser.add_argument("--language", help="Prompt language key, for example zh, en, ja")
    parser.add_argument("--needs-reference", action="store_true")
    parser.add_argument(
        "--source",
        action="append",
        choices=tuple(DATASET_FILES),
        help="Dataset to search. Repeat to combine. Defaults to all local datasets.",
    )
    parser.add_argument("--limit", type=int, default=8)
    parser.add_argument("--full-prompt", action="store_true")
    parser.add_argument("--raw", action="store_true", help="Return original prompt text without lightweight redaction")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON")
    parser.add_argument("--strict-all", action="store_true", help="Legacy mode: require every query term to match")
    args = parser.parse_args()

    bundle = build_query_bundle(args.query)
    datasets = args.source or list(DATASET_FILES)
    cases = load_cases(datasets, args.language)
    scored = []
    for case in cases:
        if matches(case, args, bundle):
            score, reasons = score_case(case, args, bundle)
            scored.append((case, score, reasons))

    scored.sort(
        key=lambda item: (
            -item[1],
            item[0].source_priority,
            -numeric_sort_key(item[0].source_id),
        )
    )
    displayed = scored[: max(args.limit, 0)]

    if args.json:
        print(render_json(displayed, args))
        return

    for case, score, reasons in displayed:
        print(render_text(case, score, reasons, args))
        print()
    print(f"Matched {len(scored)} case(s); displayed {min(len(scored), args.limit)}.")


if __name__ == "__main__":
    main()
