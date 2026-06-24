# Infinite Canvas Change Rules

Before changing image-generation behavior, create a backup:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\backup-generation-logic.ps1 -Reason "describe-the-change"
```

This is mandatory before editing any of these areas:

- reference-image routing, roles, weights, upload rules, or fidelity
- person similarity or identity-control prompts
- product identity, replacement, recognition, or hand-interaction prompts
- prompt compression, sanitization, camera overrides, or output-canvas locks
- image API payload construction or backend reference filtering
- generation task lifecycle, pending outputs, retries, or blank-node cleanup

After the change, run:

```powershell
node .\tools\verify-generation-logic.js
node --check .\static\js\smart-canvas.js
.\python\python.exe -m py_compile .\main.py
git diff --check -- static/js/smart-canvas.js main.py static/smart-canvas.html
```

Do not delete or overwrite existing backups. Backups are stored under
`backups/generation-logic/`.
