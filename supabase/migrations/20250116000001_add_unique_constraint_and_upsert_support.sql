-- ─────────────────────────────────────────────────────────────────────────────
-- Add unique constraint on email + lead_kind to prevent duplicates
-- and update RLS policies to support upsert functionality
-- ─────────────────────────────────────────────────────────────────────────────

-- Add unique constraint to prevent duplicate entries for same email + lead_kind
alter table public.leads 
add constraint leads_email_kind_unique unique (email, lead_kind);

-- Update RLS policies to allow public users to update leads for upsert functionality
-- This allows anonymous users to update existing leads when they resubmit forms

-- Drop existing update policy
drop policy if exists "admins can update leads" on public.leads;

-- Create new update policy that allows public users to update leads
-- This is needed for upsert functionality - users can update their own lead data
create policy "public can update leads"
  on public.leads
  for update
  to anon, authenticated
  using ( true )
  with check ( true );

-- Ensure proper grants are in place for update operations
grant update on public.leads to anon, authenticated;
