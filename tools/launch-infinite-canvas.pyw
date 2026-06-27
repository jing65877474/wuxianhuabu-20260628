import ctypes
import socket
import subprocess
import sys
import time
import urllib.request
import webbrowser
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
MAIN = ROOT / "main.py"
PYTHONW = ROOT / "python" / "pythonw.exe"
URL = "http://127.0.0.1:3000/"


def port_is_open():
    try:
        with socket.create_connection(("127.0.0.1", 3000), timeout=0.4):
            return True
    except OSError:
        return False


def http_is_ready():
    try:
        with urllib.request.urlopen(URL, timeout=1) as response:
            return response.status < 500
    except Exception:
        return False


def show_error(message):
    ctypes.windll.user32.MessageBoxW(None, message, "Infinite Canvas", 0x10)


def start_server():
    executable = PYTHONW if PYTHONW.exists() else Path(sys.executable)
    creation_flags = getattr(subprocess, "CREATE_NO_WINDOW", 0) | getattr(
        subprocess, "DETACHED_PROCESS", 0
    )
    subprocess.Popen(
        [str(executable), str(MAIN)],
        cwd=str(ROOT),
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=creation_flags,
        close_fds=True,
    )


def main():
    if not MAIN.exists():
        show_error(f"main.py was not found:\n{MAIN}")
        return

    if not port_is_open():
        try:
            start_server()
        except Exception as exc:
            show_error(f"Unable to start Infinite Canvas:\n{exc}")
            return

    for _ in range(60):
        if http_is_ready():
            webbrowser.open(URL)
            return
        time.sleep(0.25)

    show_error(f"Infinite Canvas did not become ready:\n{URL}")


if __name__ == "__main__":
    main()
