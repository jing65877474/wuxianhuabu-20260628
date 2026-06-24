param(
    [string]$Reason = "before-generation-logic-change"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$backupRoot = Join-Path $projectRoot "backups\generation-logic"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$destination = Join-Path $backupRoot $stamp
$suffix = 1

while (Test-Path -LiteralPath $destination) {
    $destination = Join-Path $backupRoot "$stamp-$suffix"
    $suffix += 1
}

$files = @(
    "main.py",
    "static\js\smart-canvas.js",
    "static\smart-canvas.html"
)
$files += Get-ChildItem -LiteralPath $projectRoot -File -Filter "*.md" |
    ForEach-Object { $_.FullName.Substring($projectRoot.Length + 1) }

New-Item -ItemType Directory -Path $destination -Force | Out-Null

$manifestFiles = foreach ($relativePath in $files) {
    $source = Join-Path $projectRoot $relativePath
    if (-not (Test-Path -LiteralPath $source)) {
        continue
    }

    $target = Join-Path $destination $relativePath
    $targetDirectory = Split-Path -Parent $target
    New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
    Copy-Item -LiteralPath $source -Destination $target

    $hash = Get-FileHash -Algorithm SHA256 -LiteralPath $target
    [ordered]@{
        path = $relativePath.Replace("\", "/")
        sha256 = $hash.Hash
        bytes = (Get-Item -LiteralPath $target).Length
    }
}

$gitHead = ""
try {
    $gitHead = (git -C $projectRoot rev-parse HEAD 2>$null).Trim()
} catch {
    $gitHead = ""
}

$manifest = [ordered]@{
    created_at = (Get-Date).ToString("o")
    reason = $Reason
    project_root = $projectRoot
    git_head = $gitHead
    files = @($manifestFiles)
}

$manifest |
    ConvertTo-Json -Depth 5 |
    Set-Content -LiteralPath (Join-Path $destination "manifest.json") -Encoding UTF8

Write-Output $destination
