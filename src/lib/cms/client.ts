// CMS Supabase Client Functions
// This file contains all the Supabase client functions for CMS operations

import { supabase } from '../../shell/lib/supabase';
import type {
  Site, Page, PageVersion, PagePublish, Block, BlockVersion, BlockPublish,
  Menu, MenuVersion, MenuPublish, Asset, AssetVersion, AssetPublish,
  ResolvedPage, ResolvedBlock, ResolvedMenu, ResolvedAsset,
  UserPermissions, AuditLogEntry, ContentFilters, ContentSort,
  PaginatedResponse, ApiResponse, ImageUploadResult
} from './types';
import {
  zSite, zPage, zPageVersion, zPagePublish, zBlock, zBlockVersion, zBlockPublish,
  zMenu, zMenuVersion, zMenuPublish, zAsset, zAssetVersion, zAssetPublish,
  zResolvedPage, zResolvedBlock, zResolvedMenu, zResolvedAsset,
  zUserPermissions, zAuditLogEntry, zPaginatedResponse, zImageUploadResult
} from './schemas';

// Permission checking
export async function hasPermission(permission: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase.rpc('has_permission', {
    p_user_id: user.id,
    p_permission: permission
  });

  if (error) {
    console.error('Permission check failed:', error);
    return false;
  }

  return data;
}

// User permissions management
export async function getUserPermissions(userId: string): Promise<ApiResponse<UserPermissions[]>> {
  try {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', userId)
      .order('granted_at', { ascending: false });

    if (error) throw error;

    const permissions = zUserPermissions.array().parse(data);
    return { data: permissions, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function grantPermission(
  userId: string,
  permission: string,
  grantedBy?: string
): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('user_permissions')
      .insert({
        user_id: userId,
        permission,
        granted_by: grantedBy
      });

    if (error) throw error;
    return { data: undefined, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function revokePermission(
  userId: string,
  permission: string
): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId)
      .eq('permission', permission);

    if (error) throw error;
    return { data: undefined, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Site management
export async function getSites(): Promise<ApiResponse<Site[]>> {
  try {
    const { data, error } = await supabase
      .from('site')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    const sites = zSite.array().parse(data);
    return { data: sites, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getSite(siteId: string): Promise<ApiResponse<Site>> {
  try {
    const { data, error } = await supabase
      .from('site')
      .select('*')
      .eq('id', siteId)
      .single();

    if (error) throw error;
    const site = zSite.parse(data);
    return { data: site, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Page management
export async function getPages(
  siteId: string,
  filters?: ContentFilters,
  sort?: ContentSort,
  page = 1,
  pageSize = 20
): Promise<ApiResponse<PaginatedResponse<Page>>> {
  try {
    let query = supabase
      .from('page')
      .select('*', { count: 'exact' })
      .eq('site_id', siteId);

    if (filters?.is_system !== undefined) {
      query = query.eq('is_system', filters.is_system);
    }

    if (filters?.search) {
      query = query.or(`slug.ilike.%${filters.search}%,system_key.ilike.%${filters.search}%`);
    }

    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const pages = zPage.array().parse(data);
    const totalPages = Math.ceil((count || 0) / pageSize);

    return {
      data: {
        data: pages,
        count: count || 0,
        page,
        page_size: pageSize,
        total_pages: totalPages
      },
      error: null
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getPage(pageId: string): Promise<ApiResponse<Page>> {
  try {
    const { data, error } = await supabase
      .from('page')
      .select('*')
      .eq('id', pageId)
      .single();

    if (error) throw error;
    const page = zPage.parse(data);
    return { data: page, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getPageBySystemKey(systemKey: string): Promise<ApiResponse<Page>> {
  try {
    const { data, error } = await supabase
      .from('page')
      .select('*')
      .eq('system_key', systemKey)
      .single();

    if (error) throw error;
    const page = zPage.parse(data);
    return { data: page, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createPage(pageData: Omit<Page, 'id' | 'created_at' | 'created_by'>): Promise<ApiResponse<Page>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('page')
      .insert({
        ...pageData,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    const page = zPage.parse(data);
    return { data: page, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updatePage(pageId: string, updates: Partial<Page>): Promise<ApiResponse<Page>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('page')
      .update({
        ...updates,
        updated_by: user.id
      })
      .eq('id', pageId)
      .select()
      .single();

    if (error) throw error;
    const page = zPage.parse(data);
    return { data: page, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deletePage(pageId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('page')
      .delete()
      .eq('id', pageId);

    if (error) throw error;
    return { data: undefined, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Page version management
export async function getPageVersions(pageId: string): Promise<ApiResponse<PageVersion[]>> {
  try {
    const { data, error } = await supabase
      .from('page_version')
      .select('*')
      .eq('page_id', pageId)
      .order('version', { ascending: false });

    if (error) throw error;
    const versions = zPageVersion.array().parse(data);
    return { data: versions, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getPageVersion(pageId: string, version: number): Promise<ApiResponse<PageVersion>> {
  try {
    const { data, error } = await supabase
      .from('page_version')
      .select('*')
      .eq('page_id', pageId)
      .eq('version', version)
      .single();

    if (error) throw error;
    const pageVersion = zPageVersion.parse(data);
    return { data: pageVersion, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createPageVersion(versionData: Omit<PageVersion, 'id' | 'created_at' | 'created_by'>): Promise<ApiResponse<PageVersion>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('page_version')
      .insert({
        ...versionData,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    const pageVersion = zPageVersion.parse(data);
    return { data: pageVersion, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updatePageVersion(
  pageId: string,
  version: number,
  updates: Partial<PageVersion>
): Promise<ApiResponse<PageVersion>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('page_version')
      .update({
        ...updates,
        updated_by: user.id
      })
      .eq('page_id', pageId)
      .eq('version', version)
      .select()
      .single();

    if (error) throw error;
    const pageVersion = zPageVersion.parse(data);
    return { data: pageVersion, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Page publishing
export async function publishPage(pageId: string, version: number): Promise<ApiResponse<PagePublish>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user has publish permission
    const canPublish = await hasPermission('cms.pages.publish');
    if (!canPublish) throw new Error('Insufficient permissions to publish pages');

    const { data, error } = await supabase
      .from('page_publish')
      .upsert({
        page_id: pageId,
        version,
        published_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    // Update page version status to published
    await supabase
      .from('page_version')
      .update({ status: 'published' })
      .eq('page_id', pageId)
      .eq('version', version);

    const pagePublish = zPagePublish.parse(data);
    return { data: pagePublish, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function unpublishPage(pageId: string): Promise<ApiResponse<void>> {
  try {
    const canPublish = await hasPermission('cms.pages.publish');
    if (!canPublish) throw new Error('Insufficient permissions to unpublish pages');

    const { error } = await supabase
      .from('page_publish')
      .delete()
      .eq('page_id', pageId);

    if (error) throw error;
    return { data: undefined, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Published content resolution
export async function getPublishedPage(siteHandle: string, slug: string, locale = 'en-US'): Promise<ApiResponse<ResolvedPage>> {
  try {
    // Get site
    const { data: site } = await supabase
      .from('site')
      .select('id')
      .eq('handle', siteHandle)
      .single();

    if (!site) throw new Error('Site not found');

    // Get published page
    const { data: pagePublish } = await supabase
      .from('page_publish')
      .select('version')
      .eq('page_id', (await supabase
        .from('page')
        .select('id')
        .eq('site_id', site.id)
        .eq('slug', slug)
        .single()
      ).data?.id)
      .single();

    if (!pagePublish) throw new Error('Page not published');

    // Get page version
    const { data: pageVersion } = await supabase
      .from('page_version')
      .select('*')
      .eq('page_id', (await supabase
        .from('page')
        .select('id')
        .eq('site_id', site.id)
        .eq('slug', slug)
        .single()
      ).data?.id)
      .eq('version', pagePublish.version)
      .single();

    if (!pageVersion) throw new Error('Page version not found');

    // Resolve blocks in slots
    const resolvedSlots: Record<string, ResolvedBlock[]> = {};
    for (const slot of pageVersion.slots) {
      const block = await resolveBlockForLocale(slot.block_id, locale);
      if (block) {
        resolvedSlots[slot.slot] = resolvedSlots[slot.slot] || [];
        resolvedSlots[slot.slot].push(block);
      }
    }

    const resolvedPage: ResolvedPage = {
      site_handle: siteHandle,
      slug,
      locale,
      version: pagePublish.version,
      title: pageVersion.title[locale] || pageVersion.title['en-US'],
      layout_variant: pageVersion.layout_variant,
      seo: pageVersion.seo[locale] || pageVersion.seo['en-US'],
      nav_hints: pageVersion.nav_hints[locale] || pageVersion.nav_hints['en-US'],
      slots: resolvedSlots
    };

    return { data: resolvedPage, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getPublishedPageByKey(systemKey: string, locale = 'en-US'): Promise<ApiResponse<ResolvedPage>> {
  try {
    const { data: page } = await getPageBySystemKey(systemKey);
    if (!page) throw new Error('Page not found');

    const { data: site } = await getSite(page.site_id);
    if (!site) throw new Error('Site not found');

    return await getPublishedPage(site.handle, page.slug, locale);
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Published content resolution functions
export async function getPublishedBlockByKey(systemKey: string, locale = 'en-US'): Promise<ApiResponse<ResolvedBlock>> {
  try {
    const { data: block } = await supabase
      .from('block')
      .select('*')
      .eq('system_key', systemKey)
      .single();

    if (!block) throw new Error('Block not found');

    const { data: blockPublish } = await supabase
      .from('block_publish')
      .select('version')
      .eq('block_id', block.id)
      .single();

    if (!blockPublish) throw new Error('Block not published');

    const { data: blockVersion } = await supabase
      .from('block_version')
      .select('*')
      .eq('block_id', block.id)
      .eq('version', blockPublish.version)
      .single();

    if (!blockVersion) throw new Error('Block version not found');

    // Resolve assets
    const assets = await Promise.all(
      blockVersion.assets.map(async (assetRef) => {
        const { data: asset } = await supabase
          .from('asset')
          .select('*')
          .eq('id', assetRef.asset_id)
          .single();

        if (!asset) return null;

        const { data: assetPublish } = await supabase
          .from('asset_publish')
          .select('version')
          .eq('asset_id', asset.id)
          .single();

        if (!assetPublish) return null;

        const { data: assetVersion } = await supabase
          .from('asset_version')
          .select('*')
          .eq('asset_id', asset.id)
          .eq('version', assetPublish.version)
          .single();

        if (!assetVersion) return null;

        return {
          role: assetRef.role,
          asset: {
            id: asset.id,
            kind: asset.kind,
            url: `https://your-project.supabase.co/storage/v1/object/public/cms-assets/${asset.storage_key}`,
            width: asset.width,
            height: asset.height,
            durationMs: asset.duration_ms,
            meta: assetVersion.meta[locale] || assetVersion.meta['en-US']
          }
        };
      })
    );

    const resolvedBlock: ResolvedBlock = {
      block_id: block.id,
      block_version_id: blockVersion.id,
      type: block.type,
      layout_variant: blockVersion.layout_variant,
      content: blockVersion.content[locale] || blockVersion.content['en-US'],
      assets: assets.filter(Boolean) as Array<{ role: string; asset: ResolvedAsset }>,
      instance_props: {}
    };

    return { data: resolvedBlock, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getPublishedAssetByKey(systemKey: string): Promise<ApiResponse<ResolvedAsset>> {
  try {
    const { data: asset } = await supabase
      .from('asset')
      .select('*')
      .eq('system_key', systemKey)
      .single();

    if (!asset) throw new Error('Asset not found');

    const { data: assetPublish } = await supabase
      .from('asset_publish')
      .select('version')
      .eq('asset_id', asset.id)
      .single();

    if (!assetPublish) throw new Error('Asset not published');

    const { data: assetVersion } = await supabase
      .from('asset_version')
      .select('*')
      .eq('asset_id', asset.id)
      .eq('version', assetPublish.version)
      .single();

    if (!assetVersion) throw new Error('Asset version not found');

    const resolvedAsset: ResolvedAsset = {
      id: asset.id,
      kind: asset.kind,
      url: `https://your-project.supabase.co/storage/v1/object/public/cms-assets/${asset.storage_key}`,
      width: asset.width,
      height: asset.height,
      durationMs: asset.duration_ms,
      meta: assetVersion.meta
    };

    return { data: resolvedAsset, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getPublishedMenuByKey(systemKey: string, locale = 'en-US'): Promise<ApiResponse<ResolvedMenu>> {
  try {
    const { data: menu } = await supabase
      .from('menu')
      .select('*')
      .eq('system_key', systemKey)
      .single();

    if (!menu) throw new Error('Menu not found');

    const { data: menuPublish } = await supabase
      .from('menu_publish')
      .select('version')
      .eq('menu_id', menu.id)
      .single();

    if (!menuPublish) throw new Error('Menu not published');

    const { data: menuVersion } = await supabase
      .from('menu_version')
      .select('*')
      .eq('menu_id', menu.id)
      .eq('version', menuPublish.version)
      .single();

    if (!menuVersion) throw new Error('Menu version not found');

    const resolvedMenu: ResolvedMenu = {
      handle: menu.handle,
      locale,
      version: menuPublish.version,
      items: menuVersion.items[locale] || menuVersion.items['en-US']
    };

    return { data: resolvedMenu, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Helper function to resolve blocks for a specific locale
async function resolveBlockForLocale(blockId: string, locale: string): Promise<ResolvedBlock | null> {
  try {
    const { data: blockPublish } = await supabase
      .from('block_publish')
      .select('version')
      .eq('block_id', blockId)
      .single();

    if (!blockPublish) return null;

    const { data: blockVersion } = await supabase
      .from('block_version')
      .select('*')
      .eq('block_id', blockId)
      .eq('version', blockPublish.version)
      .single();

    if (!blockVersion) return null;

    // Resolve assets
    const assets = await Promise.all(
      blockVersion.assets.map(async (assetRef) => {
        const { data: asset } = await supabase
          .from('asset')
          .select('*')
          .eq('id', assetRef.asset_id)
          .single();

        if (!asset) return null;

        const { data: assetPublish } = await supabase
          .from('asset_publish')
          .select('version')
          .eq('asset_id', asset.id)
          .single();

        if (!assetPublish) return null;

        const { data: assetVersion } = await supabase
          .from('asset_version')
          .select('*')
          .eq('asset_id', asset.id)
          .eq('version', assetPublish.version)
          .single();

        if (!assetVersion) return null;

        return {
          role: assetRef.role,
          asset: {
            id: asset.id,
            kind: asset.kind,
            url: `https://your-project.supabase.co/storage/v1/object/public/cms-assets/${asset.storage_key}`,
            width: asset.width,
            height: asset.height,
            durationMs: asset.duration_ms,
            meta: assetVersion.meta[locale] || assetVersion.meta['en-US']
          }
        };
      })
    );

    return {
      block_id: blockId,
      block_version_id: blockVersion.id,
      type: (await supabase.from('block').select('type').eq('id', blockId).single()).data?.type || '',
      layout_variant: blockVersion.layout_variant,
      content: blockVersion.content[locale] || blockVersion.content['en-US'],
      assets: assets.filter(Boolean) as Array<{ role: string; asset: ResolvedAsset }>,
      instance_props: {}
    };
  } catch (error) {
    console.error('Error resolving block:', error);
    return null;
  }
}

// Audit log
export async function getAuditLog(
  entityType?: string,
  entityId?: string,
  page = 1,
  pageSize = 50
): Promise<ApiResponse<PaginatedResponse<AuditLogEntry>>> {
  try {
    let query = supabase
      .from('cms_audit_log')
      .select('*', { count: 'exact' })
      .order('occurred_at', { ascending: false });

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    if (entityId) {
      query = query.eq('entity_id', entityId);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const entries = zAuditLogEntry.array().parse(data);
    const totalPages = Math.ceil((count || 0) / pageSize);

    return {
      data: {
        data: entries,
        count: count || 0,
        page,
        page_size: pageSize,
        total_pages: totalPages
      },
      error: null
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Asset management functions
export async function getAssets(
  siteId: string,
  filters?: ContentFilters,
  sort?: ContentSort,
  page = 1,
  pageSize = 20
): Promise<ApiResponse<PaginatedResponse<Asset>>> {
  try {
    let query = supabase
      .from('asset')
      .select('*', { count: 'exact' })
      .eq('site_id', siteId);

    if (filters?.kind) {
      query = query.eq('kind', filters.kind);
    }

    if (filters?.search) {
      query = query.ilike('storage_key', `%${filters.search}%`);
    }

    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const assets = zAsset.array().parse(data);
    const totalPages = Math.ceil((count || 0) / pageSize);

    return {
      data: {
        data: assets,
        count: count || 0,
        page,
        page_size: pageSize,
        total_pages: totalPages
      },
      error: null
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getAsset(assetId: string): Promise<ApiResponse<Asset>> {
  try {
    const { data, error } = await supabase
      .from('asset')
      .select('*')
      .eq('id', assetId)
      .single();

    if (error) throw error;

    const asset = zAsset.parse(data);
    return { data: asset, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function uploadAsset(
  siteId: string,
  file: File,
  meta?: Partial<AssetMeta>
): Promise<ApiResponse<Asset>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate unique storage key
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const storageKey = `cms-assets/${siteId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('cms-assets')
      .upload(storageKey, file);

    if (uploadError) throw uploadError;

    // Get file metadata
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const kind: AssetKind = isImage ? 'image' : isVideo ? 'video' : 'file';

    let width: number | undefined;
    let height: number | undefined;
    let durationMs: number | undefined;

    if (isImage) {
      // Get image dimensions
      const img = new Image();
      const imgPromise = new Promise<{ width: number; height: number }>((resolve) => {
        img.onload = () => resolve({ width: img.width, height: img.height });
      });
      img.src = URL.createObjectURL(file);
      const dimensions = await imgPromise;
      width = dimensions.width;
      height = dimensions.height;
      URL.revokeObjectURL(img.src);
    }

    // Create asset record
    const { data: asset, error: assetError } = await supabase
      .from('asset')
      .insert({
        site_id: siteId,
        kind,
        storage_key: storageKey,
        width,
        height,
        duration_ms: durationMs,
        checksum: '', // TODO: Calculate checksum
        created_by: user.id
      })
      .select()
      .single();

    if (assetError) throw assetError;

    // Create initial asset version
    const { error: versionError } = await supabase
      .from('asset_version')
      .insert({
        asset_id: asset.id,
        version: 1,
        meta: {
          'en-US': {
            alt: meta?.alt?.['en-US'] || '',
            caption: meta?.caption?.['en-US'] || '',
            license: meta?.license || '',
            tags: meta?.tags || [],
            focal_point: meta?.focal_point
          }
        },
        created_by: user.id
      });

    if (versionError) throw versionError;

    const parsedAsset = zAsset.parse(asset);
    return { data: parsedAsset, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateAsset(
  assetId: string,
  updates: Partial<Asset>
): Promise<ApiResponse<Asset>> {
  try {
    const { data, error } = await supabase
      .from('asset')
      .update(updates)
      .eq('id', assetId)
      .select()
      .single();

    if (error) throw error;

    const asset = zAsset.parse(data);
    return { data: asset, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteAsset(assetId: string): Promise<ApiResponse<void>> {
  try {
    // Get asset to find storage key
    const { data: asset } = await supabase
      .from('asset')
      .select('storage_key')
      .eq('id', assetId)
      .single();

    if (asset) {
      // Delete from storage
      await supabase.storage
        .from('cms-assets')
        .remove([asset.storage_key]);
    }

    // Delete from database (cascade will handle related records)
    const { error } = await supabase
      .from('asset')
      .delete()
      .eq('id', assetId);

    if (error) throw error;

    return { data: undefined, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getAssetVersions(assetId: string): Promise<ApiResponse<AssetVersion[]>> {
  try {
    const { data, error } = await supabase
      .from('asset_version')
      .select('*')
      .eq('asset_id', assetId)
      .order('version', { ascending: false });

    if (error) throw error;

    const versions = zAssetVersion.array().parse(data);
    return { data: versions, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createAssetVersion(
  assetId: string,
  meta: LocalizedContent<AssetMeta>,
  editOperation?: AssetEditOperation
): Promise<ApiResponse<AssetVersion>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get current max version
    const { data: maxVersion } = await supabase
      .from('asset_version')
      .select('version')
      .eq('asset_id', assetId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const newVersion = (maxVersion?.version || 0) + 1;

    const { data, error } = await supabase
      .from('asset_version')
      .insert({
        asset_id: assetId,
        version: newVersion,
        meta,
        edit_operation: editOperation,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    const version = zAssetVersion.parse(data);
    return { data: version, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function publishAsset(
  assetId: string,
  version: number
): Promise<ApiResponse<AssetPublish>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('asset_publish')
      .upsert({
        asset_id: assetId,
        version,
        published_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    const publish = zAssetPublish.parse(data);
    return { data: publish, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function unpublishAsset(assetId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('asset_publish')
      .delete()
      .eq('asset_id', assetId);

    if (error) throw error;

    return { data: undefined, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
