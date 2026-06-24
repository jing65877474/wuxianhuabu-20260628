#!/usr/bin/env python3
"""Check OpenNana once per local day and refresh the supplemental library if changed."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path


SKILL_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = SKILL_DIR / "references" / "opennana-cases.json"
STATE_FILE = SKILL_DIR / "references" / "opennana-update-state.json"
LOCK_FILE = SKILL_DIR / "references" / ".opennana-update.lock"
SOURCE_CACHE_FILE = SKILL_DIR / "references" / "opennana-source-cache.json"
IMPORT_SCRIPT = SKILL_DIR / "scripts" / "import_opennana.py"
DEFAULT_ARCHIVE_ROOT = Path(
    r"C:\Users\pc\Downloads\opennana-chatgpt-prompt-archive-main"
    r"\opennana-chatgpt-prompt-archive-main"
)
BASE_URL = "https://opennana.com"
API_URL = "https://api.opennana.com/api/prompts"
MODEL = "ChatGPT"
USER_AGENT = "Mozilla/5.0 Codex-OpenNana-Updater/1.1"


def today() -> str:
    return datetime.now().astimezone().date().isoformat()


def read_json(path: Path, default: dict) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return default


def read_text_json(path: Path, default: dict) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return default


def write_json(path: Path, data: dict) -> None:
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    temporary.replace(path)


def locate_archive_root(explicit: str | None) -> Path | None:
    candidates: list[Path] = []
    if explicit:
        candidates.append(Path(explicit))
    if os.environ.get("OPENNANA_ARCHIVE_ROOT"):
        candidates.append(Path(os.environ["OPENNANA_ARCHIVE_ROOT"]))
    candidates.append(DEFAULT_ARCHIVE_ROOT)

    downloads = Path.home() / "Downloads"
    if downloads.exists():
        candidates.extend(
            path.parent.parent
            for path in downloads.glob(
                "opennana-chatgpt-prompt-archive-main*/**/scripts/sync_prompts.js"
            )
        )

    for root in candidates:
        root = root.expanduser().resolve()
        if (root / "scripts" / "sync_prompts.js").is_file():
            return root
    return None


def request_json(url: str, timeout: int, attempts: int = 4) -> dict:
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        request = urllib.request.Request(
            url,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "application/json,text/plain,*/*",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                if response.status < 200 or response.status >= 300:
                    raise RuntimeError(f"HTTP {response.status}: {url}")
                return json.loads(response.read().decode("utf-8"))
        except Exception as error:  # noqa: BLE001 - keep updater non-fatal.
            last_error = error
            if attempt < attempts:
                time.sleep(min(attempt, 5))
    raise RuntimeError(str(last_error))


def probe_remote(timeout: int) -> dict:
    query = urllib.parse.urlencode(
        {
            "page": "1",
            "limit": "20",
            "sort": "reviewed_at",
            "order": "DESC",
            "model": MODEL,
        }
    )
    payload = request_json(f"{API_URL}?{query}", timeout)
    data = payload.get("data") or {}
    pagination = data.get("pagination") or {}
    items = data.get("items") or []
    latest = next(
        (
            item
            for item in items
            if not item.get("_is_sponsor")
            and item.get("slug")
        ),
        {},
    )
    return {
        "total": int(pagination.get("total") or 0),
        "latest_id": latest.get("id"),
        "latest_slug": latest.get("slug"),
    }


def local_signature() -> dict:
    data = read_json(DATA_FILE, {})
    cases = data.get("cases") or []
    skipped = data.get("skipped") or {}
    inferred_total = (
        len(cases)
        + int(skipped.get("primary_title") or 0)
        + int(skipped.get("primary_prompt") or 0)
        + int(skipped.get("duplicate_title") or 0)
        + int(skipped.get("duplicate_slug") or 0)
    )
    return {
        "total": int(data.get("sourceTotal") or inferred_total),
        "latest_id": data.get("sourceLatestId"),
        "latest_reviewed_at": data.get("sourceLatestReviewedAt") or "",
        "imported": len(cases),
    }


def changed(remote: dict, local: dict) -> bool:
    if remote.get("total") != local.get("total"):
        return True
    return remote.get("latest_id") != local.get("latest_id")


def acquire_lock() -> bool:
    if LOCK_FILE.exists() and time.time() - LOCK_FILE.stat().st_mtime > 7200:
        LOCK_FILE.unlink(missing_ok=True)
    try:
        descriptor = os.open(LOCK_FILE, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError:
        return False
    with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
        handle.write(f"{os.getpid()}\n{datetime.now().astimezone().isoformat()}\n")
    return True


def source_archive_candidates(archive_root: Path | None) -> list[Path]:
    candidates = [SOURCE_CACHE_FILE]
    if archive_root is not None:
        candidates.append(archive_root / "data" / "chatgpt-prompts.json")
    candidates.append(DEFAULT_ARCHIVE_ROOT / "data" / "chatgpt-prompts.json")
    return candidates


def load_existing_archive(archive_root: Path | None) -> dict:
    for path in source_archive_candidates(archive_root):
        data = read_text_json(path, {})
        if isinstance(data.get("items"), list):
            return data
    return {}


def normalize_remote_item(item: dict) -> dict:
    slug = item.get("slug") or ""
    return {
        "id": item.get("id"),
        "slug": slug,
        "title": item.get("title") or "",
        "description": item.get("description") or "",
        "model": item.get("model") or MODEL,
        "media_type": item.get("media_type") or "image",
        "source_name": item.get("source_name") or "",
        "source_url": item.get("source_url") or "",
        "tags": item.get("tags") or [],
        "prompts": item.get("prompts") or [],
        "images": item.get("images") or [],
        "video_urls": item.get("video_urls") or [],
        "thumbnail": item.get("thumbnail") or item.get("cover_image") or "",
        "url": item.get("url") or f"{BASE_URL}/awesome-prompt-gallery/{slug}",
        "reviewed_at": item.get("reviewed_at") or "",
        "created_at": item.get("created_at") or "",
        "updated_at": item.get("updated_at") or "",
    }


def list_remote_cards(timeout: int, page_limit: int = 100) -> tuple[list[dict], dict]:
    cards_by_slug: dict[str, dict] = {}
    pagination: dict = {}
    page = 1
    while True:
        query = urllib.parse.urlencode(
            {
                "page": str(page),
                "limit": str(page_limit),
                "sort": "reviewed_at",
                "order": "DESC",
                "model": MODEL,
            }
        )
        payload = request_json(f"{API_URL}?{query}", timeout)
        data = payload.get("data") or {}
        pagination = data.get("pagination") or {}
        for item in data.get("items") or []:
            if item.get("_is_sponsor") or not item.get("slug"):
                continue
            cards_by_slug[str(item["slug"])] = item
        total_pages = int(pagination.get("total_pages") or page)
        if page >= total_pages:
            break
        page += 1
        time.sleep(0.08)
    return list(cards_by_slug.values()), pagination


def fetch_prompt_detail(slug: str, timeout: int) -> dict:
    payload = request_json(f"{API_URL}/{urllib.parse.quote(slug)}", timeout)
    data = payload.get("data") or {}
    if not data or data.get("model") != MODEL:
        raise RuntimeError(f"Unexpected prompt detail for {slug}")
    return normalize_remote_item(data)


def sync_archive_python(archive_root: Path | None, timeout: int) -> Path:
    existing = load_existing_archive(archive_root)
    existing_by_slug = {
        str(item.get("slug")): item
        for item in existing.get("items") or []
        if item.get("slug")
    }
    cards, pagination = list_remote_cards(timeout)
    failed: list[dict] = []
    merged_by_slug: dict[str, dict] = {}

    for index, card in enumerate(cards, start=1):
        slug = str(card.get("slug") or "")
        cached = existing_by_slug.get(slug)
        if cached and cached.get("prompts"):
            merged_by_slug[slug] = cached
            continue
        try:
            merged_by_slug[slug] = fetch_prompt_detail(slug, timeout)
            print(f"[detail] {index}/{len(cards)} {slug}")
            time.sleep(0.06)
        except Exception as error:  # noqa: BLE001 - retain partial updates.
            failed.append({"slug": slug, "error": str(error)})
            print(f"[warn] detail failed {index}/{len(cards)} {slug}: {error}")

    # Preserve only slugs currently exposed by OpenNana and keep source ordering.
    items = [merged_by_slug[card["slug"]] for card in cards if card.get("slug") in merged_by_slug]
    items.sort(
        key=lambda item: (
            str(item.get("reviewed_at") or item.get("created_at") or ""),
            int(item.get("id") or 0),
        ),
        reverse=True,
    )
    summary = {
        "source": f"{BASE_URL}/awesome-prompt-gallery?model={MODEL}",
        "api_base": API_URL,
        "model": MODEL,
        "fetched_at": datetime.now().astimezone().isoformat(),
        "total_reported": int(pagination.get("total") or len(cards)),
        "total_pages": int(pagination.get("total_pages") or 0),
        "total_archived": len(items),
        "total_failed": len(failed),
        "failed": failed,
        "items": items,
    }
    SOURCE_CACHE_FILE.write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    if archive_root is not None:
        archive_data = archive_root / "data"
        archive_data.mkdir(parents=True, exist_ok=True)
        (archive_data / "chatgpt-prompts.json").write_text(
            json.dumps(summary, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        (archive_data / "chatgpt-prompts.min.json").write_text(
            json.dumps(summary, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
    return SOURCE_CACHE_FILE


def run_update(archive_root: Path | None, timeout: int) -> None:
    source_file = sync_archive_python(archive_root, timeout)
    subprocess.run(
        [sys.executable, "-X", "utf8", str(IMPORT_SCRIPT), str(source_file)],
        cwd=SKILL_DIR,
        check=True,
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Ignore today's check state")
    parser.add_argument("--archive-root", help="OpenNana archive project directory")
    parser.add_argument("--timeout", type=int, default=20, help="Probe timeout in seconds")
    parser.add_argument("--retry-failed", action="store_true", help="Retry even if today's previous check failed")
    args = parser.parse_args()

    state = read_json(STATE_FILE, {})
    completed_today = (
        state.get("last_check_date") == today()
        and state.get("status") in {"up-to-date", "updated"}
    )
    failed_today = (
        state.get("last_check_date") == today()
        and state.get("status") == "failed-using-cache"
    )
    if not args.force and completed_today:
        print(
            f"OpenNana daily check already completed: "
            f"{state.get('status', 'unknown')} ({state.get('last_check_date')})."
        )
        return 0
    if not args.force and failed_today and not args.retry_failed:
        print(
            "OpenNana daily check failed earlier today; using cached cases. "
            "Run with --retry-failed or --force to try again."
        )
        return 0

    if not acquire_lock():
        print("OpenNana update is already running; using the current local library.")
        return 0

    state.update(
        {
            "last_check_date": today(),
            "last_check_at": datetime.now().astimezone().isoformat(),
            "status": "checking",
        }
    )
    write_json(STATE_FILE, state)

    try:
        remote = probe_remote(args.timeout)
        local = local_signature()
        state["remote"] = remote
        state["local_before"] = local

        if not args.force and not changed(remote, local):
            state["status"] = "up-to-date"
            state["message"] = f"No change; {local.get('imported', 0)} supplemental cases available."
            write_json(STATE_FILE, state)
            print(state["message"])
            return 0

        archive_root = locate_archive_root(args.archive_root)

        run_update(archive_root, args.timeout)
        updated = local_signature()
        state["status"] = "updated"
        state["archive_root"] = str(archive_root) if archive_root is not None else ""
        state["local_after"] = updated
        state["message"] = f"Updated OpenNana library; {updated.get('imported', 0)} cases available."
        write_json(STATE_FILE, state)
        print(state["message"])
        return 0
    except Exception as error:
        state["status"] = "failed-using-cache"
        state["message"] = str(error)
        write_json(STATE_FILE, state)
        print(f"OpenNana update failed; using cached cases. Details: {error}")
        return 0
    finally:
        LOCK_FILE.unlink(missing_ok=True)


if __name__ == "__main__":
    raise SystemExit(main())
