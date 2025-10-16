#!/bin/bash

# CMS Implementation Testing Script
# This script handles the testing workflow between each CMS implementation step

set -e

echo "🧪 CMS Implementation Testing Workflow"
echo "======================================"

# Step 1: Kill all development servers
echo "1️⃣ Killing all Vite servers and database processes..."
pkill -f "vite" || true
pkill -f "npm run start" || true
npm run db:stop || true

# Step 2: Check if we need to redeploy Supabase
echo ""
echo "2️⃣ Checking Supabase status..."
if ! npm run db:ensure > /dev/null 2>&1; then
    echo "   Supabase not running, starting database..."
    npm run db:reset
else
    echo "   Supabase is running, generating types..."
    npm run db:generate
fi

# Step 3: Check for linting errors
echo ""
echo "3️⃣ Checking for linting errors..."
if command -v npm > /dev/null 2>&1; then
    npm run lint 2>/dev/null || echo "   ⚠️  Some linting issues found (check manually)"
else
    echo "   ⚠️  npm not found, skipping lint check"
fi

# Step 4: Build the project to check for errors
echo ""
echo "4️⃣ Building project to check for errors..."
npm run build

# Step 5: Start development server
echo ""
echo "5️⃣ Starting development server..."
echo "   You can now test the implemented features at:"
echo "   - Public site: http://localhost:3000"
echo "   - Admin panel: http://localhost:3000/manage"
echo "   - CMS Assets: http://localhost:3000/manage/cms/assets"
echo ""
echo "   Press Ctrl+C to stop the server when done testing"
echo ""

# Start the development server
npm start
