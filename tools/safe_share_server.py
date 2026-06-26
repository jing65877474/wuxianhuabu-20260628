#!/usr/bin/env python3
"""Serve the Infinite Canvas web UI safely for sharing.

This server is intentionally static-only:
- allows the front-end files under /static
- maps / to static/smart-canvas.html
- blocks /api, /ws, /assets, /output, /data, history.json, and other local files

It is meant for showing the web project UI without exposing API keys,
local canvas history, generated outputs, uploaded assets, or private data.
"""

from __future__ import annotations

import argparse
import html
import ipaddress
import mimetypes
import os
import socket
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote, urlsplit


BASE_DIR = Path(__file__).resolve().parents[1]
STATIC_DIR = BASE_DIR / "static"
INDEX_FILE = STATIC_DIR / "smart-canvas.html"

DENY_PREFIXES = (
    "/api",
    "/ws",
    "/assets",
    "/output",
    "/data",
    "/backups",
    "/style_libraries",
    "/python",
    "/packages",
    "/API",
    "/.git",
    "/.agents",
    "/tools",
)

DENY_NAMES = {
    "history.json",
    "main.py",
    "AGENTS.md",
    ".env",
    ".gitignore",
}

ALLOWED_STATIC_EXTENSIONS = {
    ".html",
    ".css",
    ".js",
    ".mjs",
    ".svg",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
}


def local_ipv4_addresses() -> list[str]:
    addresses: set[str] = set()
    try:
        hostname = socket.gethostname()
        for item in socket.getaddrinfo(hostname, None, socket.AF_INET):
            ip = item[4][0]
            try:
                parsed = ipaddress.ip_address(ip)
            except ValueError:
                continue
            if not parsed.is_loopback and not parsed.is_link_local:
                addresses.add(ip)
    except Exception:
        pass
    return sorted(addresses)


def safe_static_path(url_path: str) -> Path | None:
    if url_path in ("", "/"):
        return INDEX_FILE
    if url_path == "/share-health":
        return None
    if any(url_path == prefix or url_path.startswith(prefix + "/") for prefix in DENY_PREFIXES):
        raise PermissionError("blocked local or API path")
    clean = unquote(url_path).replace("\\", "/")
    name = clean.rsplit("/", 1)[-1]
    if name in DENY_NAMES or name.startswith("."):
        raise PermissionError("blocked private file")
    if not clean.startswith("/static/"):
        raise FileNotFoundError("only /static files are shared")
    relative = clean[len("/static/") :].lstrip("/")
    candidate = (STATIC_DIR / relative).resolve()
    static_root = STATIC_DIR.resolve()
    try:
        candidate.relative_to(static_root)
    except ValueError as exc:
        raise PermissionError("path escapes static directory") from exc
    if candidate.suffix.lower() not in ALLOWED_STATIC_EXTENSIONS:
        raise PermissionError("file type is not shared")
    return candidate


class SafeShareHandler(BaseHTTPRequestHandler):
    server_version = "InfiniteCanvasSafeShare/1.0"

    def log_message(self, fmt: str, *args) -> None:
        print(f"[share] {self.address_string()} - {fmt % args}")

    def send_text(self, status: int, text: str, content_type: str = "text/plain; charset=utf-8") -> None:
        data = text.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Robots-Tag", "noindex, nofollow")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self) -> None:
        parsed = urlsplit(self.path)
        path = parsed.path or "/"
        if path == "/share-health":
            self.send_text(200, "ok")
            return
        try:
            file_path = safe_static_path(path)
        except PermissionError:
            self.send_text(403, "Blocked by safe share mode: local data, API, assets, and outputs are not shared.")
            return
        except FileNotFoundError:
            self.send_text(404, "Not found in safe share mode.")
            return
        if not file_path or not file_path.exists() or not file_path.is_file():
            self.send_text(404, "Not found.")
            return
        content_type = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
        if file_path.suffix.lower() == ".js":
            content_type = "application/javascript; charset=utf-8"
        elif file_path.suffix.lower() in {".html", ".css", ".svg"}:
            content_type = f"{content_type}; charset=utf-8"
        try:
            data = file_path.read_bytes()
        except OSError as exc:
            self.send_text(500, f"Failed to read file: {html.escape(str(exc))}")
            return
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Robots-Tag", "noindex, nofollow")
        self.end_headers()
        self.wfile.write(data)

    def do_HEAD(self) -> None:
        self.do_GET()

    def do_POST(self) -> None:
        self.send_text(403, "Blocked by safe share mode: write/API requests are disabled.")

    do_PUT = do_POST
    do_PATCH = do_POST
    do_DELETE = do_POST


def main() -> None:
    parser = argparse.ArgumentParser(description="Start a static-only safe share server for Infinite Canvas.")
    parser.add_argument("--host", default=os.environ.get("SAFE_SHARE_HOST", "0.0.0.0"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("SAFE_SHARE_PORT", "3001")))
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.host, args.port), SafeShareHandler)
    print("Infinite Canvas safe share server")
    print("Sensitive paths blocked: /api, /ws, /assets, /output, /data, history.json")
    print(f"Local URL: http://127.0.0.1:{args.port}/")
    for ip in local_ipv4_addresses():
        print(f"LAN URL:   http://{ip}:{args.port}/")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping safe share server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
