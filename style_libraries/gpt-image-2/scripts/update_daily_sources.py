#!/usr/bin/env python3
"""Run all daily refresh checks for gpt-image-2-style-library."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.request
import zipfile
from datetime import datetime
from pathlib import Path


SKILL_DIR = Path(__file__).resolve().parent.parent
REFERENCES_DIR = SKILL_DIR / "references"
STATE_FILE = REFERENCES_DIR / "daily-update-state.json"
LOCK_FILE = REFERENCES_DIR / ".daily-update.lock"
OPENNANA_SCRIPT = SKILL_DIR / "scripts" / "update_opennana_daily.py"
AWESOME_IMPORT_SCRIPT = SKILL_DIR / "scripts" / "import_awesome_readme.py"
YOUMIND_PUBLIC_SYNC_SCRIPT = SKILL_DIR / "scripts" / "sync_youmind_public.py"
EVOLINK_API_IMPORT_SCRIPT = SKILL_DIR / "scripts" / "import_evolink_api_prompts.py"
EVOLINK_WEB_SYNC_SCRIPT = SKILL_DIR / "scripts" / "sync_evolink_web_gallery.py"
AIART_PICS_SYNC_SCRIPT = SKILL_DIR / "scripts" / "sync_aiart_pics_prompts.py"
YOUMIND_PUBLIC_CASES_FILE = REFERENCES_DIR / "youmind-public-cases.json"
EVOLINK_API_CASES_FILE = REFERENCES_DIR / "evolink-api-prompts-cases.json"
EVOLINK_WEB_CASES_FILE = REFERENCES_DIR / "evolink-web-gallery-cases.json"
AIART_PICS_CASES_FILE = REFERENCES_DIR / "aiart-pics-cases.json"
AWESOME_README_CASES_FILE = REFERENCES_DIR / "awesome-readme-cases.json"
YOUMIND_PUBLIC_API_URL = "https://youmind.com/youmarketing-api/prompts"
YOUMIND_AWESOME_REPO_COMMIT_URL = "https://api.github.com/repos/YouMind-OpenLab/awesome-gpt-image-2/commits/main"
YOUMIND_AWESOME_REPO_ZIP_URL = "https://github.com/YouMind-OpenLab/awesome-gpt-image-2/archive/refs/heads/main.zip"
EVOLINK_REPO_COMMIT_URL = "https://api.github.com/repos/EvoLinkAI/awesome-gpt-image-2-API-and-Prompts/commits/main"
EVOLINK_WEB_GALLERY_URL = "https://evolink.ai/gpt-image-2-prompts"
YOUMIND_PUBLIC_EXPLORE_URL = (
    "https://youmind.com/zh-CN/gpt-image-2-prompts/explore?sortBy=views&sortOrder=desc"
)
GITHUB_REPO_MONITORS = {
    "meigen_mcp": {
        "repo": "jau123/MeiGen-AI-Design-MCP",
        "role": "MeiGen MCP source monitor; record updates, do not auto-overwrite local MCP config.",
    },
    "opennana_archive": {
        "repo": "johnson020202/opennana-chatgpt-prompt-archive",
        "role": "OpenNana GitHub archive monitor; case refresh is handled by update_opennana_daily.py and cached fallback.",
    },
    "evolink_api_prompts": {
        "repo": "EvoLinkAI/awesome-gpt-image-2-API-and-Prompts",
        "role": "EvoLink API prompt repository monitor; case refresh is handled by import_evolink_api_prompts.py.",
    },
    "freestylefly_skill_upstream": {
        "repo": "freestylefly/awesome-gpt-image-2",
        "role": "Upstream skill/source monitor; record updates for manual merge so local custom rules are preserved.",
    },
}
USER_AGENT = "Mozilla/5.0 Codex-Style-Library-Daily-Probe/1.1"
DEFAULT_AWESOME_ROOT = Path(
    r"C:\Users\pc\Downloads\awesome-gpt-image-2-main (1)"
    r"\awesome-gpt-image-2-main"
)
DEFAULT_EVOLINK_API_ROOT = Path(
    r"C:\Users\pc\Downloads\awesome-gpt-image-2-API-and-Prompts-main"
    r"\awesome-gpt-image-2-API-and-Prompts-main"
)


def today() -> str:
    return datetime.now().astimezone().date().isoformat()


def read_json(path: Path, default: dict) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return default


def write_json(path: Path, data: dict) -> None:
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(path)


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


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


def locate_awesome_root(explicit: str | None) -> Path | None:
    candidates: list[Path] = []
    if explicit:
        candidates.append(Path(explicit))
    if os.environ.get("AWESOME_GPT_IMAGE_2_ROOT"):
        candidates.append(Path(os.environ["AWESOME_GPT_IMAGE_2_ROOT"]))
    candidates.append(DEFAULT_AWESOME_ROOT)

    downloads = Path.home() / "Downloads"
    if downloads.exists():
        candidates.extend(
            path
            for path in downloads.glob("awesome-gpt-image-2-main*/**/README.md")
            if (path.parent / "package.json").is_file()
        )

    for candidate in candidates:
        root = candidate.expanduser().resolve()
        if root.is_file():
            root = root.parent
        if (root / "README.md").is_file() and (root / "package.json").is_file():
            return root
    return None



def locate_evolink_api_root(explicit: str | None) -> Path | None:
    candidates: list[Path] = []
    if explicit:
        candidates.append(Path(explicit))
    if os.environ.get("EVOLINK_GPT_IMAGE_2_PROMPTS_ROOT"):
        candidates.append(Path(os.environ["EVOLINK_GPT_IMAGE_2_PROMPTS_ROOT"]))
    candidates.append(DEFAULT_EVOLINK_API_ROOT)

    downloads = Path.home() / "Downloads"
    if downloads.exists():
        candidates.extend(
            path
            for path in downloads.glob("awesome-gpt-image-2-API-and-Prompts-main*/**/README.md")
            if (path.parent / "cases").is_dir()
        )

    for candidate in candidates:
        root = candidate.expanduser().resolve()
        if root.is_file():
            root = root.parent
        if (root / "README.md").is_file() and (root / "cases").is_dir():
            return root
    return None


def run_command(command: list[str]) -> dict:
    completed = subprocess.run(
        command,
        cwd=SKILL_DIR,
        text=True,
        encoding="utf-8",
        errors="replace",
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    return {
        "returncode": completed.returncode,
        "output": completed.stdout[-4000:],
    }


def request_get_json(url: str, timeout: int) -> dict:
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": USER_AGENT,
        },
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        if response.status < 200 or response.status >= 300:
            raise RuntimeError(f"HTTP {response.status}: {url}")
        return json.loads(response.read().decode("utf-8"))


def request_json(url: str, body: dict, timeout: int) -> dict:
    request = urllib.request.Request(
        url,
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": USER_AGENT,
            "Referer": YOUMIND_PUBLIC_EXPLORE_URL,
            "Origin": "https://youmind.com",
        },
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        if response.status < 200 or response.status >= 300:
            raise RuntimeError(f"HTTP {response.status}: {url}")
        return json.loads(response.read().decode("utf-8"))


def github_commit_url(repo: str) -> str:
    return f"https://api.github.com/repos/{repo}/commits/main"


def probe_github_repo(repo: str, timeout: int) -> dict:
    payload = request_get_json(github_commit_url(repo), timeout)
    return {
        "repo": repo,
        "sha": payload.get("sha") or "",
        "date": ((payload.get("commit") or {}).get("committer") or {}).get("date") or "",
        "message": ((payload.get("commit") or {}).get("message") or "").splitlines()[0],
        "url": payload.get("html_url") or "",
    }


def download_file(url: str, destination: Path, timeout: int) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/zip,application/octet-stream,*/*",
            "User-Agent": USER_AGENT,
        },
    )
    temporary = destination.with_suffix(destination.suffix + ".tmp")
    with urllib.request.urlopen(request, timeout=timeout) as response:
        if response.status < 200 or response.status >= 300:
            raise RuntimeError(f"HTTP {response.status}: {url}")
        with temporary.open("wb") as handle:
            shutil.copyfileobj(response, handle)
    temporary.replace(destination)


def update_opennana(args: argparse.Namespace) -> dict:
    command = [sys.executable, "-X", "utf8", str(OPENNANA_SCRIPT)]
    if args.force:
        command.append("--force")
    if args.retry_failed:
        command.append("--retry-failed")
    if args.timeout:
        command.extend(["--timeout", str(args.timeout)])
    result = run_command(command)
    result["status"] = "ok" if result["returncode"] == 0 else "failed"
    return result


def local_awesome_readme_signature() -> dict:
    data = read_json(AWESOME_README_CASES_FILE, {})
    cases = data.get("cases") or []
    return {
        "imported": int(data.get("importedCases") or len(cases)),
        "source": data.get("source") or "",
        "sourceRoot": data.get("sourceRoot") or "",
        "sourceReadmeSha256": data.get("sourceReadmeSha256") or "",
        "importedAt": data.get("importedAt") or "",
    }


def probe_youmind_awesome_repo(timeout: int) -> dict:
    payload = request_get_json(YOUMIND_AWESOME_REPO_COMMIT_URL, timeout)
    return {
        "sha": payload.get("sha") or "",
        "date": ((payload.get("commit") or {}).get("committer") or {}).get("date") or "",
        "message": ((payload.get("commit") or {}).get("message") or "").splitlines()[0],
        "url": payload.get("html_url") or "",
    }


def extract_github_zip_root(zip_path: Path, destination: Path) -> Path:
    with zipfile.ZipFile(zip_path) as archive:
        archive.extractall(destination)
    candidates = [
        readme.parent
        for readme in destination.glob("*/README.md")
        if (readme.parent / "package.json").is_file()
    ]
    if not candidates:
        raise FileNotFoundError(f"No awesome-gpt-image-2 project root found in {zip_path}")
    return candidates[0]


def import_awesome_from_root(root: Path, remote: dict, local_before: dict) -> dict:
    result = run_command([sys.executable, "-X", "utf8", str(AWESOME_IMPORT_SCRIPT), str(root)])
    result["remote"] = remote
    result["local_before"] = local_before
    result["local_after"] = local_awesome_readme_signature()
    result["status"] = "updated" if result["returncode"] == 0 else "failed-using-cache"
    return result


def update_repo_monitors(args: argparse.Namespace, state: dict) -> dict:
    previous = state.get("repo_monitors") or {}
    previous_repos = previous.get("repos") or {}
    completed_today = (
        state.get("_previous_last_check_date") == today()
        and previous.get("status") in {"up-to-date", "checked", "changed"}
    )
    if not args.force and completed_today:
        return {
            "status": previous.get("status") or "up-to-date",
            "message": "GitHub repository monitors already checked today.",
            "repos": previous_repos,
        }

    monitored: dict[str, dict] = {}
    changed: list[str] = []
    failed: list[str] = []
    for key, config in GITHUB_REPO_MONITORS.items():
        repo = str(config["repo"])
        previous_remote = (previous_repos.get(key) or {}).get("remote") or {}
        try:
            remote = probe_github_repo(repo, args.timeout)
            old_sha = previous_remote.get("sha") or ""
            status = "tracked" if not old_sha else ("changed" if old_sha != remote.get("sha") else "up-to-date")
            if status == "changed":
                changed.append(key)
            monitored[key] = {
                "status": status,
                "role": config.get("role") or "",
                "remote": remote,
                "previous_sha": old_sha,
                "checked_at": datetime.now().astimezone().isoformat(),
            }
        except Exception as error:  # noqa: BLE001 - monitors should not block retrieval.
            failed.append(key)
            monitored[key] = {
                "status": "failed",
                "role": config.get("role") or "",
                "remote": {"repo": repo, "message": str(error)},
                "previous_sha": previous_remote.get("sha") or "",
                "checked_at": datetime.now().astimezone().isoformat(),
            }

    status = "failed-using-cache" if failed and len(failed) == len(GITHUB_REPO_MONITORS) else ("changed" if changed else "up-to-date")
    return {
        "status": status,
        "changed": changed,
        "failed": failed,
        "repos": monitored,
        "message": (
            f"GitHub repository monitors checked; changed={len(changed)}, failed={len(failed)}."
        ),
    }


def update_awesome(args: argparse.Namespace, state: dict) -> dict:
    previous = state.get("awesome_readme") or {}
    completed_today = (
        state.get("_previous_last_check_date") == today()
        and previous.get("status") in {"up-to-date", "updated", "local-updated"}
    )

    if not args.awesome_root and not args.awesome_prefer_local:
        local = local_awesome_readme_signature()
        try:
            remote = probe_youmind_awesome_repo(args.timeout)
            previous_remote = previous.get("remote") or {}
            unchanged = previous_remote.get("sha") == remote.get("sha")
            if not args.force and completed_today and unchanged and local.get("imported", 0) > 0:
                return {
                    "status": "up-to-date",
                    "remote": remote,
                    "local": local,
                    "message": "YouMind-OpenLab awesome-gpt-image-2 GitHub repo already checked today and is unchanged.",
                }
            if not args.force and unchanged and local.get("imported", 0) > 0:
                return {
                    "status": "up-to-date",
                    "remote": remote,
                    "local": local,
                    "message": f"YouMind-OpenLab awesome-gpt-image-2 repo unchanged; {local.get('imported', 0)} README cases cached.",
                }

            cache_dir = REFERENCES_DIR / ".cache"
            zip_path = cache_dir / "youmind-awesome-gpt-image-2-main.zip"
            extract_dir = cache_dir / "youmind-awesome-gpt-image-2-main"
            download_file(YOUMIND_AWESOME_REPO_ZIP_URL, zip_path, args.timeout)
            if extract_dir.exists():
                shutil.rmtree(extract_dir)
            extract_dir.mkdir(parents=True, exist_ok=True)
            root = extract_github_zip_root(zip_path, extract_dir)
            result = import_awesome_from_root(root, remote, local)
            result["zip"] = str(zip_path)
            return result
        except Exception as error:  # noqa: BLE001 - fallback keeps cached/local cases usable.
            fallback = update_awesome_local(args, state, completed_today)
            fallback["remote"] = {"status": "probe-or-download-failed", "message": str(error)}
            return fallback

    return update_awesome_local(args, state, completed_today)


def update_awesome_local(args: argparse.Namespace, state: dict, completed_today: bool) -> dict:
    root = locate_awesome_root(args.awesome_root)
    if root is None:
        return {
            "status": "missing-source",
            "local": local_awesome_readme_signature(),
            "message": "awesome-gpt-image-2-main source directory was not found; using cached README cases.",
        }
    readme = root / "README.md"
    signature = {
        "root": str(root),
        "readme": str(readme),
        "sha256": file_sha256(readme),
        "mtime": datetime.fromtimestamp(readme.stat().st_mtime).astimezone().isoformat(),
    }
    previous = (state.get("awesome_readme") or {}).get("signature") or {}
    unchanged = previous.get("sha256") == signature["sha256"]

    if not args.force and completed_today and unchanged:
        return {
            "status": "up-to-date",
            "signature": signature,
            "message": "Awesome README daily check already completed and source is unchanged.",
        }
    if not args.force and unchanged:
        return {
            "status": "up-to-date",
            "signature": signature,
            "message": "Awesome README source unchanged; using cached cases.",
        }

    result = run_command([sys.executable, "-X", "utf8", str(AWESOME_IMPORT_SCRIPT), str(root)])
    result["signature"] = signature
    result["local_after"] = local_awesome_readme_signature()
    result["status"] = "local-updated" if result["returncode"] == 0 else "failed-using-cache"
    return result


def probe_youmind_public(timeout: int) -> dict:
    payload = request_json(
        YOUMIND_PUBLIC_API_URL,
        {
            "model": "gpt-image-2",
            "page": 1,
            "limit": 18,
            "locale": "zh-CN",
            "q": "",
            "categories": None,
            "campaign": None,
            "filterMode": "all",
            "searchMode": "semantic",
            "sortBy": "views",
            "sortOrder": "desc",
        },
        timeout,
    )
    prompts = payload.get("prompts") or []
    return {
        "total": int(payload.get("total") or 0),
        "totalPages": int(payload.get("totalPages") or 0),
        "firstIds": [item.get("id") for item in prompts[:12]],
    }


def local_youmind_public_signature() -> dict:
    data = read_json(YOUMIND_PUBLIC_CASES_FILE, {})
    cases = data.get("cases") or []
    return {
        "total": int(data.get("sourceTotal") or len(cases)),
        "imported": int(data.get("importedCases") or len(cases)),
        "firstIds": data.get("firstPageIds") or [case.get("sourceId") for case in cases[:12]],
        "fetchedAt": data.get("fetchedAt") or "",
    }


def update_youmind_public(args: argparse.Namespace, state: dict) -> dict:
    previous_status = (state.get("youmind_public") or {}).get("status")
    completed_today = (
        state.get("_previous_last_check_date") == today()
        and previous_status in {"up-to-date", "updated"}
    )
    if not args.force and completed_today:
        return {
            "status": "up-to-date",
            "message": "YouMind public daily check already completed.",
            "local": local_youmind_public_signature(),
        }

    try:
        remote = probe_youmind_public(args.timeout)
        local = local_youmind_public_signature()
        needs_update = (
            args.force
            or not YOUMIND_PUBLIC_CASES_FILE.is_file()
            or local.get("imported", 0) <= 0
            or remote.get("total") != local.get("total")
            or remote.get("firstIds") != local.get("firstIds")
        )
        if not needs_update:
            return {
                "status": "up-to-date",
                "remote": remote,
                "local": local,
                "message": f"YouMind public source unchanged; {local.get('imported', 0)} cases cached.",
            }

        command = [
            sys.executable,
            "-X",
            "utf8",
            str(YOUMIND_PUBLIC_SYNC_SCRIPT),
            "--limit",
            "100",
            "--delay",
            str(args.youmind_delay),
            "--timeout",
            str(args.timeout),
        ]
        result = run_command(command)
        result["remote"] = remote
        result["local_before"] = local
        result["local_after"] = local_youmind_public_signature()
        result["status"] = "updated" if result["returncode"] == 0 else "failed-using-cache"
        return result
    except Exception as error:  # noqa: BLE001 - daily update must keep cached source usable.
        return {
            "status": "failed-using-cache",
            "message": str(error),
            "local": local_youmind_public_signature(),
        }



def local_evolink_api_signature() -> dict:
    data = read_json(EVOLINK_API_CASES_FILE, {})
    cases = data.get("cases") or []
    return {
        "imported": int(data.get("importedCases") or len(cases)),
        "fetchedAt": data.get("fetchedAt") or "",
        "sourceRepository": data.get("sourceRepository") or "",
    }


def local_evolink_web_signature() -> dict:
    data = read_json(EVOLINK_WEB_CASES_FILE, {})
    cases = data.get("cases") or []
    return {
        "imported": int(data.get("importedCases") or len(cases)),
        "pageHash": data.get("pageHash") or "",
        "fetchedAt": data.get("fetchedAt") or "",
        "sourceUrl": data.get("sourceUrl") or EVOLINK_WEB_GALLERY_URL,
    }


def local_aiart_pics_signature() -> dict:
    data = read_json(AIART_PICS_CASES_FILE, {})
    cases = data.get("cases") or []
    return {
        "imported": int(data.get("importedCases") or len(cases)),
        "sourceTotal": int(data.get("sourceTotal") or len(cases)),
        "detailCases": int(data.get("detailCases") or 0),
        "metadataOnlyCases": int(data.get("metadataOnlyCases") or 0),
        "fetchedAt": data.get("fetchedAt") or "",
        "sourceApi": data.get("sourceApi") or "",
    }


def update_aiart_pics(args: argparse.Namespace, state: dict) -> dict:
    previous_status = (state.get("aiart_pics") or {}).get("status")
    completed_today = (
        state.get("_previous_last_check_date") == today()
        and previous_status in {"up-to-date", "updated"}
    )
    if not args.force and completed_today:
        return {
            "status": "up-to-date",
            "message": "AIArt.Pics prompt library daily check already completed.",
            "local": local_aiart_pics_signature(),
        }

    command = [
        sys.executable,
        "-X",
        "utf8",
        str(AIART_PICS_SYNC_SCRIPT),
        "--timeout",
        str(args.timeout),
    ]
    if not args.aiart_full_details:
        command.append("--metadata-only")
    if args.force:
        command.append("--force")
    result = run_command(command)
    result["local_after"] = local_aiart_pics_signature()
    result["status"] = "updated" if result["returncode"] == 0 else "failed-using-cache"
    if "metadata_only=0" in result.get("output", ""):
        result["status"] = "up-to-date"
    return result


def probe_evolink_repo(timeout: int) -> dict:
    payload = request_get_json(EVOLINK_REPO_COMMIT_URL, timeout)
    return {
        "sha": payload.get("sha") or "",
        "date": ((payload.get("commit") or {}).get("committer") or {}).get("date") or "",
        "message": ((payload.get("commit") or {}).get("message") or "").splitlines()[0],
    }


def update_evolink_api_prompts(args: argparse.Namespace, state: dict) -> dict:
    previous = state.get("evolink_api_prompts") or {}
    completed_today = (
        state.get("_previous_last_check_date") == today()
        and previous.get("status") in {"up-to-date", "updated", "local-updated"}
    )
    if not args.force and completed_today:
        return {
            "status": "up-to-date",
            "message": "EvoLink API prompts daily check already completed.",
            "local": local_evolink_api_signature(),
            "remote": previous.get("remote") or {},
        }

    remote: dict = {}
    try:
        remote = probe_evolink_repo(args.timeout)
    except Exception as error:  # noqa: BLE001 - local fallback is acceptable.
        remote = {"status": "probe-failed", "message": str(error)}

    local = local_evolink_api_signature()
    if (
        not args.force
        and remote.get("sha")
        and previous.get("remote", {}).get("sha") == remote.get("sha")
        and local.get("imported", 0) > 0
    ):
        return {
            "status": "up-to-date",
            "message": f"EvoLink API prompts repo unchanged; {local.get('imported', 0)} cases cached.",
            "remote": remote,
            "local": local,
        }

    command = [sys.executable, "-X", "utf8", str(EVOLINK_API_IMPORT_SCRIPT)]
    root = locate_evolink_api_root(args.evolink_api_root)
    if remote.get("sha") and not args.evolink_prefer_local:
        command.extend(["--github-zip", "--timeout", str(args.timeout)])
    elif root is not None:
        command.append(str(root))
    else:
        command.extend(["--github-zip", "--timeout", str(args.timeout)])

    result = run_command(command)
    result["remote"] = remote
    result["local_after"] = local_evolink_api_signature()
    result["status"] = "updated" if result["returncode"] == 0 else "failed-using-cache"
    return result


def update_evolink_web_gallery(args: argparse.Namespace, state: dict) -> dict:
    previous_status = (state.get("evolink_web_gallery") or {}).get("status")
    completed_today = (
        state.get("_previous_last_check_date") == today()
        and previous_status in {"up-to-date", "updated"}
    )
    if not args.force and completed_today:
        return {
            "status": "up-to-date",
            "message": "EvoLink web gallery daily check already completed.",
            "local": local_evolink_web_signature(),
        }

    command = [
        sys.executable,
        "-X",
        "utf8",
        str(EVOLINK_WEB_SYNC_SCRIPT),
        "--timeout",
        str(args.timeout),
    ]
    result = run_command(command)
    result["local_after"] = local_evolink_web_signature()
    result["status"] = "updated" if result["returncode"] == 0 else "failed-using-cache"
    return result

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Refresh all sources even if already checked today")
    parser.add_argument("--retry-failed", action="store_true", help="Retry sources that failed earlier today")
    parser.add_argument("--timeout", type=int, default=20, help="OpenNana probe timeout in seconds")
    parser.add_argument("--awesome-root", help="Path to a local awesome-gpt-image-2-main project directory")
    parser.add_argument("--awesome-prefer-local", action="store_true", help="Prefer a local awesome-gpt-image-2-main directory instead of the YouMind-OpenLab GitHub zip")
    parser.add_argument("--evolink-api-root", help="Path to the EvoLink awesome-gpt-image-2-API-and-Prompts repository directory")
    parser.add_argument("--evolink-prefer-local", action="store_true", help="Prefer the local EvoLink API prompts directory over downloading the GitHub zip")
    parser.add_argument("--skip-opennana", action="store_true", help="Skip OpenNana refresh")
    parser.add_argument("--skip-youmind-public", action="store_true", help="Skip YouMind public web API refresh")
    parser.add_argument("--skip-awesome-readme", action="store_true", help="Skip YouMind-OpenLab awesome README refresh")
    parser.add_argument("--skip-evolink-api", action="store_true", help="Skip EvoLink GitHub API/prompts repository refresh")
    parser.add_argument("--skip-evolink-web", action="store_true", help="Skip EvoLink web gallery refresh")
    parser.add_argument("--skip-aiart-pics", action="store_true", help="Skip AIArt.Pics GitHub prompt-library refresh")
    parser.add_argument("--aiart-full-details", action="store_true", help="Fetch every AIArt.Pics detail page instead of the daily metadata-only refresh")
    parser.add_argument("--skip-repo-monitors", action="store_true", help="Skip GitHub repository commit monitors")
    parser.add_argument("--youmind-delay", type=float, default=0.15, help="Delay between YouMind public page requests")
    args = parser.parse_args()

    state = read_json(STATE_FILE, {})
    state["_previous_last_check_date"] = state.get("last_check_date")
    if not acquire_lock():
        print("Daily source update is already running; using current local libraries.")
        return 0

    state.update(
        {
            "last_check_date": today(),
            "last_check_at": datetime.now().astimezone().isoformat(),
        }
    )

    try:
        if not args.skip_opennana:
            state["opennana"] = update_opennana(args)
            print("OpenNana:", state["opennana"].get("status"))
            if state["opennana"].get("output"):
                print(state["opennana"]["output"].strip())

        if not args.skip_youmind_public:
            state["youmind_public"] = update_youmind_public(args, state)
            print("YouMind public:", state["youmind_public"].get("status"))
            for key in ("message", "output"):
                if state["youmind_public"].get(key):
                    print(str(state["youmind_public"][key]).strip())

        if not args.skip_aiart_pics:
            state["aiart_pics"] = update_aiart_pics(args, state)
            print("AIArt.Pics:", state["aiart_pics"].get("status"))
            for key in ("message", "output"):
                if state["aiart_pics"].get(key):
                    print(str(state["aiart_pics"][key]).strip())

        if not args.skip_evolink_api:
            state["evolink_api_prompts"] = update_evolink_api_prompts(args, state)
            print("EvoLink API prompts:", state["evolink_api_prompts"].get("status"))
            for key in ("message", "output"):
                if state["evolink_api_prompts"].get(key):
                    print(str(state["evolink_api_prompts"][key]).strip())

        if not args.skip_evolink_web:
            state["evolink_web_gallery"] = update_evolink_web_gallery(args, state)
            print("EvoLink web gallery:", state["evolink_web_gallery"].get("status"))
            for key in ("message", "output"):
                if state["evolink_web_gallery"].get(key):
                    print(str(state["evolink_web_gallery"][key]).strip())

        if not args.skip_repo_monitors:
            state["repo_monitors"] = update_repo_monitors(args, state)
            print("GitHub repo monitors:", state["repo_monitors"].get("status"))
            if state["repo_monitors"].get("message"):
                print(str(state["repo_monitors"]["message"]).strip())

        if not args.skip_awesome_readme:
            state["awesome_readme"] = update_awesome(args, state)
            print("Awesome README:", state["awesome_readme"].get("status"))
            for key in ("message", "output"):
                if state["awesome_readme"].get(key):
                    print(str(state["awesome_readme"][key]).strip())

        state.pop("_previous_last_check_date", None)
        write_json(STATE_FILE, state)
        return 0
    except Exception as error:  # noqa: BLE001 - daily update must not block prompt work.
        state["status"] = "failed-using-cache"
        state["message"] = str(error)
        state.pop("_previous_last_check_date", None)
        write_json(STATE_FILE, state)
        print(f"Daily source update failed; using cached libraries. Details: {error}")
        return 0
    finally:
        LOCK_FILE.unlink(missing_ok=True)


if __name__ == "__main__":
    raise SystemExit(main())
