# Supabase Local Development Setup

This document explains how to properly configure Supabase for local development.

## Environment Variables

The application requires the following environment variables to be set:

- `VITE_SUPABASE_URL` - The Supabase API URL
- `VITE_SUPABASE_ANON_KEY` - The Supabase anonymous key

**Note**: The service role key is intentionally excluded for security reasons. It should never be used in client-side applications as it bypasses all Row Level Security (RLS) policies.

## Quick Setup

1. **Start Supabase:**
   ```bash
   npm run db:start
   ```

2. **Generate environment file:**
   ```bash
   npm run update-supabase-keys
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## Manual Setup

If you prefer to set up environment variables manually:

1. Create a `.env.local` file in the project root
2. Add the following variables:
   ```bash
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_ANON_KEY=your_publishable_key_here
   ```

3. Get the keys by running `npx supabase status`

## Why Environment Variables?

- **Security**: No hardcoded keys in source code
- **Flexibility**: Easy to switch between environments
- **Best Practice**: Standard approach for configuration management
- **Error Handling**: Clear error messages when configuration is missing

## Troubleshooting

### "Environment variable is required" Error

If you see this error, it means the environment variables are not set:

1. Run `npm run update-supabase-keys` to generate the `.env.local` file
2. Or manually create `.env.local` with the required variables
3. Restart your development server

### Keys Changed After Supabase Restart

If your Supabase keys change (rare), simply run:
```bash
npm run update-supabase-keys
```

This will update your `.env.local` file with the new keys.

## Security Notes

- Never commit `.env.local` to version control
- The `.env.local` file is already in `.gitignore`
- Use different keys for different environments (local, staging, production)
- **Never use service role keys in client-side applications**
- Service role keys bypass all RLS policies and have full database access
- If you need admin operations, use Supabase Edge Functions with service role keys
