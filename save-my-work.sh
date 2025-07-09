#!/bin/bash

# Simple script to save your work with one command

echo "🔄 Saving your work..."

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "📁 Setting up git for this project..."
    git init
    git add -A
    git commit -m "Initial project setup"
    echo "✅ Git is now set up!"
fi

# Check if there are changes
if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
    # Add all changes
    git add -A
    
    # Create a simple commit message
    TIMESTAMP=$(date "+%b %d, %Y at %I:%M %p")
    
    # Count changes
    CHANGES=$(git diff --cached --stat | tail -1)
    
    # Commit
    git commit -m "Save my work - $TIMESTAMP" -m "$CHANGES"
    
    echo "✅ Your work is saved!"
    echo "📅 Saved on: $TIMESTAMP"
    echo "📊 Changes: $CHANGES"
    
    # Try to push to GitHub if remote exists
    if git remote | grep -q origin; then
        echo ""
        echo "☁️  Backing up to GitHub..."
        if git push origin main 2>/dev/null; then
            echo "✅ Backed up to GitHub successfully!"
        else
            echo "⚠️  Couldn't backup to GitHub right now (that's ok, your work is still saved locally)"
        fi
    fi
else
    echo "✨ Everything is already saved - no new changes!"
fi

echo ""
echo "💡 Tip: You can run this anytime by saying 'save my work'"