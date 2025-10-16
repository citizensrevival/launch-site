-- CMS Asset Processing and Variants
-- This migration creates tables for image processing and asset variants

-- ASSET VARIANTS
create table if not exists asset_variant (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references asset(id) on delete cascade,
  variant_type text not null, -- 'thumbnail', 'small', 'medium', 'large', 'original'
  storage_key text not null,
  width int,
  height int,
  file_size int,
  created_at timestamptz not null default now()
);

create index if not exists idx_asset_variant on asset_variant(asset_id);

-- Function to create asset variants
create or replace function create_asset_variants(
  p_asset_id uuid,
  p_storage_key text,
  p_width int,
  p_height int
)
returns void language plpgsql security definer as $$
begin
  -- Create thumbnail (150x150)
  insert into asset_variant (asset_id, variant_type, storage_key, width, height)
  values (p_asset_id, 'thumbnail', replace(p_storage_key, '.', '-thumb.'), 150, 150);
  
  -- Create small (300x300)
  insert into asset_variant (asset_id, variant_type, storage_key, width, height)
  values (p_asset_id, 'small', replace(p_storage_key, '.', '-small.'), 300, 300);
  
  -- Create medium (600x600)
  insert into asset_variant (asset_id, variant_type, storage_key, width, height)
  values (p_asset_id, 'medium', replace(p_storage_key, '.', '-medium.'), 600, 600);
  
  -- Create large (1200x1200)
  insert into asset_variant (asset_id, variant_type, storage_key, width, height)
  values (p_asset_id, 'large', replace(p_storage_key, '.', '-large.'), 1200, 1200);
  
  -- Create original reference
  insert into asset_variant (asset_id, variant_type, storage_key, width, height)
  values (p_asset_id, 'original', p_storage_key, p_width, p_height);
end;
$$;

-- Function to get asset URL with fallback
create or replace function get_asset_url(
  p_asset_id uuid,
  p_variant_type text default 'original'
)
returns text language sql security definer as $$
  select 
    case 
      when av.storage_key is not null then 
        'https://your-project.supabase.co/storage/v1/object/public/cms-assets/' || av.storage_key
      else null
    end
  from asset_variant av
  where av.asset_id = p_asset_id 
  and av.variant_type = p_variant_type
  limit 1;
$$;
