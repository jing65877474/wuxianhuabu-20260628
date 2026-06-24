# GPT-Image2 Style Library for Infinite Canvas

This directory vendors the style-retrieval assets used by Infinite Canvas style matching.

The app resolves the library in this order:

1. `STYLE_LIBRARY_DIR` environment variable, when set.
2. This project directory: `style_libraries/gpt-image-2`.
3. Local Codex skill fallback: `~/.codex/skills/gpt-image-2-style-library`.

Keeping this directory in the repository makes the canvas portable to another computer without requiring the local Codex skill to be installed first.

## Daily auto update

Infinite Canvas triggers a background daily update for this project-vendored library on service startup.

- Trigger: once per local calendar day when the app starts.
- Script: `scripts/update_daily_sources.py`.
- State: `references/daily-update-state.json`.
- Log: `references/daily-update.log`.
- Lock: `references/.daily-update.lock`.
- Disable: set environment variable `STYLE_LIBRARY_AUTO_UPDATE=0`.
- Timeout: set `STYLE_LIBRARY_AUTO_UPDATE_TIMEOUT` in seconds; default is `900`.

This updater only targets this project directory. It does not write to `~/.codex/skills/gpt-image-2-style-library` unless you explicitly run scripts from that external skill directory yourself.

Included runtime files:

- `scripts/search_all.py`
- `references/style-library.md`
- `references/case-catalog.md`
- `references/cases.json`
- `references/youmind-public-cases.json`
- `references/awesome-readme-cases.json`
- `references/evolink-api-prompts-cases.json`
- `references/evolink-web-gallery-cases.json`
- `references/opennana-cases.json`

Excluded local/runtime files:

- logs
- daily update state/cache files
- Codex agent configuration
- install/package metadata not required by the app

Source skill: `gpt-image-2-style-library`.
