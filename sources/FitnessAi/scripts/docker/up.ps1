$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot

Write-Host "Starting Docker compose stack..."
docker compose up -d --build --remove-orphans

Write-Host "Stack is up. Current compose status:"
docker compose ps
