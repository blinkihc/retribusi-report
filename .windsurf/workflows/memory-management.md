---
description: Memory Management - Track important discoveries and milestones, update agent memory, and maintain accurate documentation
---

# Memory Management

## Overview
This workflow establishes a systematic approach to tracking important discoveries, updating agent memory with new insights, revising documentation, and adjusting previous assumptions. It ensures that knowledge is preserved, accessible, and continuously improved.

## Steps

### 1. Identify Significant Discoveries
Recognize and categorize important findings during development:

#### Discovery Categories
- **Technical Insights**: New understanding of code behavior or architecture
- **Problem Solutions**: Novel approaches to fixing issues
- **Performance Optimizations**: Significant improvements in speed or efficiency
- **User Experience Improvements**: Better ways to handle user interactions
- **API Integration Patterns**: Effective methods for external service integration
- **Security Considerations**: Important security findings or improvements
- **Best Practices**: Project-specific conventions that work well
- **Anti-Patterns**: Approaches to avoid in the future

#### Discovery Identification Checklist
- [ ] **Unexpected Behavior**: Code behaves differently than expected
- [ ] **Elegant Solutions**: Particularly clean or effective implementations
- [ ] **Performance Wins**: Significant speed or resource improvements
- [ ] **User Feedback**: Important insights from user testing
- [ ] **Error Patterns**: Recurring issues and their solutions
- [ ] **Integration Lessons**: Learning from API or service integrations
- [ ] **Tool Discoveries**: Useful tools or techniques found

### 2. Document Discoveries Immediately
Capture insights while they're fresh with structured documentation:

#### Discovery Documentation Template
```markdown
# Discovery: [Brief Title]

## Date: [YYYY-MM-DD]
## Category: [Technical/Performance/UX/Security/etc.]
## Impact: [High/Medium/Low]

## Context
[Brief description of the situation or problem]

## The Discovery
[Detailed explanation of what was discovered]

## Why It Matters
[Explanation of why this discovery is important]

## Technical Details
[Code examples, configuration details, or technical specifics]

## Evidence
[How this was proven or demonstrated]

## Implications
[What this means for the project going forward]

## Related Files/Components
- [File or component name]: [How it relates]
- [Another file]: [Connection to this discovery]

## Action Items
- [ ] [Update documentation]
- [ ] [Modify related code]
- [ ] [Share with team]
- [ ] [Add to best practices]

## Tags
[relevant-tags-for-searching]
```

#### Quick Capture Format
For rapid documentation during development:
```markdown
## Quick Discovery - [YYYY-MM-DD-HHMM]
**What**: [One-sentence description]
**Why**: [Why it matters]
**Where**: [File/component reference]
**Action**: [What to do about it]
```

### 3. Update Agent Memory Systems
Integrate discoveries into the memory framework:

#### Memory Update Types
- **Global Rules**: Fundamental principles that always apply
- **User Memories**: Project-specific context and preferences
- **System Memories**: Technical knowledge about the codebase
- **Workflow Updates**: New or improved processes

#### Memory Update Process
1. **Categorize the Discovery**: Determine which memory type it affects
2. **Format for Memory**: Structure information for AI consumption
3. **Update Memory Files**: Modify appropriate memory files
4. **Cross-Reference**: Link to related memories
5. **Validate Updates**: Ensure new information is accurate

#### Memory Update Template
```markdown
# [Memory Type] Update: [Discovery Title]

## Date Added: [YYYY-MM-DD]
## Source: [Discovery documentation link]

## New Information
[The new insight or understanding]

## Previous Understanding
[What was thought before this discovery]

## Why the Change
[Reason for updating the memory]

## Application
[How this should be applied going forward]

## Related Memories
- [Link to related memory entries]
```

### 4. Revise Documentation Reflecting New Understanding
Update all relevant documentation with new insights:

#### Documentation Update Strategy
- **Immediate Updates**: Critical changes that affect current work
- **Scheduled Updates**: Less urgent changes for next documentation cycle
- **Comprehensive Reviews**: Periodic updates to incorporate multiple discoveries

#### Update Priority Matrix
| Impact | Urgency | Action |
|--------|---------|--------|
| High | High | Update immediately |
| High | Medium | Update within 24 hours |
| Medium | High | Update within 48 hours |
| Medium | Medium | Schedule for next update cycle |
| Low | Any | Batch update monthly |

#### Documentation Update Checklist
- [ ] **README Files**: Update project overview and setup instructions
- [ ] **Component Documentation**: Revise component descriptions and examples
- [ ] **API Documentation**: Update interface descriptions and usage patterns
- [ ] **Workflow Files**: Update process documentation
- [ ] **Code Comments**: Add inline comments for complex discoveries
- [ ] **Troubleshooting Guides**: Add new solutions to common problems

### 5. Adjust Previous Assumptions
Systematically review and update outdated assumptions:

#### Assumption Review Process
1. **Identify Affected Areas**: Where old assumptions were applied
2. **Evaluate Impact**: How the new understanding changes things
3. **Update Code**: Modify implementations based on new insights
4. **Update Tests**: Ensure tests reflect new understanding
5. **Communicate Changes**: Inform team members of paradigm shifts

#### Assumption Update Template
```markdown
# Assumption Update: [Topic]

## Previous Assumption
[What was previously believed to be true]

## New Understanding
[What is now understood to be correct]

## Discovery Source
[Link to discovery that prompted this change]

## Areas Affected
- [Code area 1]: [How it's affected]
- [Documentation area 2]: [What needs updating]
- [Process area 3]: [How workflow changes]

## Migration Steps
1. [Step to update code]
2. [Step to update documentation]
3. [Step to inform team]
4. [Step to validate changes]

## Validation
[How to verify the new understanding is correct]
```

### 6. Access and Utilize Memories
Create systems for effective memory retrieval:

#### Memory Access Methods
- **Cascade Additional Options**: Use the built-in memory interface
- **Search by Tags**: Organize memories with searchable tags
- **Chronological Access**: Browse memories by discovery date
- **Category Browsing**: Group memories by topic or type

#### Memory Retrieval Templates
```markdown
## Memory Retrieval: [Topic]

### Relevant Memories
- **[Memory Title]**: [Brief summary] [Link]
- **[Memory Title]**: [Brief summary] [Link]

### Key Insights
- [Insight 1 from memories]
- [Insight 2 from memories]

### Recommended Actions
- [Action based on memory]
- [Another recommended action]

### Related Discoveries
- [Link to related discoveries]
```

### 7. Memory Maintenance and Curation
Keep memory systems organized and relevant:

#### Regular Maintenance Tasks
- **Weekly Review**: Review and categorize new discoveries
- **Monthly Cleanup**: Remove outdated or redundant memories
- **Quarterly Validation**: Verify all memories are still accurate
- **Annual Archive**: Move old memories to archive if no longer relevant

#### Memory Quality Standards
- **Accuracy**: All memories must be technically correct
- **Relevance**: Memories should apply to current project state
- **Completeness**: Include sufficient context for understanding
- **Actionability**: Memories should guide future decisions

#### Memory Cleanup Criteria
- **Outdated Information**: No longer applicable to current codebase
- **Superseded by Newer**: Better understanding has replaced it
- **No Longer Relevant**: Project has moved in different direction
- **Duplicate Information**: Same information documented elsewhere

### 8. Integration with Development Workflow

#### Pre-Work Memory Check
```bash
# Before starting work, check relevant memories
echo "Checking memories for [topic]..."
# Search memory files for relevant entries
grep -r "topic" memories/ --include="*.md"
```

#### Post-Discovery Memory Update
```markdown
## Memory Update Workflow

1. **Discovery Made** → Document immediately
2. **Categorize** → Determine memory type and priority
3. **Update Memory** → Add to appropriate memory file
4. **Revise Documentation** → Update affected docs
5. **Communicate** → Share with team if relevant
6. **Validate** → Test new understanding
```

#### Memory Access in Cascade
```
When working with Cascade:
1. Click "Additional Options"
2. Select "Memory Management"
3. Search or browse memories
4. Apply relevant insights to current task
5. Update memories with new discoveries
```

### 9. Tools and Automation

#### Memory Search Script
```bash
#!/bin/bash
# search-memories.sh

TOPIC=$1
MEMORY_DIR="./memories"

if [ -z "$TOPIC" ]; then
    echo "Usage: ./search-memories.sh <search-topic>"
    exit 1
fi

echo "Searching memories for: $TOPIC"
find "$MEMORY_DIR" -name "*.md" -exec grep -l "$TOPIC" {} \; | while read file; do
    echo "📄 $file"
    grep -n "$TOPIC" "$file" | head -3
    echo ""
done
```

#### Memory Update Script
```bash
#!/bin/bash
# update-memory.sh

MEMORY_TYPE=$1
TITLE="$2"
CONTENT="$3"

if [ -z "$MEMORY_TYPE" ] || [ -z "$TITLE" ] || [ -z "$CONTENT" ]; then
    echo "Usage: ./update-memory.sh <type> <title> <content>"
    exit 1
fi

MEMORY_FILE="./memories/${MEMORY_TYPE}.md"
DATE=$(date +%Y-%m-%d)

cat >> "$MEMORY_FILE" << EOF

## $TITLE
**Date Added**: $DATE
$CONTENT
EOF

echo "Memory updated: $MEMORY_FILE"
```

### 10. Best Practices

#### Memory Creation
- **Be Specific**: Include concrete details and examples
- **Provide Context**: Explain the situation around the discovery
- **Include Evidence**: Show how the discovery was validated
- **Make Actionable**: Explain how to use the information

#### Memory Organization
- **Consistent Tagging**: Use standardized tags for categorization
- **Clear Titling**: Make memories easy to identify
- **Cross-Reference**: Link related memories together
- **Version Control**: Track changes to memories over time

#### Memory Usage
- **Check Early**: Consult memories before starting new work
- **Update Frequently**: Add new discoveries promptly
- **Share Widely**: Make memories available to entire team
- **Review Regularly**: Keep memories current and relevant

## Implementation Commands

```bash
# Initialize memory system
mkdir -p memories/{global,user,system,workflow}
echo "# Memory Management System" > memories/README.md

# Create new memory entry
./scripts/update-memory.sh system "API Key Handling" "New approach for secure API key management"

# Search memories
./scripts/search-memories.sh "validation"

# Review recent memories
find memories/ -name "*.md" -mtime -7 -exec ls -la {} \;

# Validate memory accuracy
./scripts/validate-memories.sh
```

## Success Metrics

Your memory management system is effective when:
- Team members consult memories before making decisions
- Discoveries are captured promptly and consistently
- Documentation stays aligned with current understanding
- Previous mistakes are avoided through learned insights
- New team members get up to speed quickly using memories
- The project evolves based on accumulated wisdom rather than repeating mistakes
