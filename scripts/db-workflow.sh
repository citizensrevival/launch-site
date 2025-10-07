#!/bin/bash

# Database Management Workflow Script
# This script provides a comprehensive workflow for managing Supabase database changes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Supabase CLI is installed
check_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI is not installed. Please install it first:"
        echo "  brew install supabase/tap/supabase"
        exit 1
    fi
}

# Function to check if Docker is running
check_docker() {
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to start local development environment
start_local() {
    print_status "Starting local Supabase development environment..."
    supabase start
    print_success "Local Supabase environment started successfully!"
    print_status "You can access:"
    echo "  - Studio: http://127.0.0.1:54323"
    echo "  - API: http://127.0.0.1:54321"
    echo "  - Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
}

# Function to stop local development environment
stop_local() {
    print_status "Stopping local Supabase development environment..."
    supabase stop
    print_success "Local Supabase environment stopped successfully!"
}

# Function to reset local database
reset_local() {
    print_status "Resetting local database..."
    supabase db reset
    print_success "Local database reset successfully!"
}

# Function to create a new migration
create_migration() {
    if [ -z "$1" ]; then
        print_error "Please provide a migration name"
        echo "Usage: $0 migrate-create <migration_name>"
        exit 1
    fi
    
    local migration_name="$1"
    print_status "Creating new migration: $migration_name"
    
    # Generate timestamp for migration filename
    local timestamp=$(date +"%Y%m%d%H%M%S")
    local migration_file="supabase/migrations/${timestamp}_${migration_name}.sql"
    
    # Create the migration file with a template
    cat > "$migration_file" << EOF
-- Migration: $migration_name
-- Created: $(date)
-- Description: 

-- Add your SQL changes here
-- Example:
-- ALTER TABLE public.leads ADD COLUMN new_field text;
-- CREATE INDEX idx_leads_new_field ON public.leads (new_field);
EOF
    
    print_success "Migration created: $migration_file"
    print_status "Edit the file to add your SQL changes, then run:"
    echo "  $0 migrate-apply"
}

# Function to apply migrations
apply_migrations() {
    print_status "Applying migrations to local database..."
    supabase db reset
    print_success "Migrations applied successfully!"
}

# Function to generate TypeScript types
generate_types() {
    print_status "Generating TypeScript types from local database..."
    supabase gen types typescript --local > src/lib/database.types.ts
    print_success "TypeScript types generated successfully!"
}

# Function to create a diff between local and remote
create_diff() {
    print_status "Creating diff between local and remote database..."
    supabase db diff --schema public > supabase/migrations/$(date +"%Y%m%d%H%M%S")_remote_diff.sql
    print_success "Diff created successfully!"
    print_warning "Review the generated diff file before applying to remote"
}

# Function to push changes to remote
push_to_remote() {
    print_warning "This will push your local changes to the remote Supabase project."
    print_warning "Make sure you have reviewed all changes and have a backup."
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Pushing changes to remote database..."
        supabase db push
        print_success "Changes pushed to remote database successfully!"
    else
        print_status "Push cancelled by user"
    fi
}

# Function to pull changes from remote
pull_from_remote() {
    print_status "Pulling changes from remote database..."
    supabase db pull
    print_success "Changes pulled from remote database successfully!"
}

# Function to show database status
show_status() {
    print_status "Database status:"
    supabase status
}

# Function to show help
show_help() {
    echo "Database Management Workflow Script"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start                 Start local Supabase development environment"
    echo "  stop                  Stop local Supabase development environment"
    echo "  reset                 Reset local database (applies all migrations)"
    echo "  status                Show database status"
    echo "  migrate-create <name> Create a new migration file"
    echo "  migrate-apply         Apply all migrations to local database"
    echo "  types                 Generate TypeScript types from local database"
    echo "  diff                  Create diff between local and remote"
    echo "  push                  Push local changes to remote database"
    echo "  pull                  Pull changes from remote database"
    echo "  studio                Open Supabase Studio"
    echo "  logs                  Show database logs"
    echo "  help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 migrate-create add_user_preferences"
    echo "  $0 migrate-apply"
    echo "  $0 types"
    echo "  $0 push"
}

# Main script logic
main() {
    check_supabase_cli
    check_docker
    
    case "${1:-help}" in
        start)
            start_local
            ;;
        stop)
            stop_local
            ;;
        reset)
            reset_local
            ;;
        status)
            show_status
            ;;
        migrate-create)
            create_migration "$2"
            ;;
        migrate-apply)
            apply_migrations
            ;;
        types)
            generate_types
            ;;
        diff)
            create_diff
            ;;
        push)
            push_to_remote
            ;;
        pull)
            pull_from_remote
            ;;
        studio)
            supabase studio
            ;;
        logs)
            supabase logs
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
