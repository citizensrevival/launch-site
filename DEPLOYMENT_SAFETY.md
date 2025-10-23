# 🚨 DEPLOYMENT SAFETY GUIDE

## ⚠️ CRITICAL: NEVER DEPLOY TO REMOTE SUPABASE

This project is configured for **LOCAL DEVELOPMENT ONLY**. Any deployment to remote Supabase could cause data loss or corruption.

## 🛡️ Safety Measures in Place

### 1. Blocked Commands
The following commands are **BLOCKED** to prevent remote deployment:
- `npm run db:migrate` - Blocked (was `supabase db push`)
- `supabase db push` - Use `npm run db:reset` instead
- `supabase link` - Will be detected and warned

### 2. Safe Local Commands
Use these commands for local development:
- `npm start` - Start local development (uses local Supabase)
- `npm run db:reset` - Reset local database with migrations
- `npm run db:generate` - Generate types from local database
- `npm run db:studio` - Open local Supabase Studio
- `npm run db:migrate:local` - Alias for `db:reset`

### 3. Safety Scripts
- `./scripts/prevent-remote-deployment.sh` - Safety check before deployment
- `./scripts/db-workflow.sh` - Safe database workflow (with warnings)

## 🔍 How to Verify You're Using Local Supabase

### Check Supabase Status
```bash
npm run db:status
```

**✅ SAFE (Local):**
```
supabase local development setup is running.
         API URL: http://127.0.0.1:54321
```

**❌ DANGEROUS (Remote):**
```
Project URL: https://your-project.supabase.co
```

### Check Environment Variables
```bash
echo $NODE_ENV
echo $SUPABASE_ENV
```

**✅ SAFE:** Should be empty or "development"
**❌ DANGEROUS:** "production" or remote URLs

## 🚫 Commands to NEVER Run

### ❌ BLOCKED Commands
```bash
# These are BLOCKED in package.json
npm run db:migrate          # BLOCKED - could deploy to remote
supabase db push            # BLOCKED - deploys to remote
supabase link               # BLOCKED - links to remote project
```

### ❌ Dangerous Commands (Not Blocked, but Avoid)
```bash
supabase deploy             # Deploys functions to remote
supabase db push --remote   # Explicitly deploys to remote
supabase link --project-ref YOUR_PROJECT_REF  # Links to remote
```

## ✅ Safe Development Workflow

### Daily Development
```bash
# Start local development
npm start

# Reset database (applies all migrations)
npm run db:reset

# Generate types
npm run db:generate

# Open Supabase Studio
npm run db:studio
```

### Adding New Migrations
```bash
# Create new migration
supabase migration new your_migration_name

# Apply migration locally
npm run db:reset

# Generate types
npm run db:generate
```

### Testing Edge Functions
```bash
# Serve functions locally
supabase functions serve --no-verify-jwt

# Test functions locally
curl -X POST http://127.0.0.1:54321/functions/v1/your-function
```

## 🔧 Configuration Safeguards

### 1. Supabase Config (`supabase/config.toml`)
- All URLs point to `127.0.0.1` (local)
- No remote project references
- Local development settings only

### 2. Package.json Scripts
- `db:migrate` is blocked with error message
- `start:remote` exists but should not be used
- All safe commands use `--local` flag

### 3. Environment Variables
- No production environment variables
- Local Supabase URLs only
- No remote project keys

## 🚨 Emergency Procedures

### If You Accidentally Link to Remote
```bash
# Unlink immediately
supabase unlink

# Verify you're back to local
npm run db:status
```

### If You Accidentally Push to Remote
```bash
# Stop all processes
pkill -f "supabase"
pkill -f "vite"

# Reset to local
npm run db:reset
npm start
```

### If You See Remote URLs
```bash
# Check your environment
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Should be local URLs:
# http://127.0.0.1:54321
# sb_publishable_...
```

## 📋 Pre-Deployment Checklist

Before running ANY database command:

- [ ] Run `npm run db:status` - should show local URLs
- [ ] Check `echo $NODE_ENV` - should be empty or "development"
- [ ] Verify no `supabase link` has been run
- [ ] Confirm all URLs start with `127.0.0.1` or `localhost`
- [ ] Use `npm run db:reset` instead of `supabase db push`

## 🎯 Summary

**✅ ALWAYS USE:**
- `npm start` (starts local development)
- `npm run db:reset` (applies migrations locally)
- `npm run db:generate` (generates types locally)

**❌ NEVER USE:**
- `npm run db:migrate` (blocked)
- `supabase db push` (deploys to remote)
- `supabase link` (links to remote)
- `supabase deploy` (deploys to remote)

**🛡️ SAFETY FIRST:**
- Always verify you're using local Supabase
- Check URLs before running commands
- Use the safety script when in doubt
- When in doubt, use `npm run db:reset` instead of push commands
