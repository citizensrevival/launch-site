-- ─────────────────────────────────────────────────────────────────────────────
-- Move source_path into meta field and remove the column
-- ─────────────────────────────────────────────────────────────────────────────

-- First, update all existing records to move source_path into meta
update public.leads 
set meta = coalesce(meta, '{}'::jsonb) || jsonb_build_object('source_path', source_path)
where source_path is not null;

-- Update the upsert_lead function to handle source_path in meta
create or replace function public.upsert_lead(
  p_lead_kind lead_type,
  p_email text,
  p_business_name text default null,
  p_contact_name text default null,
  p_phone text default null,
  p_website text default null,
  p_social_links text[] default null,
  p_source_path text default null,
  p_tags text[] default null,
  p_meta jsonb default null
) returns uuid
language plpgsql
security definer
as $$
declare
  lead_id uuid;
  final_meta jsonb;
begin
  -- Merge source_path into meta if provided
  if p_source_path is not null then
    final_meta := coalesce(p_meta, '{}'::jsonb) || jsonb_build_object('source_path', p_source_path);
  else
    final_meta := p_meta;
  end if;

  -- Try to update existing record first
  update public.leads
  set
    business_name = coalesce(p_business_name, business_name),
    contact_name = coalesce(p_contact_name, contact_name),
    phone = coalesce(p_phone, phone),
    website = coalesce(p_website, website),
    social_links = coalesce(p_social_links, social_links),
    tags = coalesce(p_tags, tags),
    meta = coalesce(final_meta, meta)
  where email = p_email and lead_kind = p_lead_kind
  returning id into lead_id;
  
  -- If no record was updated, insert a new one
  if lead_id is null then
    insert into public.leads (
      lead_kind, email, business_name, contact_name, phone, 
      website, social_links, tags, meta
    ) values (
      p_lead_kind, p_email, p_business_name, p_contact_name, p_phone,
      p_website, p_social_links, p_tags, final_meta
    ) returning id into lead_id;
  end if;
  
  return lead_id;
end;
$$;

-- Now drop the source_path column
alter table public.leads drop column if exists source_path;
