#!/bin/bash

# CMS Implementation Commit Script
# This script commits the current CMS implementation step

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <step-description>"
    echo "Example: $0 'Phase 1.1: Asset Upload (Basic)'"
    exit 1
fi

STEP_DESCRIPTION="$1"

echo "📝 Committing CMS Implementation Step"
echo "====================================="
echo "Step: $STEP_DESCRIPTION"
echo ""

# Check git status
echo "🔍 Checking git status..."
git status --porcelain

# Add all changes
echo ""
echo "📦 Adding all changes..."
git add .

# Commit with descriptive message
echo ""
echo "💾 Committing changes..."
git commit -m "feat(cms): $STEP_DESCRIPTION

- Implemented basic asset upload functionality
- Added drag-and-drop file upload UI
- Integrated Supabase Storage for file uploads
- Created asset management client functions
- Added React hooks for asset operations
- Implemented grid/list view for assets
- Added filtering and search capabilities
- Created pagination for asset lists
- Added delete functionality with confirmation

Files modified:
- src/admin/cms/CmsAssets.tsx
- src/lib/cms/client.ts
- src/lib/cms/hooks.ts
- src/lib/cms/types.ts
- CMS_IMPLEMENTATION_PLAN.md"

echo ""
echo "✅ Commit completed successfully!"
echo ""
echo "Next steps:"
echo "1. Test the implementation: ./scripts/test-cms-step.sh"
echo "2. Update the plan: mark completed items with ✅"
echo "3. Move to next step in the implementation"
