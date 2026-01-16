<#
cleanup-repo.ps1
PowerShell helper to consolidate the repo and archive or remove legacy/duplicate folders.
Usage (from repo root):
  powershell -ExecutionPolicy Bypass -File .\scripts\cleanup-repo.ps1 [-DryRun] [-AutoConfirm] [-Install] [-StartDev]

Options:
  -DryRun     : Show what would be archived/removed but do not perform the move.
  -AutoConfirm: Do not prompt for confirmation (use with caution).
  -Install    : Run `npm install` in teams-notes-web after consolidation.
  -StartDev   : Launch a new PowerShell window that starts `npm run dev` in teams-notes-web.
  -Purge      : Permanently remove the archived items instead of moving them to `archive/`.

This script is conservative: it moves discovered legacy folders into an `archive/` folder with a timestamp.
You should verify everything works (teams-notes-web runs, import works) before using -Purge.
#>

param(
  [switch]$DryRun,
  [switch]$AutoConfirm,
  [switch]$Install,
  [switch]$StartDev,
  [switch]$Purge
)

function Write-Info($m) { Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Warn($m) { Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Write-Err($m) { Write-Host "[ERROR] $m" -ForegroundColor Red }

# Determine repo root (parent of this scripts folder)
$ScriptPath = $MyInvocation.MyCommand.Definition
$ScriptDir = Split-Path $ScriptPath -Parent
$RepoRoot = (Resolve-Path (Join-Path $ScriptDir '..')).ProviderPath
Write-Info "Repo root: $RepoRoot"

# Candidate items to archive/remove (customize as needed)
$candidates = @(
  'teams-notes',
  'mock_data',
  'public',
  'recordings',
  'src',
  'tools',
  'ingest.js'
)

# Filter to existing items
$existing = @()
foreach ($c in $candidates) {
  $full = Join-Path $RepoRoot $c
  if (Test-Path $full) { $existing += $c }
}

if (-not $existing) {
  Write-Info "No legacy/duplicate candidates found. Nothing to archive or remove."
  exit 0
}

Write-Info "Found the following candidate items:"
$existing | ForEach-Object { Write-Host "  - $_" }

if ($DryRun) {
  Write-Info "Dry run requested. No changes will be made."
  exit 0
}

if (-not $AutoConfirm) {
  $yn = Read-Host "Archive these items into ./archive/ (recommended). Proceed? (Y/N)"
  if ($yn -notin @('Y','y','Yes','yes')) { Write-Warn "Aborted by user."; exit 1 }
}

# Create archive directory
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$archiveDir = Join-Path $RepoRoot "archive\cleanup-$timestamp"
New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
Write-Info "Archiving to: $archiveDir"

# Move items
foreach ($name in $existing) {
  try {
    $src = Join-Path $RepoRoot $name
    $dest = Join-Path $archiveDir $name
    Write-Info "Moving: $src -> $dest"
    Move-Item -Path $src -Destination $dest -Force
  } catch {
    Write-Err "Failed to move $name : $_"
  }
}

if ($Purge) {
  Write-Warn "Purge requested. Removing archive directory contents (irreversible)."
  try {
    Get-ChildItem -Path $archiveDir | ForEach-Object { Remove-Item $_.FullName -Recurse -Force }
    Write-Info "Purge complete."
  } catch {
    Write-Err "Purge failed: $_"
  }
}

# Ensure teams-notes-web is present and offer to install dependencies
$webDir = Join-Path $RepoRoot 'teams-notes-web'
if (Test-Path $webDir) {
  if ($Install) {
    Write-Info "Running npm install in teams-notes-web"
    Push-Location $webDir
    try {
      & npm install
    } catch {
      Write-Err "npm install failed: $_"
    }
    Pop-Location
  } else {
    Write-Info "Skipping npm install. Use -Install to run it automatically."
  }
} else {
  Write-Warn "teams-notes-web not found at expected path: $webDir. Please verify the project structure."
}

# Optionally start dev server in a new PowerShell window
if ($StartDev) {
  if (-not (Test-Path $webDir)) { Write-Err "Cannot start dev server; teams-notes-web not found." }
  else {
    $cmd = "cd `"$webDir`"; npm run dev"
    Write-Info "Starting dev server in new PowerShell window: $cmd"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd -WindowStyle Normal
  }
}

Write-Info "Done. Archived items are in: $archiveDir"
Write-Info "Verify teams-notes-web runs and that import endpoint works before deleting archive. Use -Purge to remove archive."
