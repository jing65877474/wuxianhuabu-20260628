param(
    [int]$Port = 3001,
    [string]$HostName = "0.0.0.0"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$Python = Join-Path $ProjectRoot "python\python.exe"
if (-not (Test-Path $Python)) {
    $Python = "python"
}

Write-Host "[Safe Share] Starting static-only share server..."
Write-Host "[Safe Share] API, assets, output, data, and history.json are blocked."
Write-Host "[Safe Share] URL: http://127.0.0.1:$Port/"

& $Python (Join-Path $PSScriptRoot "safe_share_server.py") --host $HostName --port $Port
