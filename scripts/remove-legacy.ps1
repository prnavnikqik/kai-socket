# PowerShell helper to remove legacy teams-notes folder after migration
$legacy = Join-Path $PSScriptRoot '..\teams-notes'
if (Test-Path $legacy) {
  Write-Host "Removing $legacy"
  Remove-Item -Recurse -Force $legacy
  Write-Host "Removed legacy folder."
} else {
  Write-Host "No legacy folder found at $legacy"
}
