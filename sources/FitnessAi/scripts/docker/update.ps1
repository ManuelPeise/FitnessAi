$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot

Write-Host "Pulling images..."
docker compose pull

Write-Host "Rebuilding and recreating containers..."
docker compose up -d --build --force-recreate --remove-orphans

Write-Host "Update complete. Current compose status:"
docker compose ps
