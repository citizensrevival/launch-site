# Debug RLS Policy Violation

## Step 1: Verify RLS Policies Are Applied

Run this SQL in your Supabase SQL Editor to check if the policies exist:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'leads'
ORDER BY policyname;
```

You should see these policies:
- `public can insert leads` with roles `{anon,authenticated}` and cmd `INSERT`
- `only admins can select leads` with roles `{authenticated}` and cmd `SELECT`
- `admins can update leads` with roles `{authenticated}` and cmd `UPDATE`
- `admins can delete leads` with roles `{authenticated}` and cmd `DELETE`

## Step 2: Check if RLS is Enabled

```sql
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables
WHERE tablename = 'leads';
```

The `rowsecurity` column should be `true`.

## Step 3: Test Direct Insert (Bypass Application)

Test if you can insert directly as an anonymous user:

```sql
-- This should work if RLS is configured correctly
INSERT INTO public.leads (lead_kind, email)
VALUES ('subscriber', 'test-direct@example.com');
```

## Step 4: Check Current User Context

```sql
-- Check what user context you're running as
SELECT current_user, session_user;
```

## Step 5: Verify Table Permissions

```sql
-- Check table permissions
SELECT grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'leads' AND table_schema = 'public';
```

## Step 6: Test with Explicit Anon Role

If the above doesn't work, try this more explicit approach:

```sql
-- Set the role explicitly to anon
SET ROLE anon;

-- Try the insert
INSERT INTO public.leads (lead_kind, email)
VALUES ('subscriber', 'test-anon@example.com');

-- Reset role
RESET ROLE;
```

## Step 7: Alternative RLS Policy

If the current policy isn't working, try this alternative:

```sql
-- Drop the existing policy
DROP POLICY IF EXISTS "public can insert leads" ON public.leads;

-- Create a more permissive policy
CREATE POLICY "allow_anon_inserts" ON public.leads
FOR INSERT
TO anon
WITH CHECK (true);

-- Also allow authenticated users
CREATE POLICY "allow_auth_inserts" ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (true);
```

## Step 8: Check for Conflicting Policies

```sql
-- Look for any other policies that might conflict
SELECT policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'leads';
```

## Step 9: Verify the Enum Type

```sql
-- Check if the enum type exists and has the right values
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'lead_type');
```

Should show: subscriber, vendor, sponsor, volunteer

## Step 10: Test the Application Again

After verifying the above, test your application again. If it still fails, the issue might be in the client configuration.
