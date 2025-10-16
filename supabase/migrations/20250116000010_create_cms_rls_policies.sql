-- CMS Row Level Security Policies
-- This migration creates RLS policies for the CMS system

-- Enable RLS on all tables
alter table site enable row level security;
alter table page enable row level security;
alter table page_version enable row level security;
alter table page_publish enable row level security;
alter table block enable row level security;
alter table block_version enable row level security;
alter table block_publish enable row level security;
alter table menu enable row level security;
alter table menu_version enable row level security;
alter table menu_publish enable row level security;
alter table asset enable row level security;
alter table asset_version enable row level security;
alter table asset_publish enable row level security;
alter table asset_variant enable row level security;
alter table user_permissions enable row level security;
alter table cms_audit_log enable row level security;

-- Public read access to published content
create policy "read_published_pages" on page_version
  for select using (status = 'published');

create policy "read_published_blocks" on block_version
  for select using (status = 'published');

create policy "read_published_assets" on asset_version
  for select using (status = 'published');

create policy "read_published_menus" on menu_version
  for select using (status = 'published');

create policy "read_published_asset_variants" on asset_variant
  for select using (
    exists (
      select 1 from asset_version av 
      where av.asset_id = asset_variant.asset_id 
      and av.status = 'published'
    )
  );

-- Permission-based write access for pages
create policy "cms_pages_write" on page_version
  for insert with check (has_permission(auth.uid(), 'cms.pages.write'));

create policy "cms_pages_update" on page_version
  for update using (has_permission(auth.uid(), 'cms.pages.write'));

create policy "cms_pages_publish" on page_publish
  for insert with check (has_permission(auth.uid(), 'cms.pages.publish'));

create policy "cms_pages_unpublish" on page_publish
  for delete using (has_permission(auth.uid(), 'cms.pages.publish'));

-- Permission-based write access for blocks
create policy "cms_blocks_write" on block_version
  for insert with check (has_permission(auth.uid(), 'cms.blocks.write'));

create policy "cms_blocks_update" on block_version
  for update using (has_permission(auth.uid(), 'cms.blocks.write'));

create policy "cms_blocks_publish" on block_publish
  for insert with check (has_permission(auth.uid(), 'cms.blocks.publish'));

create policy "cms_blocks_unpublish" on block_publish
  for delete using (has_permission(auth.uid(), 'cms.blocks.publish'));

-- Permission-based write access for menus
create policy "cms_menus_write" on menu_version
  for insert with check (has_permission(auth.uid(), 'cms.menus.write'));

create policy "cms_menus_update" on menu_version
  for update using (has_permission(auth.uid(), 'cms.menus.write'));

create policy "cms_menus_publish" on menu_publish
  for insert with check (has_permission(auth.uid(), 'cms.menus.publish'));

create policy "cms_menus_unpublish" on menu_publish
  for delete using (has_permission(auth.uid(), 'cms.menus.publish'));

-- Permission-based write access for assets
create policy "cms_assets_write" on asset_version
  for insert with check (has_permission(auth.uid(), 'cms.assets.write'));

create policy "cms_assets_update" on asset_version
  for update using (has_permission(auth.uid(), 'cms.assets.write'));

create policy "cms_assets_publish" on asset_publish
  for insert with check (has_permission(auth.uid(), 'cms.assets.publish'));

create policy "cms_assets_unpublish" on asset_publish
  for delete using (has_permission(auth.uid(), 'cms.assets.publish'));

-- Protect system content from deletion
create policy "cannot_delete_system_content" on page
  for delete using (
    not is_system or has_permission(auth.uid(), 'system.admin')
  );

create policy "cannot_delete_system_blocks" on block
  for delete using (
    not is_system or has_permission(auth.uid(), 'system.admin')
  );

create policy "cannot_delete_system_menus" on menu
  for delete using (
    not is_system or has_permission(auth.uid(), 'system.admin')
  );

create policy "cannot_delete_system_assets" on asset
  for delete using (
    not is_system or has_permission(auth.uid(), 'system.admin')
  );

-- User permissions management
create policy "manage_user_permissions" on user_permissions
  for all using (has_permission(auth.uid(), 'users.manage'));

-- Audit log access
create policy "read_audit_log" on cms_audit_log
  for select using (has_permission(auth.uid(), 'system.admin'));

-- Site management
create policy "manage_sites" on site
  for all using (has_permission(auth.uid(), 'system.admin'));

-- Base table access (pages, blocks, menus, assets)
create policy "cms_pages_read" on page
  for select using (has_permission(auth.uid(), 'cms.pages.read'));

create policy "cms_blocks_read" on block
  for select using (has_permission(auth.uid(), 'cms.blocks.read'));

create policy "cms_menus_read" on menu
  for select using (has_permission(auth.uid(), 'cms.menus.read'));

create policy "cms_assets_read" on asset
  for select using (has_permission(auth.uid(), 'cms.assets.read'));
