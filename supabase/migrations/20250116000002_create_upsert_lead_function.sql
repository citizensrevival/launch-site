-- ─────────────────────────────────────────────────────────────────────────────
-- Create a stored procedure to handle lead upsert functionality
-- This function will be accessible to anonymous users and handle the upsert logic
-- ─────────────────────────────────────────────────────────────────────────────

-- Create function to upsert a lead
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
begin
  -- Try to update existing record first
  update public.leads
  set
    business_name = coalesce(p_business_name, business_name),
    contact_name = coalesce(p_contact_name, contact_name),
    phone = coalesce(p_phone, phone),
    website = coalesce(p_website, website),
    social_links = coalesce(p_social_links, social_links),
    source_path = coalesce(p_source_path, source_path),
    tags = coalesce(p_tags, tags),
    meta = coalesce(p_meta, meta)
  where email = p_email and lead_kind = p_lead_kind
  returning id into lead_id;
  
  -- If no record was updated, insert a new one
  if lead_id is null then
    insert into public.leads (
      lead_kind, email, business_name, contact_name, phone, 
      website, social_links, source_path, tags, meta
    ) values (
      p_lead_kind, p_email, p_business_name, p_contact_name, p_phone,
      p_website, p_social_links, p_source_path, p_tags, p_meta
    ) returning id into lead_id;
  end if;
  
  return lead_id;
end;
$$;

-- Grant execute permission to anonymous and authenticated users
grant execute on function public.upsert_lead to anon, authenticated;
