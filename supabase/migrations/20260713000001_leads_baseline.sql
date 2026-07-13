-- Baseline schema for the public site.
--
-- The only thing the site persists is lead capture: newsletter subscribers plus
-- sponsor / vendor / volunteer signups. There is no admin app and no
-- authenticated user, so every writer here is the anonymous visitor.
--
-- This replaces the previous CMS / analytics / admin schema in its entirety.

create table public.leads_submissions (
  id uuid primary key default gen_random_uuid(),
  lead_kind text not null check (
    lead_kind in ('subscriber', 'sponsor', 'vendor', 'volunteer', 'general')
  ),
  email text not null check (position('@' in email) > 1),
  business_name text,
  contact_name text,
  phone text,
  website text,
  social_links text[] not null default '{}',
  source_path text,
  meta jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_submissions_email_lead_kind_unique unique (email, lead_kind)
);

-- Visitors submit leads through upsert_lead() and may do nothing else.
--
-- RLS is enabled with NO policies and the table grants are revoked, so anon and
-- authenticated cannot select, update or delete rows. upsert_lead() is SECURITY
-- DEFINER, so it still writes as the owner. The signup list is therefore not
-- readable with the public anon key -- read it from the Supabase dashboard.
alter table public.leads_submissions enable row level security;

revoke all on table public.leads_submissions from anon, authenticated;

create function public.upsert_lead(
  p_lead_kind text,
  p_email text,
  p_business_name text default null,
  p_contact_name text default null,
  p_phone text default null,
  p_website text default null,
  p_social_links text[] default '{}',
  p_source_path text default null,
  p_meta jsonb default '{}'::jsonb,
  p_tags text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into public.leads_submissions as l (
    lead_kind, email, business_name, contact_name, phone,
    website, social_links, source_path, meta, tags
  )
  values (
    p_lead_kind,
    lower(trim(p_email)),
    p_business_name,
    p_contact_name,
    p_phone,
    p_website,
    coalesce(p_social_links, '{}'),
    p_source_path,
    coalesce(p_meta, '{}'::jsonb),
    coalesce(p_tags, '{}')
  )
  -- A repeat signup updates the existing row rather than erroring. Only
  -- overwrite a field when the new submission actually supplied one.
  on conflict (email, lead_kind) do update set
    business_name = coalesce(excluded.business_name, l.business_name),
    contact_name  = coalesce(excluded.contact_name, l.contact_name),
    phone         = coalesce(excluded.phone, l.phone),
    website       = coalesce(excluded.website, l.website),
    social_links  = excluded.social_links,
    source_path   = coalesce(excluded.source_path, l.source_path),
    meta          = l.meta || excluded.meta,
    tags          = excluded.tags,
    updated_at    = now()
  returning l.id into v_id;

  return v_id;
end;
$$;

revoke all on function public.upsert_lead(
  text, text, text, text, text, text, text[], text, jsonb, text[]
) from public;

grant execute on function public.upsert_lead(
  text, text, text, text, text, text, text[], text, jsonb, text[]
) to anon, authenticated;
