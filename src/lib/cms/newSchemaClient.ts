// New Schema Client Functions
// This file contains client functions for the properly named schema

import { supabase } from '../../shell/lib/supabase';

// Analytics functions
export async function createAnalyticsUser(userId: string, properties: Record<string, any> = {}) {
  const { data, error } = await supabase
    .from('analytics_users')
    .insert({
      user_id: userId,
      properties
    })
    .select()
    .single();

  return { data, error };
}

export async function createAnalyticsSession(userId: string, sessionId: string, properties: Record<string, any> = {}) {
  const { data, error } = await supabase
    .from('analytics_sessions')
    .insert({
      user_id: userId,
      session_id: sessionId,
      properties
    })
    .select()
    .single();

  return { data, error };
}

export async function trackPageView(sessionId: string, userId: string, pagePath: string, pageTitle?: string, properties: Record<string, any> = {}) {
  const { data, error } = await supabase
    .from('analytics_pageviews')
    .insert({
      session_id: sessionId,
      user_id: userId,
      page_path: pagePath,
      page_title: pageTitle,
      properties
    })
    .select()
    .single();

  return { data, error };
}

export async function trackEvent(sessionId: string, userId: string, eventName: string, eventCategory?: string, eventValue?: number, properties: Record<string, any> = {}) {
  const { data, error } = await supabase
    .from('analytics_events')
    .insert({
      session_id: sessionId,
      user_id: userId,
      event_name: eventName,
      event_category: eventCategory,
      event_value: eventValue,
      properties
    })
    .select()
    .single();

  return { data, error };
}

// Leads functions
export async function createLeadSubmission(formName: string, formData: Record<string, any>, utmData?: Record<string, string>) {
  const { data, error } = await supabase
    .from('leads_submissions')
    .insert({
      form_name: formName,
      form_data: formData,
      utm_source: utmData?.utm_source,
      utm_medium: utmData?.utm_medium,
      utm_campaign: utmData?.utm_campaign,
      utm_term: utmData?.utm_term,
      utm_content: utmData?.utm_content
    })
    .select()
    .single();

  return { data, error };
}

export async function getLeadSubmissions(formName?: string, limit: number = 100) {
  let query = supabase
    .from('leads_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (formName) {
    query = query.eq('form_name', formName);
  }

  const { data, error } = await query;

  return { data, error };
}

// System functions
export async function createSite(name: string, domain: string, settings: Record<string, any> = {}) {
  const { data, error } = await supabase
    .from('system_sites')
    .insert({
      name,
      domain,
      settings
    })
    .select()
    .single();

  return { data, error };
}

export async function getUserPermissions(userId: string) {
  const { data, error } = await supabase
    .from('system_user_permissions')
    .select('permissions')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

export async function setUserPermissions(userId: string, permissions: string[]) {
  const { data, error } = await supabase
    .from('system_user_permissions')
    .upsert({
      user_id: userId,
      permissions
    })
    .select()
    .single();

  return { data, error };
}

export async function logAuditAction(userId: string, action: string, entityType: string, entityId: string, oldValues?: Record<string, any>, newValues?: Record<string, any>) {
  const { data, error } = await supabase
    .from('system_audit_log')
    .insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues
    })
    .select()
    .single();

  return { data, error };
}

// CMS Pages functions
export async function createCmsPage(siteId: string, slug: string, systemKey?: string, isSystem: boolean = false) {
  const { data, error } = await supabase
    .from('cms_pages')
    .insert({
      site_id: siteId,
      slug,
      system_key: systemKey,
      is_system: isSystem
    })
    .select()
    .single();

  return { data, error };
}

export async function getCmsPages(siteId: string) {
  const { data, error } = await supabase
    .from('cms_pages')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function createCmsPageVersion(pageId: string, title: Record<string, string>, layoutVariant?: string, seo?: Record<string, any>, navHints?: Record<string, any>, slots?: any[]) {
  // Get next version number
  const { data: lastVersion } = await supabase
    .from('cms_page_versions')
    .select('version')
    .eq('page_id', pageId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (lastVersion?.version || 0) + 1;

  const { data, error } = await supabase
    .from('cms_page_versions')
    .insert({
      page_id: pageId,
      version: nextVersion,
      title,
      layout_variant: layoutVariant,
      seo: seo || {},
      nav_hints: navHints || {},
      slots: slots || []
    })
    .select()
    .single();

  return { data, error };
}

export async function publishCmsPage(pageId: string, version: number) {
  const { data, error } = await supabase
    .from('cms_page_publishes')
    .upsert({
      page_id: pageId,
      version
    })
    .select()
    .single();

  return { data, error };
}

// CMS Blocks functions
export async function createCmsBlock(siteId: string, type: string, tag?: string, systemKey?: string, isSystem: boolean = false) {
  const { data, error } = await supabase
    .from('cms_blocks')
    .insert({
      site_id: siteId,
      type,
      tag,
      system_key: systemKey,
      is_system: isSystem
    })
    .select()
    .single();

  return { data, error };
}

export async function getCmsBlocks(siteId: string) {
  const { data, error } = await supabase
    .from('cms_blocks')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function createCmsBlockVersion(blockId: string, layoutVariant?: string, content?: Record<string, any>, assets?: any[]) {
  // Get next version number
  const { data: lastVersion } = await supabase
    .from('cms_block_versions')
    .select('version')
    .eq('block_id', blockId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (lastVersion?.version || 0) + 1;

  const { data, error } = await supabase
    .from('cms_block_versions')
    .insert({
      block_id: blockId,
      version: nextVersion,
      layout_variant: layoutVariant,
      content: content || {},
      assets: assets || []
    })
    .select()
    .single();

  return { data, error };
}

export async function publishCmsBlock(blockId: string, version: number) {
  const { data, error } = await supabase
    .from('cms_block_publishes')
    .upsert({
      block_id: blockId,
      version
    })
    .select()
    .single();

  return { data, error };
}

// CMS Menus functions
export async function createCmsMenu(siteId: string, handle: string, label: string, systemKey?: string, isSystem: boolean = false) {
  const { data, error } = await supabase
    .from('cms_menus')
    .insert({
      site_id: siteId,
      handle,
      label,
      system_key: systemKey,
      is_system: isSystem
    })
    .select()
    .single();

  return { data, error };
}

export async function getCmsMenus(siteId: string) {
  const { data, error } = await supabase
    .from('cms_menus')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function createCmsMenuVersion(menuId: string, items: any[]) {
  // Get next version number
  const { data: lastVersion } = await supabase
    .from('cms_menu_versions')
    .select('version')
    .eq('menu_id', menuId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (lastVersion?.version || 0) + 1;

  const { data, error } = await supabase
    .from('cms_menu_versions')
    .insert({
      menu_id: menuId,
      version: nextVersion,
      items
    })
    .select()
    .single();

  return { data, error };
}

export async function publishCmsMenu(menuId: string, version: number) {
  const { data, error } = await supabase
    .from('cms_menu_publishes')
    .upsert({
      menu_id: menuId,
      version
    })
    .select()
    .single();

  return { data, error };
}

// CMS Assets functions
export async function createCmsAsset(siteId: string, kind: string, storageKey: string, width?: number, height?: number, durationMs?: number) {
  const { data, error } = await supabase
    .from('cms_assets')
    .insert({
      site_id: siteId,
      kind,
      storage_key: storageKey,
      width,
      height,
      duration_ms: durationMs
    })
    .select()
    .single();

  return { data, error };
}

export async function getCmsAssets(siteId: string) {
  const { data, error } = await supabase
    .from('cms_assets')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function createCmsAssetVersion(assetId: string, meta?: Record<string, any>, editOperation?: Record<string, any>) {
  // Get next version number
  const { data: lastVersion } = await supabase
    .from('cms_asset_versions')
    .select('version')
    .eq('asset_id', assetId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (lastVersion?.version || 0) + 1;

  const { data, error } = await supabase
    .from('cms_asset_versions')
    .insert({
      asset_id: assetId,
      version: nextVersion,
      meta: meta || {},
      edit_operation: editOperation
    })
    .select()
    .single();

  return { data, error };
}

export async function publishCmsAsset(assetId: string, version: number) {
  const { data, error } = await supabase
    .from('cms_asset_publishes')
    .upsert({
      asset_id: assetId,
      version
    })
    .select()
    .single();

  return { data, error };
}

export async function createCmsAssetVariant(assetId: string, variantName: string, storageKey: string, width?: number, height?: number, fileSize?: number) {
  const { data, error } = await supabase
    .from('cms_asset_variants')
    .insert({
      asset_id: assetId,
      variant_name: variantName,
      storage_key: storageKey,
      width,
      height,
      file_size: fileSize
    })
    .select()
    .single();

  return { data, error };
}

export async function createCmsAssetUsage(assetId: string, entityType: string, entityId: string, role?: string) {
  const { data, error } = await supabase
    .from('cms_asset_usage')
    .insert({
      asset_id: assetId,
      entity_type: entityType,
      entity_id: entityId,
      role
    })
    .select()
    .single();

  return { data, error };
}
