# 🗄️ Supabase Database Management

Your Supabase database is now fully integrated with your GitHub repository. This document provides everything you need to manage your database through code.

## ✅ What's Been Configured

### 1. **Local Development Environment**
- ✅ Supabase CLI installed and configured
- ✅ Docker-based local development environment
- ✅ Initial schema migration created
- ✅ Seed data for testing

### 2. **Database Workflow**
- ✅ Migration system for version-controlled schema changes
- ✅ Local-to-remote deployment pipeline
- ✅ TypeScript type generation
- ✅ Comprehensive NPM scripts

### 3. **Git Integration**
- ✅ Pre-commit hooks for migration validation
- ✅ Post-commit hooks with helpful guidance
- ✅ Proper .gitignore configuration

### 4. **Documentation & Tools**
- ✅ Comprehensive workflow documentation
- ✅ Database management script
- ✅ Best practices guide

## 🚀 Quick Start

### Start Local Development
```bash
npm run db:start
```

### Access Your Local Database
- **Supabase Studio**: http://127.0.0.1:54323
- **API**: http://127.0.0.1:54321
- **Database**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

### Make Your First Change
```bash
# Create a new migration
./scripts/db-workflow.sh migrate-create add_user_preferences

# Edit the generated migration file
# Then apply it locally
npm run db:reset

# Generate TypeScript types
npm run db:generate
```

## 📁 Project Structure

```
supabase/
├── config.toml                    # Supabase configuration
├── migrations/                   # Database migrations
│   └── 20250107000001_initial_schema.sql
├── seed/                        # Seed data
│   └── seed.sql
└── .gitignore                   # Git ignore rules

scripts/
└── db-workflow.sh              # Database management script

package.json                    # NPM scripts for database operations
```

## 🛠️ Available Commands

### NPM Scripts
```bash
npm run db:start      # Start local Supabase
npm run db:stop       # Stop local Supabase  
npm run db:reset      # Reset local database
npm run db:status     # Show database status
npm run db:migrate    # Push migrations to remote
npm run db:diff       # Create diff with remote
npm run db:generate   # Generate TypeScript types
npm run db:studio     # Open Supabase Studio
npm run db:logs       # Show database logs
```

### Advanced Workflow Script
```bash
./scripts/db-workflow.sh help           # Show all commands
./scripts/db-workflow.sh start          # Start local environment
./scripts/db-workflow.sh migrate-create <name>  # Create migration
./scripts/db-workflow.sh migrate-apply # Apply migrations
./scripts/db-workflow.sh types          # Generate types
./scripts/db-workflow.sh diff           # Create diff with remote
./scripts/db-workflow.sh push          # Deploy to remote
./scripts/db-workflow.sh pull          # Pull from remote
```

## 🔄 Database Workflow

### Making Schema Changes

1. **Start local environment**:
   ```bash
   npm run db:start
   ```

2. **Create a new migration**:
   ```bash
   ./scripts/db-workflow.sh migrate-create add_user_preferences
   ```
   This creates a new migration file in `supabase/migrations/` with a timestamp.

3. **Edit the migration file**:
   ```sql
   -- Migration: add_user_preferences
   -- Created: 2025-01-07
   -- Description: Add user preferences table
   
   CREATE TABLE public.user_preferences (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
     preferences jsonb DEFAULT '{}'::jsonb,
     created_at timestamptz DEFAULT now()
   );
   
   CREATE INDEX idx_user_preferences_user_id ON public.user_preferences (user_id);
   ```

4. **Apply the migration locally**:
   ```bash
   npm run db:reset
   # or
   ./scripts/db-workflow.sh migrate-apply
   ```

5. **Generate TypeScript types**:
   ```bash
   npm run db:generate
   # or
   ./scripts/db-workflow.sh types
   ```

6. **Test your changes** in the local environment

### Deploying to Remote

1. **Review your changes**:
   ```bash
   ./scripts/db-workflow.sh diff
   ```

2. **Push to remote** (after reviewing):
   ```bash
   ./scripts/db-workflow.sh push
   ```

### Pulling Remote Changes

If someone else has made changes to the remote database:

```bash
./scripts/db-workflow.sh pull
```

## Migration Best Practices

### 1. Naming Conventions

Use descriptive names for migrations:
- `add_user_preferences`
- `create_events_table`
- `add_index_to_leads_email`
- `update_leads_schema_v2`

### 2. Migration Structure

Each migration should be:
- **Idempotent**: Can be run multiple times safely
- **Atomic**: All changes in one transaction
- **Reversible**: Include rollback instructions in comments

Example:
```sql
-- Migration: add_user_preferences
-- Created: 2025-01-07
-- Description: Add user preferences table
-- Rollback: DROP TABLE public.user_preferences;

-- Add your SQL changes here
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
  ON public.user_preferences (user_id);
```

### 3. Testing Migrations

Always test migrations locally before deploying:

1. Create migration
2. Apply locally (`npm run db:reset`)
3. Test your application
4. Generate types (`npm run db:generate`)
5. Test TypeScript compilation
6. Deploy to remote

## Environment Configuration

### Local Development

The local environment uses the `supabase/config.toml` file for configuration. Key settings:

- **Database Port**: 54322
- **API Port**: 54321
- **Studio Port**: 54323
- **Site URL**: http://127.0.0.1:3000

### Remote Deployment

Before pushing to remote, ensure you have:

1. **Supabase project linked**:
   ```bash
   supabase link --project-ref <your-project-ref>
   ```

2. **Environment variables set** (if needed):
   ```bash
   export SUPABASE_ACCESS_TOKEN=<your-access-token>
   ```

## Troubleshooting

### Common Issues

1. **Docker not running**:
   ```bash
   # Start Docker Desktop
   # Then retry
   npm run db:start
   ```

2. **Port conflicts**:
   ```bash
   # Check what's using the ports
   lsof -i :54321
   lsof -i :54322
   lsof -i :54323
   ```

3. **Migration conflicts**:
   ```bash
   # Reset local database
   npm run db:reset
   ```

4. **Remote sync issues**:
   ```bash
   # Pull latest from remote
   ./scripts/db-workflow.sh pull
   ```

### Getting Help

- Check Supabase logs: `npm run db:logs`
- View database status: `npm run db:status`
- Open Supabase Studio: `npm run db:studio`

## Security Considerations

1. **Never commit sensitive data** to migration files
2. **Use environment variables** for secrets
3. **Review all migrations** before pushing to remote
4. **Test rollback procedures** for critical changes
5. **Use RLS policies** for data access control

## 🚨 Important Notes

1. **Always test locally** before deploying to remote
2. **Review migrations** carefully before pushing
3. **Use descriptive names** for migrations
4. **Keep migrations atomic** and reversible
5. **Never commit sensitive data** to migration files

## 🎉 You're All Set!

Your database is now fully integrated with your GitHub repository. You can:

- ✅ Develop database changes locally
- ✅ Version control all schema changes
- ✅ Deploy changes safely to production
- ✅ Collaborate with your team on database changes
- ✅ Maintain consistency between environments

## Next Steps

1. **Set up your remote Supabase project**:
   ```bash
   supabase link --project-ref <your-project-ref>
   ```

2. **Create your first migration**:
   ```bash
   ./scripts/db-workflow.sh migrate-create my_first_change
   ```

3. **Test the workflow**:
   ```bash
   # Start local
   npm run db:start
   
   # Create and apply migration
   ./scripts/db-workflow.sh migrate-create test_migration
   ./scripts/db-workflow.sh migrate-apply
   
   # Generate types
   npm run db:generate
   
   # Test your application
   npm start
   ```

4. **Deploy to remote** (when ready):
   ```bash
   ./scripts/db-workflow.sh push
   ```

This workflow ensures your database changes are version-controlled, tested locally, and safely deployed to production.

Happy coding! 🚀
