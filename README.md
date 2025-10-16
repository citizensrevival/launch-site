# Launch Site

A modern React application built with Vite, TypeScript, Tailwind CSS, and Supabase for local development and GitHub Pages deployment.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Docker Desktop** (for local Supabase)
- **Supabase CLI** (`npm install -g supabase`)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Environment
```bash
npm start
```

This command will:
- ✅ Check if Docker is running
- ✅ Start Supabase local development environment
- ✅ Set up environment variables for local development
- ✅ Start the Vite development server

### 3. Access Your Application
- **App**: http://localhost:3000
- **Supabase Studio**: http://127.0.0.1:54323
- **Supabase API**: http://127.0.0.1:54321

## 🔧 Available Scripts

### Development
```bash
npm start              # Start with local Supabase (default)
npm run start:local    # Start with local Supabase
npm run start:remote  # Start with remote Supabase
```

### Database Management
```bash
npm run db:start       # Start Supabase containers
npm run db:stop        # Stop Supabase containers
npm run db:reset       # Reset local database
npm run db:status      # Check Supabase status
npm run db:studio      # Open Supabase Studio
npm run db:logs        # View Supabase logs
```

### Database Development
```bash
npm run db:migrate     # Push migrations to remote
npm run db:diff        # Create diff with remote
npm run db:generate    # Generate TypeScript types
```

### Build & Deploy
```bash
npm run build          # Build for production
npm run build:github   # Build for GitHub Pages
npm run preview        # Preview production build
```

## 🌍 Environment Configuration

### Local Development
The project automatically uses local Supabase when running `npm start`. Environment variables are set automatically, but you can also create a `.env.local` file:

```bash
# .env.local
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key
```

### Remote Development
To use a remote Supabase instance, create a `.env.local` file:

```bash
# .env.local
VITE_SUPABASE_URL=your_remote_supabase_url
VITE_SUPABASE_ANON_KEY=your_remote_anon_key
```

Then run:
```bash
npm run start:remote
```

### Automatic Key Management
Use the built-in script to automatically generate environment variables:

```bash
npm run update-supabase-keys
```

This script:
- Extracts current Supabase keys from running instance
- Creates/updates `.env.local` file
- Excludes service role key for security

## 🗄️ Database Management

### Making Schema Changes

1. **Start local environment**:
   ```bash
   npm start
   ```

2. **Create a new migration**:
   ```bash
   ./scripts/db-workflow.sh migrate-create add_user_preferences
   ```

3. **Edit the migration file** in `supabase/migrations/`

4. **Apply the migration locally**:
   ```bash
   npm run db:reset
   ```

5. **Generate TypeScript types**:
   ```bash
   npm run db:generate
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

### Advanced Database Commands
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

## 🐛 Troubleshooting

### Common Issues

1. **Docker not running**:
   ```bash
   # Start Docker Desktop
   # Then retry
   npm start
   ```

2. **Port conflicts**:
   ```bash
   # Check what's using the ports
   lsof -i :54321  # Supabase API
   lsof -i :54322  # Supabase Database
   lsof -i :54323  # Supabase Studio
   lsof -i :3000   # Vite dev server
   ```

3. **Supabase not starting**:
   ```bash
   # Check Supabase status
   npm run db:status
   
   # View logs
   npm run db:logs
   
   # Reset if needed
   npm run db:reset
   ```

4. **Environment variables not loading**:
   - Ensure `.env.local` exists and has correct values
   - Restart the development server
   - Check that variables start with `VITE_`

### Getting Help

- **Supabase logs**: `npm run db:logs`
- **Database status**: `npm run db:status`
- **Supabase Studio**: `npm run db:studio`
- **Check environment**: Open browser dev tools and check `import.meta.env`

## 🔄 Development Workflow

### Daily Development
1. Start your day: `npm start`
2. Make changes to your code
3. Test with local Supabase
4. Create migrations as needed
5. Generate types: `npm run db:generate`

### Before Committing
1. Test all functionality
2. Generate types: `npm run db:generate`
3. Run build: `npm run build`
4. Commit your changes

### Before Deploying
1. Test with remote Supabase
2. Push migrations: `./scripts/db-workflow.sh push`
3. Deploy your application

## 📁 Project Structure

```
├── scripts/
│   ├── start-dev.sh          # Unix startup script
│   ├── start-dev.cmd         # Windows startup script
│   ├── db-workflow.sh        # Database management
│   └── update-supabase-keys.sh # Environment setup
├── supabase/
│   ├── config.toml           # Supabase configuration
│   ├── migrations/           # Database migrations
│   ├── functions/            # Edge functions
│   └── seed.sql             # Seed data
├── src/
│   ├── admin/                # Admin dashboard
│   ├── public/               # Public pages
│   ├── shell/                # Shared components
│   └── lib/                  # Utilities and types
├── .env.local               # Local environment (gitignored)
└── package.json             # NPM scripts
```

## 🚀 GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages with a custom domain when changes are pushed to the main branch.

### Current Configuration

- **Custom Domain**: `citizens.fvcsolutions.com`
- **Deployment**: Automatic via GitHub Actions
- **Source**: GitHub Actions workflow

### Setup Instructions

1. The repository is already configured for GitHub Pages deployment
2. The custom domain `citizens.fvcsolutions.com` is configured in `public/CNAME`
3. DNS should be configured to point to GitHub Pages IPs
4. Enable "Enforce HTTPS" in GitHub Pages settings

The site will be available at: `https://citizens.fvcsolutions.com`

### Build for GitHub Pages

```bash
npm run build:github
```

## 🎯 Best Practices

1. **Always test locally** before deploying
2. **Use descriptive migration names**
3. **Generate types after schema changes**
4. **Keep migrations atomic and reversible**
5. **Never commit sensitive data** to migration files
6. **Use environment variables** for configuration

## 🚨 Important Notes

- The local Supabase instance uses default development keys
- Always use environment variables for production
- Test your application with both local and remote Supabase
- Keep your database migrations version-controlled
- Use Supabase Studio for database inspection
- **Never use service role keys in client-side applications**
- Service role keys bypass all RLS policies and have full database access

## 🔧 Commands to Kill All Development Servers

### Quick Kill All (Recommended)
```bash
pkill -f "vite" && pkill -f "npm run start:local" && pkill -f "npm run start" && pkill -f "cross-env.*vite"
```

### More Comprehensive Cleanup
```bash
# Kill all Node.js processes related to development
pkill -f "node.*vite"
pkill -f "npm run start"
pkill -f "cross-env.*vite"

# Kill any remaining vite processes
pkill -f "vite"

# Kill any esbuild processes (used by Vite)
pkill -f "esbuild"
```

### Nuclear Option (if needed)
```bash
# Kill all node processes (be careful with this one!)
pkill -f "node"
```

### Check What's Running
```bash
# See what development processes are running
ps aux | grep -E "(vite|npm|node)" | grep -v grep
```

### Verify Everything is Stopped
```bash
# Check if any processes are still running on common dev ports
lsof -i :5173  # Vite default port
lsof -i :3000  # Common React port
lsof -i :8080  # Common dev port
```

## 🔒 Security Considerations

1. **Never commit sensitive data** to migration files
2. **Use environment variables** for secrets
3. **Review all migrations** before pushing to remote
4. **Test rollback procedures** for critical changes
5. **Use RLS policies** for data access control
6. **Never use service role keys in client-side applications**

## 🎉 You're All Set!

Your application is now fully configured for development and deployment. You can:

- ✅ Develop with local Supabase integration
- ✅ Version control all schema changes
- ✅ Deploy changes safely to production
- ✅ Collaborate with your team on database changes
- ✅ Maintain consistency between environments

Happy coding! 🚀