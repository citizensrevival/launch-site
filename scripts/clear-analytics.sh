#!/bin/bash

# Clear Analytics Data Script
# This script clears all analytics data from the local Supabase database

set -e

echo "🧹 Clearing analytics data from local database..."

# Check if Supabase is running
if ! supabase status > /dev/null 2>&1; then
    echo "❌ Supabase is not running. Please start it first with: npm run db:start"
    exit 1
fi

# Get the database URL for the local instance
# Try different ways to extract the DB URL from supabase status
DB_URL=$(supabase status --output json | jq -r '.DB_URL // empty' 2>/dev/null)

if [ -z "$DB_URL" ]; then
    # Fallback: try to parse from text output
    DB_URL=$(supabase status | grep -E "DB URL|Database URL" | awk '{print $NF}' | head -1)
fi

if [ -z "$DB_URL" ]; then
    # Final fallback: construct the default local URL
    DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    echo "⚠️  Using default local database URL: $DB_URL"
else
    echo "📊 Database URL: $DB_URL"
fi

# Clear analytics data in the correct order (respecting foreign key constraints)
echo "🗑️  Clearing analytics data..."

# Clear events first (references sessions)
echo "  - Clearing events..."
psql "$DB_URL" -c "DELETE FROM public.events;"

# Clear pageviews (references sessions)
echo "  - Clearing pageviews..."
psql "$DB_URL" -c "DELETE FROM public.pageviews;"

# Clear sessions (references users)
echo "  - Clearing sessions..."
psql "$DB_URL" -c "DELETE FROM public.sessions;"

# Clear users last (referenced by sessions)
echo "  - Clearing users..."
psql "$DB_URL" -c "DELETE FROM public.users;"

# Reset sequences to start from 1
echo "  - Resetting sequences..."
psql "$DB_URL" -c "ALTER SEQUENCE public.pageviews_id_seq RESTART WITH 1;"
psql "$DB_URL" -c "ALTER SEQUENCE public.events_id_seq RESTART WITH 1;"

echo "✅ Analytics data cleared successfully!"
echo ""
echo "📈 Analytics tables cleared:"
echo "  - public.users"
echo "  - public.sessions" 
echo "  - public.pageviews"
echo "  - public.events"
echo ""
echo "🔄 Sequences reset to start from 1"
