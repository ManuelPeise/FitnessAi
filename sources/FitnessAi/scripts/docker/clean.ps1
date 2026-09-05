$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot

Write-Host "Stopping and removing containers, volumes, and images..."
docker compose down --remove-orphans --volumes --rmi all

Write-Host "Done. Current compose resources:"
docker compose ps
