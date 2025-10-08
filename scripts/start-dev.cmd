@echo off
REM Development startup script for Launch Site (Windows)
REM This script ensures Supabase is running before starting the development server

echo 🚀 Starting Launch Site development environment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    exit /b 1
)

REM Check if Supabase CLI is installed
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Supabase CLI is not installed. Please install it first:
    echo    npm install -g supabase
    exit /b 1
)

REM Start Supabase if not running
supabase status >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Starting Supabase local development environment...
    supabase start
    
    REM Wait a moment for services to be ready
    echo ⏳ Waiting for Supabase services to be ready...
    timeout /t 5 /nobreak >nul
    
    REM Verify Supabase is running
    supabase status >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Supabase is running!
        echo    📊 Studio: http://127.0.0.1:54323
        echo    🔗 API: http://127.0.0.1:54321
        echo    🗄️  Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres
    ) else (
        echo ❌ Failed to start Supabase. Check the logs with: npm run db:logs
        exit /b 1
    )
) else (
    echo ✅ Supabase is already running!
)

REM Set environment variables for local development
set VITE_SUPABASE_URL=http://127.0.0.1:54321
set VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

echo 🌐 Starting Vite development server...
echo    🎯 App will be available at: http://localhost:3000
echo    🔧 Using local Supabase instance

REM Start the Vite development server
vite --mode development
