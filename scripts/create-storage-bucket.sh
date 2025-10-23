#!/bin/bash

# Script to create the site-specific storage bucket
# This script uses the Supabase CLI to create the bucket

echo "Creating site-specific storage bucket..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Get the site ID from the database
SITE_ID=$(supabase db query "SELECT id FROM site WHERE handle = 'aztec-citizens-revival' LIMIT 1;" --output json | jq -r '.[0].id')

if [ -z "$SITE_ID" ] || [ "$SITE_ID" = "null" ]; then
    echo "❌ Could not find site ID. Make sure the database is seeded."
    echo "Run: npm run db:reset"
    exit 1
fi

# Create the CMS assets bucket with site ID
BUCKET_NAME="$SITE_ID"

echo "Creating storage bucket: $BUCKET_NAME for site: $SITE_ID"

# Create the bucket using Supabase CLI
supabase storage create-bucket "$BUCKET_NAME" --public

if [ $? -eq 0 ]; then
    echo "✅ Storage bucket $BUCKET_NAME created successfully!"
    echo "You can now upload files to the CMS."
else
    echo "❌ Failed to create bucket. You may need to:"
    echo "1. Make sure you're logged in: supabase login"
    echo "2. Link your project: supabase link"
    echo "3. Or create the bucket manually in the Supabase dashboard"
    echo "4. Bucket name should be: $BUCKET_NAME"
fi
