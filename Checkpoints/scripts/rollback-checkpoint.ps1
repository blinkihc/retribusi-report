param (
    [Parameter(Mandatory=$true)]
    [string]$CheckpointName
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path "$PSScriptRoot\..\.."
$CheckpointsDir = "$ProjectRoot\Checkpoints"

# Find checkpoint
$CheckpointPath = Get-ChildItem -Path "$CheckpointsDir\archive" -Recurse -Directory | Where-Object { $_.Name -like "*$CheckpointName*" } | Select-Object -First 1

if (-not $CheckpointPath) {
    Write-Error "Checkpoint not found: $CheckpointName"
    exit 1
}

Write-Host "Found Checkpoint: $($CheckpointPath.FullName)" -ForegroundColor Cyan
Write-Host "WARNING: This will overwrite current project files. A backup will be created first." -ForegroundColor Yellow

# Create Backup
$BackupName = "rollback-backup-" + (Get-Date -Format "yyyy-MM-dd-HHmm")
$BackupPath = "$CheckpointsDir\archive\backups\$BackupName"
New-Item -Path $BackupPath -ItemType Directory -Force | Out-Null

Write-Host "Creating backup at $BackupPath..."
$Exclude = @(".git", "node_modules", "Checkpoints", "dist", ".windsurf", ".vscode", "*.log")
$Items = Get-ChildItem -Path $ProjectRoot
foreach ($Item in $Items) {
    if ($Item.Name -notin $Exclude) {
        Copy-Item -Path $Item.FullName -Destination "$BackupPath\" -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Restore
Write-Host "Restoring from checkpoint..."
$CheckpointItems = Get-ChildItem -Path $CheckpointPath.FullName
foreach ($Item in $CheckpointItems) {
    if ($Item.Name -ne "checkpoint-info.md") {
        Copy-Item -Path $Item.FullName -Destination "$ProjectRoot\" -Recurse -Force
    }
}

Write-Host "Rollback complete." -ForegroundColor Green
