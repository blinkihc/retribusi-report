param (
    [Parameter(Mandatory=$true)]
    [string]$Type,

    [Parameter(Mandatory=$true)]
    [string]$Description,

    [string]$Version = "1.0"
)

$ErrorActionPreference = "SilentlyContinue" # Continue on copy errors for locked files

# Configuration
$ProjectRoot = Resolve-Path "$PSScriptRoot\..\.."
$CheckpointsDir = "$ProjectRoot\Checkpoints"
$Timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$Year = Get-Date -Format "yyyy"
$Month = (Get-Date).ToString("MM-MMMM").ToLower()

# Create checkpoint directory path
$CheckpointName = "$Timestamp-$Type-$Description-v$Version"
$CheckpointPath = "$CheckpointsDir\archive\$Year\$Month\$CheckpointName"

Write-Host "Creating checkpoint: $CheckpointName" -ForegroundColor Cyan

# Create directory
New-Item -Path $CheckpointPath -ItemType Directory -Force | Out-Null

# Exclude list for Get-ChildItem
$Exclude = @(".git", "node_modules", "Checkpoints", "dist", ".windsurf", ".vscode", "*.log", "coverage")

# Copy files
Write-Host "Copying files..."
$Items = Get-ChildItem -Path $ProjectRoot
foreach ($Item in $Items) {
    if ($Item.Name -notin $Exclude) {
        Copy-Item -Path $Item.FullName -Destination "$CheckpointPath\" -Recurse -Force
    }
}

# Create Metadata
$GitStatus = git status --porcelain 2>&1
if ($LASTEXITCODE -ne 0) { $GitStatus = "Git not available" }

$InfoContent = @"
# Checkpoint Information

## Name: $CheckpointName
## Created: $(Get-Date)
## Type: $Type
## Version: $Version
## Description: $Description

## Files Changed
$GitStatus

## Changes Summary
$Description

## Testing Status
- [ ] Manual testing completed
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance acceptable
"@

Set-Content -Path "$CheckpointPath\checkpoint-info.md" -Value $InfoContent

# Update README
$LogEntry = "`n## $Timestamp - $Type - $Description`n- **Checkpoint**: $CheckpointName`n- **Version**: $Version`n"
Add-Content -Path "$CheckpointsDir\README.md" -Value $LogEntry

Write-Host "Checkpoint created successfully at: $CheckpointPath" -ForegroundColor Green
