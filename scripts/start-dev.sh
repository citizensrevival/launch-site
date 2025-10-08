#!/bin/bash

# Development startup script for Launch Site
# This script ensures Supabase is running before starting the development server

set -e

echo "🚀 Starting Launch Site development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Function to check if Supabase is running
check_supabase_status() {
    if supabase status > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Start Supabase if not running
if ! check_supabase_status; then
    echo "📦 Starting Supabase local development environment..."
    supabase start
    
    # Wait a moment for services to be ready
    echo "⏳ Waiting for Supabase services to be ready..."
    sleep 5
    
    # Verify Supabase is running
    if check_supabase_status; then
        echo "✅ Supabase is running!"
        echo "   📊 Studio: http://127.0.0.1:54323"
        echo "   🔗 API: http://127.0.0.1:54321"
        echo "   🗄️  Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    else
        echo "❌ Failed to start Supabase. Check the logs with: npm run db:logs"
        exit 1
    fi
else
    echo "✅ Supabase is already running!"
fi

# Set environment variables for local development
export VITE_SUPABASE_URL="http://127.0.0.1:54321"
export VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

echo "🌐 Starting Vite development server..."
echo "   🎯 App will be available at: http://localhost:3000"
echo "   🔧 Using local Supabase instance"

# Start the Vite development server
exec vite --mode development
