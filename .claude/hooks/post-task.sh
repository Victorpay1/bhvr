#!/bin/bash

# Auto-commit hook for Claude Code
# This runs after completing a task

# Check if we're in a git repository
if [ -d .git ]; then
    # Check if there are any changes
    if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
        echo "🔄 Auto-saving your work..."
        
        # Add all changes
        git add -A
        
        # Create commit message with timestamp
        TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
        COMMIT_MSG="Auto-save: Progress update - $TIMESTAMP"
        
        # If Claude provided a task description, use it
        if [ -n "$CLAUDE_TASK_DESCRIPTION" ]; then
            COMMIT_MSG="$CLAUDE_TASK_DESCRIPTION - $TIMESTAMP"
        fi
        
        # Commit the changes
        git commit -m "$COMMIT_MSG" --quiet
        
        echo "✅ Your work has been saved!"
        echo "📝 Commit: $COMMIT_MSG"
        
        # Optional: Ask if user wants to push to GitHub
        echo ""
        echo "💭 To backup to GitHub, just say 'push to github'"
    else
        echo "✨ No changes to save - your work is up to date!"
    fi
else
    echo "📁 This isn't a git project yet. Say 'make this a git project' to enable auto-save!"
fi