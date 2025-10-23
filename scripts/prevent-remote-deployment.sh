#!/bin/bash

# Safety script to prevent accidental remote Supabase deployments
# This script should be run before any deployment commands

echo "🚨 DEPLOYMENT SAFETY CHECK 🚨"
echo "================================"
echo ""
echo "This script prevents accidental remote deployments to Supabase."
echo ""

# Check if we're in a local development environment
if [[ "$NODE_ENV" == "production" ]] || [[ "$SUPABASE_ENV" == "production" ]]; then
    echo "❌ ERROR: Production environment detected!"
    echo "   NODE_ENV: $NODE_ENV"
    echo "   SUPABASE_ENV: $SUPABASE_ENV"
    echo ""
    echo "This script is designed to prevent remote deployments."
    echo "If you need to deploy to production, use a different workflow."
    exit 1
fi

# Check if we're linked to a remote project
if supabase status | grep -q "linked"; then
    echo "⚠️  WARNING: Supabase project is linked to remote!"
    echo ""
    echo "To prevent accidental remote deployment:"
    echo "1. Unlink from remote: supabase unlink"
    echo "2. Or use --local flag for all commands"
    echo ""
    read -p "Do you want to unlink from remote? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Unlinking from remote..."
        supabase unlink
        echo "✅ Unlinked from remote project"
    else
        echo "❌ Deployment cancelled for safety"
        exit 1
    fi
fi

# Check if we're using local Supabase
if ! supabase status | grep -q "127.0.0.1"; then
    echo "❌ ERROR: Not using local Supabase instance!"
    echo "Please ensure you're running: npm start (which uses local Supabase)"
    exit 1
fi

echo "✅ Safety checks passed - local development environment confirmed"
echo "✅ You can proceed with local development commands"
