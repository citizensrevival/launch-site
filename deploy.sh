#!/bin/bash

# Deployment script for merging develop to main with semantic versioning
# Usage: ./deploy.sh <version> [message]
# Example: ./deploy.sh v1.2.3 "Added new features"

set -e  # Exit on any error

# Check if version parameter is provided
if [ $# -lt 1 ]; then
    echo "Usage: $0 <version> [message]"
    echo "Example: $0 v1.2.3 \"Added new features\""
    echo "Version should follow semantic versioning (e.g., v1.0.0, v1.2.3)"
    exit 1
fi

VERSION=$1
MESSAGE=${2:-"Release $VERSION"}

# Validate version format (basic semantic versioning check)
if [[ ! $VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Error: Version must follow semantic versioning format (e.g., v1.0.0, v1.2.3)"
    exit 1
fi

echo "🚀 Starting deployment process..."
echo "Version: $VERSION"
echo "Message: $MESSAGE"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check for uncommitted changes
echo "📋 Checking for uncommitted changes..."
if ! git diff-index --quiet HEAD --; then
    echo "❌ Error: You have uncommitted changes. Please commit or stash them first."
    echo "Uncommitted files:"
    git diff --name-only
    exit 1
fi
echo "✅ No uncommitted changes found"

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Verify we're on develop branch
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "❌ Error: You must be on the 'develop' branch to run this script"
    echo "Current branch: $CURRENT_BRANCH"
    echo "Please run: git checkout develop"
    exit 1
fi

# Fetch latest changes from remote
echo "📥 Fetching latest changes from remote..."
git fetch origin

# Check if develop is up to date with remote
echo "🔄 Checking if develop branch is up to date..."
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/develop)

if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    echo "❌ Error: Your local develop branch is not up to date with origin/develop"
    echo "Please run: git pull origin develop"
    exit 1
fi
echo "✅ Develop branch is up to date"

# Check if tag already exists
if git tag -l | grep -q "^$VERSION$"; then
    echo "❌ Error: Tag $VERSION already exists"
    echo "Existing tags:"
    git tag -l | grep "^v" | sort -V
    exit 1
fi

# Switch to main branch
echo "🔄 Switching to main branch..."
git checkout main

# Pull latest main branch
echo "📥 Pulling latest main branch..."
git pull origin main

# Merge develop into main
echo "🔀 Merging develop into main..."
git merge develop --no-ff -m "Merge develop into main for release $VERSION"

# Create and push the tag
echo "🏷️  Creating tag $VERSION..."
git tag -a "$VERSION" -m "$MESSAGE"

# Push the merge and tag
echo "📤 Pushing merge and tag to origin..."
git push origin main
git push origin "$VERSION"

# Switch back to develop
echo "🔄 Switching back to develop branch..."
git checkout develop

echo ""
echo "🎉 Deployment completed successfully!"
echo "✅ Merged develop to main"
echo "✅ Created and pushed tag: $VERSION"
echo "✅ Switched back to develop branch"
echo ""
echo "Your deployment should now be triggered automatically."
