---
description: Checkpoint System - Implement robust checkpoint management with timestamps, change documentation, and version history
---

# Checkpoint System

## Overview
This workflow implements a robust checkpoint system for saving working versions, tracking changes, and maintaining rollback capability. It ensures you can always return to a known working state and understand what changed between versions.

## Steps

### 1. Initialize Checkpoint Structure
Create the directory structure for organized checkpoint management:

#### Directory Structure
```
Checkpoints/
├── README.md (checkpoint log and index)
├── current/ (symlink to latest checkpoint)
├── archive/ (old checkpoints)
│   ├── 2024/
│   │   ├── 01-january/
│   │   ├── 02-february/
│   │   └── ...
│   └── 2025/
├── templates/ (checkpoint templates)
└── scripts/ (automation scripts)
```

#### Initialization Commands
```bash
# Create checkpoint directory structure
mkdir -p Checkpoints/{current,archive,templates,scripts}

# Create README for checkpoint tracking
touch Checkpoints/README.md

# Create archive structure for current year
CURRENT_YEAR=$(date +%Y)
mkdir -p "Checkpoints/archive/$CURRENT_YEAR/$(date +%B | tr '[:upper:]' '[:lower:]')"
```

### 2. Create Checkpoint Naming Convention
Establish consistent naming with timestamps and descriptions:

#### Naming Format
```
[YYYY-MM-DD-HHMM]-[type]-[brief-description]-[version]
```

#### Examples
- `2024-01-15-1430-feature-question-validation-v1.0`
- `2024-01-16-0915-bugfix-api-key-handling-v1.1`
- `2024-01-17-1600-refactor-component-structure-v2.0`
- `2024-01-18-1345-hotfix-print-layout-v1.1.1`

#### Checkpoint Types
- **feature**: New functionality implementation
- **bugfix**: Bug resolution and fixes
- **refactor**: Code restructuring without functional changes
- **hotfix**: Critical fixes for production issues
- **experiment**: Experimental features or approaches
- **documentation**: Documentation updates only
- **performance**: Performance optimizations

### 3. Implement Checkpoint Creation Process
Standardize how checkpoints are created and documented:

#### Pre-Checkpoint Checklist
- [ ] **Code is Working**: Application runs without errors
- [ ] **Tests Pass**: All tests are passing
- [ ] **Code Clean**: No console errors or warnings
- [ ] **Documentation Updated**: Relevant docs are current
- [ ] **Backup Ready**: Previous checkpoint is safely archived

#### Checkpoint Creation Steps
1. **Test Current State**: Verify everything works
2. **Clean Up**: Remove temporary files and console logs
3. **Document Changes**: Write change summary
4. **Create Checkpoint**: Copy files with proper naming
5. **Update Index**: Add to checkpoint log
6. **Update Current Link**: Point to new checkpoint

#### Checkpoint Script Template
```bash
#!/bin/bash
# create-checkpoint.sh

# Configuration
PROJECT_ROOT="/path/to/project"
CHECKPOINTS_DIR="$PROJECT_ROOT/Checkpoints"
TIMESTAMP=$(date +%Y-%m-%d-%H%M)
CHECKPOINT_TYPE=$1
DESCRIPTION=$2
VERSION=$3

# Validate inputs
if [ -z "$CHECKPOINT_TYPE" ] || [ -z "$DESCRIPTION" ]; then
    echo "Usage: ./create-checkpoint.sh <type> <description> [version]"
    exit 1
fi

# Create checkpoint directory
CHECKPOINT_NAME="$TIMESTAMP-$CHECKPOINT_TYPE-$DESCRIPTION-$VERSION"
CHECKPOINT_PATH="$CHECKPOINTS_DIR/archive/$(date +%Y)/$(date +%B | tr '[:upper:]' '[:lower:]')/$CHECKPOINT_NAME"

echo "Creating checkpoint: $CHECKPOINT_NAME"

# Copy project files (excluding .git, node_modules, etc.)
rsync -av --exclude='.git' --exclude='node_modules' --exclude='*.log' \
      --exclude='.DS_Store' --exclude='Checkpoints' \
      "$PROJECT_ROOT/" "$CHECKPOINT_PATH/"

# Create checkpoint metadata
cat > "$CHECKPOINT_PATH/checkpoint-info.md" << EOF
# Checkpoint Information

## Name: $CHECKPOINT_NAME
## Created: $(date)
## Type: $CHECKPOINT_TYPE
## Version: $VERSION
## Description: $DESCRIPTION

## Files Changed
$(git status --porcelain 2>/dev/null || echo "Git not available")

## Changes Summary
[Detailed description of changes made]

## Testing Status
- [ ] Manual testing completed
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance acceptable

## Known Issues
[List any known issues or limitations]

## Rollback Instructions
If this checkpoint causes issues, rollback with:
\`\`\`bash
./rollback-checkpoint.sh $CHECKPOINT_NAME
\`\`\`
EOF

# Update current symlink
ln -sfn "$CHECKPOINT_PATH" "$CHECKPOINTS_DIR/current"

# Update README index
echo "## $TIMESTAMP - $CHECKPOINT_TYPE - $DESCRIPTION" >> "$CHECKPOINTS_DIR/README.md"
echo "- **Checkpoint**: $CHECKPOINT_NAME" >> "$CHECKPOINTS_DIR/README.md"
echo "- **Files**: $(find "$CHECKPOINT_PATH" -name "*.html" -o -name "*.js" -o -name "*.css" | wc -l) files" >> "$CHECKPOINTS_DIR/README.md"
echo "- **Size**: $(du -sh "$CHECKPOINT_PATH" | cut -f1)" >> "$CHECKPOINTS_DIR/README.md"
echo "" >> "$CHECKPOINTS_DIR/README.md"

echo "Checkpoint created successfully: $CHECKPOINT_PATH"
```

### 4. Document Changes Between Checkpoints
Maintain detailed change logs for each checkpoint:

#### Change Documentation Template
```markdown
# Change Log: [Checkpoint Name]

## Overview
[Brief summary of what changed and why]

## File Changes
### Modified Files
- **bank-soal.html**: 
  - Added validation for question difficulty
  - Fixed API key handling
  - Updated print styles

### New Files
- **utils/validation.js**: New validation utilities
- **styles/print.css**: Dedicated print stylesheet

### Deleted Files
- **old-logic.js**: Removed deprecated functionality

## Functional Changes
### New Features
- Question validation before generation
- Improved error messaging
- Print layout optimization

### Bug Fixes
- Fixed API key exposure in console
- Resolved print formatting issues
- Fixed form validation edge cases

### Breaking Changes
- Changed validation function signature
- Updated API response handling

## Technical Changes
### Dependencies
- Added: [new dependency]
- Removed: [old dependency]
- Updated: [dependency] from x.x.x to y.y.y

### Performance
- Improved API response handling by 30%
- Reduced bundle size by 15KB
- Optimized print rendering

### Code Quality
- Refactored validation logic
- Added comprehensive error handling
- Improved code documentation

## Testing
### Test Coverage
- Added tests for new validation functions
- Updated existing tests for API changes
- Manual testing completed for all scenarios

### Known Issues
- [Any known limitations or problems]

## Rollback Information
### Previous Checkpoint
- **Name**: [previous checkpoint name]
- **Reason**: [why rollback might be needed]

### Rollback Steps
1. Backup current changes if needed
2. Run rollback script
3. Test restored functionality
4. Update any dependent systems
```

### 5. Implement Rollback Capability
Create reliable rollback procedures:

#### Rollback Script Template
```bash
#!/bin/bash
# rollback-checkpoint.sh

CHECKPOINT_NAME=$1
PROJECT_ROOT="/path/to/project"
CHECKPOINTS_DIR="$PROJECT_ROOT/Checkpoints"

if [ -z "$CHECKPOINT_NAME" ]; then
    echo "Usage: ./rollback-checkpoint.sh <checkpoint-name>"
    echo "Available checkpoints:"
    find "$CHECKPOINTS_DIR/archive" -name "*-*-*-*" -type d | sort -r | head -10
    exit 1
fi

# Find checkpoint
CHECKPOINT_PATH=$(find "$CHECKPOINTS_DIR/archive" -name "*$CHECKPOINT_NAME*" -type d | head -1)

if [ -z "$CHECKPOINT_PATH" ]; then
    echo "Checkpoint not found: $CHECKPOINT_NAME"
    exit 1
fi

echo "Rolling back to: $CHECKPOINT_PATH"

# Create backup of current state before rollback
BACKUP_NAME="rollback-backup-$(date +%Y-%m-%d-%H%M)"
BACKUP_PATH="$CHECKPOINTS_DIR/archive/$(date +%Y)/$(date +%B | tr '[:upper:]' '[:lower:]')/$BACKUP_NAME"

echo "Creating backup: $BACKUP_PATH"
rsync -av --exclude='.git' --exclude='node_modules' --exclude='Checkpoints' \
      "$PROJECT_ROOT/" "$BACKUP_PATH/"

# Restore from checkpoint
rsync -av --exclude='checkpoint-info.md' "$CHECKPOINT_PATH/" "$PROJECT_ROOT/"

# Update current symlink
ln -sfn "$CHECKPOINT_PATH" "$CHECKPOINTS_DIR/current"

echo "Rollback completed. Backup saved as: $BACKUP_PATH"
```

### 6. Maintain Version History
Keep track of all checkpoints and their relationships:

#### Version History Template
```markdown
# Version History

## Current Version: v2.1.0 (2024-01-18)
- **Status**: Stable
- **Checkpoint**: 2024-01-18-1345-hotfix-print-layout-v2.1.0
- **Changes**: Fixed print layout issues, improved validation

## Version Tree
```
v1.0.0 (2024-01-01) ── v1.1.0 (2024-01-05) ── v1.2.0 (2024-01-10)
                      │                      │
                      ├── v1.1.1 (2024-01-06)  ├── v2.0.0 (2024-01-15)
                      │                      │
                      └── v1.1.2 (2024-01-08)  ├── v2.1.0 (2024-01-18)
                                             │
                                             └── v2.0.1 (2024-01-16)
```

## Release Notes

### v2.1.0 - Hotfix Release (2024-01-18)
**Fixed**: Print layout formatting issues
**Fixed**: Question validation edge cases
**Improved**: Error message clarity

### v2.0.0 - Major Release (2024-01-15)
**Added**: Question validation system
**Added**: Improved error handling
**Refactored**: Component architecture
**Breaking**: Updated validation function signatures

### v1.2.0 - Feature Release (2024-01-10)
**Added**: Multiple print layout options
**Added**: Question categorization
**Improved**: UI responsiveness

## Migration Guides
### v1.x to v2.0 Migration
- Update validation function calls
- Check API response handling
- Test print functionality
```

### 7. Automation and Maintenance

#### Daily Backup Script
```bash
#!/bin/bash
# daily-backup.sh

PROJECT_ROOT="/path/to/project"
CHECKPOINTS_DIR="$PROJECT_ROOT/Checkpoints"
TIMESTAMP=$(date +%Y-%m-%d-%H%M)

# Create automatic daily backup
BACKUP_NAME="$TIMESTAMP-auto-daily-backup"
BACKUP_PATH="$CHECKPOINTS_DIR/archive/$(date +%Y)/$(date +%B | tr '[:upper:]' '[:lower:]')/$BACKUP_NAME"

rsync -av --exclude='.git' --exclude='node_modules' --exclude='*.log' \
      --exclude='.DS_Store' --exclude='Checkpoints' \
      "$PROJECT_ROOT/" "$BACKUP_PATH/"

# Clean up old backups (keep last 30 days)
find "$CHECKPOINTS_DIR/archive" -name "*auto-daily-backup*" -type d -mtime +30 -exec rm -rf {} \;

echo "Daily backup created: $BACKUP_PATH"
```

#### Checkpoint Cleanup Script
```bash
#!/bin/bash
# cleanup-checkpoints.sh

CHECKPOINTS_DIR="/path/to/project/Checkpoints"

# Remove checkpoints older than 90 days (except major releases)
find "$CHECKPOINTS_DIR/archive" -name "*-*-*-*" -type d -mtime +90 \
  ! -name "*v[0-9]*.0*" -exec rm -rf {} \;

# Compress checkpoints older than 30 days
find "$CHECKPOINTS_DIR/archive" -name "*-*-*-*" -type d -mtime +30 -exec tar -czf {}.tar.gz {} \; -exec rm -rf {} \;

echo "Checkpoint cleanup completed"
```

### 8. Best Practices

#### When to Create Checkpoints
- **Before Major Changes**: Starting new features or refactoring
- **After Feature Completion**: When a feature is fully working
- **Before Deployment**: Before pushing to production
- **After Bug Fixes**: When critical issues are resolved
- **Regular Intervals**: Daily or weekly for safety

#### Checkpoint Quality
- **Test Thoroughly**: Ensure checkpoints represent working states
- **Document Clearly**: Explain what changed and why
- **Size Management**: Keep checkpoints reasonably sized
- **Consistent Naming**: Follow naming conventions strictly

#### Recovery Planning
- **Test Rollbacks**: Regularly test rollback procedures
- **Backup Strategy**: Have multiple backup layers
- **Documentation**: Keep recovery procedures well-documented
- **Communication**: Inform team members before major rollbacks

### 9. Integration with Development Workflow

#### Pre-Commit Checklist
```bash
#!/bin/bash
# pre-commit-check.sh

echo "Pre-commit checkpoint validation..."

# Check if current state is working
if ! npm test > /dev/null 2>&1; then
    echo "❌ Tests failing - cannot create checkpoint"
    exit 1
fi

# Check for console errors
if grep -r "console.error" src/ > /dev/null 2>&1; then
    echo "⚠️  Console errors found - review before checkpoint"
fi

# Check file sizes
PROJECT_SIZE=$(du -sh . | cut -f1)
echo "Project size: $PROJECT_SIZE"

echo "✅ Ready for checkpoint creation"
```

#### Integration with Git Hooks
```bash
# .git/hooks/pre-commit
#!/bin/bash

# Run checkpoint validation
./Checkpoints/scripts/pre-commit-check.sh

# If validation passes, suggest creating checkpoint
echo "Consider creating a checkpoint before committing:"
echo "./Checkpoints/scripts/create-checkpoint.sh feature \"$(git log -1 --pretty=%B)\""
```

## Implementation Commands

```bash
# Initialize checkpoint system
mkdir -p Checkpoints/{archive,templates,scripts}
chmod +x Checkpoints/scripts/*.sh

# Create first checkpoint
./Checkpoints/scripts/create-checkpoint.sh initial "project setup" v1.0.0

# List available checkpoints
find Checkpoints/archive -name "*-*-*-*" -type d | sort -r

# Rollback to previous checkpoint
./Checkpoints/scripts/rollback-checkpoint.sh v1.0.0

# Set up daily backups (cron job)
echo "0 2 * * * /path/to/project/Checkpoints/scripts/daily-backup.sh" | crontab -
```

## Success Metrics

Your checkpoint system is effective when:
- Rollbacks are quick and reliable
- Team members can find appropriate checkpoints easily
- Change history is clear and searchable
- Storage usage is manageable
- Recovery from failures is routine and stress-free
