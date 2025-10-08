# 🚀 Development Guide

This guide explains how to set up and run the Launch Site project in development mode with local Supabase integration.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Docker Desktop** (for local Supabase)
- **Supabase CLI** (`npm install -g supabase`)

## 🛠️ Quick Start

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
npm run start:remote   # Start with remote Supabase
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

## 🌍 Environment Configuration

### Local Development
The project automatically uses local Supabase when running `npm start`. The following environment variables are set:

```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
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

## 🗄️ Database Workflow

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
│   └── db-workflow.sh        # Database management
├── supabase/
│   ├── config.toml           # Supabase configuration
│   ├── migrations/           # Database migrations
│   └── seed.sql             # Seed data
├── src/
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client
│   │   └── database.types.ts # Generated types
│   └── ...
├── .env.local               # Local environment (gitignored)
└── package.json             # NPM scripts
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

Happy coding! 🚀
