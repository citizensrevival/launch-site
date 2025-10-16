-- ─────────────────────────────────────────────────────────────────────────────
-- Unsubscribe table for managing user unsubscriptions
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.unsubscribes (
  id uuid primary key default gen_random_uuid(),
  email text not null check (position('@' in email) > 1),
  unsubscribed_lead_types jsonb not null default '[]'::jsonb, -- Array of lead types to unsubscribe from
  source_path text, -- Page/path the unsubscribe was submitted from
  user_agent text, -- Browser user agent for analytics
  ip_address inet, -- IP address for analytics (anonymized)
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists unsubscribes_email_idx on public.unsubscribes (email);
create index if not exists unsubscribes_created_at_idx on public.unsubscribes (created_at desc);

-- Enable Row Level Security (RLS)
alter table public.unsubscribes enable row level security;

-- Allow anonymous users to insert unsubscribe records
create policy "Allow anonymous unsubscribe insert" on public.unsubscribes
  for insert to anon
  with check (true);

-- Allow authenticated users to view unsubscribe records (for admin purposes)
create policy "Allow authenticated users to view unsubscribes" on public.unsubscribes
  for select to authenticated
  using (true);

-- Grant necessary permissions
grant insert on public.unsubscribes to anon;
grant select on public.unsubscribes to authenticated;
