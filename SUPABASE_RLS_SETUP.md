
# Supabase RLS Policy Setup

## Issue: "new row violates row-level security policy for table 'leads'"

This error occurs when the Row Level Security (RLS) policies haven't been properly configured in your Supabase database.

## Solution

### 1. Apply the RLS Policies to Your Supabase Database

You need to execute the SQL commands from `schema.sql` in your Supabase database:
1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to the SQL Editor (left sidebar)
3. Open the `schema.sql` file from this repository
4. Copy and paste the entire contents into the SQL Editor
5. Click "Run" to execute the SQL

This will:
- Create the `lead_type` enum if it doesn't exist
- Create the `leads` table with the correct schema
- Enable Row Level Security on the `leads` table
- Create the RLS policies that allow:
  - Anonymous users to INSERT leads
  - Only authenticated admins to SELECT/UPDATE/DELETE leads

### 2. Verify the RLS Policies

To verify that the RLS policies are correctly applied, run this SQL query in the Supabase SQL Editor:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'leads';
```

You should see at least these policies:
- `public can insert leads` - allows anon and authenticated users to insert
- `only admins can select leads` - restricts selects to admins only
- `admins can update leads` - restricts updates to admins only
- `admins can delete leads` - restricts deletes to admins only

### 3. Test the RLS Policies

You can test the RLS policies directly in the Supabase SQL Editor:

```sql
-- This should work (as anonymous user)
INSERT INTO public.leads (lead_kind, email)
VALUES ('subscriber', 'test@example.com');
```

### 4. Common Issues

#### Issue: "relation 'lead_type' does not exist"
**Solution**: The enum type hasn't been created. Run the enum creation part of the schema:

```sql
create type lead_type as enum ('subscriber', 'vendor', 'sponsor', 'volunteer');
```

#### Issue: "permission denied for table leads"
**Solution**: Grant the necessary permissions:

```sql
grant insert on public.leads to anon, authenticated;
grant select, update, delete on public.leads to authenticated;
```

#### Issue: RLS policies don't seem to apply
**Solution**: Make sure RLS is enabled:

```sql
alter table public.leads enable row level security;
```

### 5. Quick Test from Command Line

You can test the API directly using curl:

```bash
curl -X POST "https://YOUR_SUPABASE_URL/rest/v1/leads" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"lead_kind": "subscriber", "email": "test@example.com"}'
```

Replace:
- `YOUR_SUPABASE_URL` with your Supabase project URL
- `YOUR_ANON_KEY` with your Supabase anon key

If this works but the application doesn't, then the issue is with the client configuration, not the RLS policies.

## Next Steps

If you've applied the RLS policies and the error persists:

1. Check that the environment variables are correctly set in `.env.local`
2. Restart your development server
3. Check the browser console for any errors or debug logs
4. Verify that the Supabase client is being created with the correct URL and anon key

