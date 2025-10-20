// CMS Supabase Client Functions
// This file contains all the Supabase client functions for CMS operations

import { supabase } from '../../shell/lib/supabase';
import { getAssetUrl } from './utils';
import type {
  Site, Page, PageVersion, PagePublish, Asset, AssetVersion, AssetPublish,
  UserPermissions, AuditLogEntry, ContentFilters, ContentSort,
  PaginatedResponse, ApiResponse, AssetMeta, AssetKind, LocalizedContent, AssetEditOperation,
  ResolvedPage, ResolvedBlock, ResolvedAsset, ResolvedMenu
} from './types';
import {
  zSite, zPage, zPageVersion, zPagePublish, zAsset, zAssetPublish,
  zUserPermissions, zAuditLogEntry
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
      blockVersion.assets.map(async (assetRef: any) => {
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
            url: getAssetUrl(asset.storage_key, asset.site_id),
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
      url: getAssetUrl(asset.storage_key, asset.site_id),
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
      blockVersion.assets.map(async (assetRef: any) => {
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
            url: getAssetUrl(asset.storage_key, asset.site_id),
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

    // Support multiple kinds filter
    if (filters?.kinds && Array.isArray(filters.kinds) && filters.kinds.length > 0) {
      query = query.in('kind', filters.kinds);
    } else if (filters?.kind) {
      // Backward compatibility with single kind filter
      query = query.eq('kind', filters.kind);
    }

    // Enhanced search: search in storage_key and metadata
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      
      // First, get all assets for this site
      const { data: allAssets } = await supabase
        .from('asset')
        .select('id')
        .eq('site_id', siteId);
      
      if (allAssets && allAssets.length > 0) {
        const assetIds = allAssets.map(a => a.id);
        
        // Search in asset_version metadata
        const { data: matchingVersions } = await supabase
          .from('asset_version')
          .select('asset_id, meta')
          .in('asset_id', assetIds);
        
        const assetIdsWithMetadataMatch = new Set<string>();
        
        // Check metadata for matches
        if (matchingVersions) {
          for (const version of matchingVersions) {
            const meta = version.meta?.['en-US'];
            if (meta) {
              const metaStr = JSON.stringify(meta).toLowerCase();
              if (metaStr.includes(searchTerm)) {
                assetIdsWithMetadataMatch.add(version.asset_id);
              }
            }
          }
        }
        
        // Combine storage_key search with metadata matches
        if (assetIdsWithMetadataMatch.size > 0) {
          query = query.or(
            `storage_key.ilike.%${filters.search}%,id.in.(${Array.from(assetIdsWithMetadataMatch).join(',')})`
          );
        } else {
          query = query.ilike('storage_key', `%${filters.search}%`);
        }
      } else {
        query = query.ilike('storage_key', `%${filters.search}%`);
      }
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

    // Debug: Log the raw data to see what we're getting
    console.log('Raw asset data from database:', JSON.stringify(data, null, 2));

    // Transform data to handle invalid UUIDs
    const transformedData = data?.map((asset: any) => {
      // Check if UUIDs are valid, if not, generate new ones or skip
      const isValidUuid = (uuid: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
      };

      // If UUIDs are invalid, we'll need to handle this
      if (!isValidUuid(asset.id) || !isValidUuid(asset.site_id) || !isValidUuid(asset.created_by)) {
        console.warn('Invalid UUID found in asset data:', asset);
        return null; // Filter out invalid records
      }

      return asset;
    }).filter(Boolean) || [];

    console.log('Transformed asset data:', JSON.stringify(transformedData, null, 2));

    try {
      const assets = zAsset.array().parse(transformedData);
      const totalPages = Math.ceil((count || 0) / pageSize);

      return {
        data: {
          data: assets,
          total_pages: totalPages,
          count: count || 0,
          page,
          page_size: pageSize
        },
        error: null
      };
    } catch (parseError) {
      console.error('Asset data validation failed:', parseError);
      console.error('Invalid data:', JSON.stringify(data, null, 2));
      
      // Return empty result with error
      return {
        data: {
          data: [],
          total_pages: 0,
          count: 0,
          page,
          page_size: pageSize
        },
        error: `Asset data validation failed: ${parseError instanceof Error ? parseError.message : 'Unknown validation error'}`
      };
    }
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

// Utility function to ensure the site-specific bucket exists
export async function ensureSiteBucket(siteId: string): Promise<ApiResponse<boolean>> {
  try {
    // Try to list buckets first
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.warn('Could not list buckets (RLS restriction), assuming bucket exists:', listError);
      // If we can't list buckets due to RLS, assume the bucket exists and continue
      return { data: true, error: null };
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === siteId);
    
    if (bucketExists) {
      console.log(`Site bucket ${siteId} already exists`);
      return { data: true, error: null };
    }

    console.log(`Site bucket ${siteId} not found. Attempting to create...`);
    const { error: bucketError } = await supabase.storage.createBucket(siteId, {
      public: true,
      allowedMimeTypes: ['image/*', 'video/*', 'application/*'],
      fileSizeLimit: 50 * 1024 * 1024 // 50MB limit
    });
    
    if (bucketError) {
      console.error('Failed to create bucket (this is expected in local development):', bucketError);
      console.log(`Please create the ${siteId} bucket manually in the Supabase dashboard or run the seed script`);
      // Don't return error - just log it and continue
      return { data: false, error: `Bucket creation failed: ${bucketError.message}. Please create the bucket manually.` };
    }

    console.log(`Site bucket ${siteId} created successfully`);
    return { data: true, error: null };
  } catch (error) {
    console.error('Error checking/creating bucket:', error);
    return { data: false, error: error instanceof Error ? error.message : 'Unknown error' };
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

    // Generate unique storage key while preserving original filename
    const originalExt = file.name.split('.').pop();
    const baseFileName = file.name.replace(`.${originalExt}`, '').replace(/[^a-zA-Z0-9-_]/g, '-'); // Sanitize filename
    
    // Determine correct file extension based on actual MIME type (handles WebP conversion)
    let fileExt = originalExt;
    if (file.type === 'image/webp') {
      fileExt = 'webp';
    } else if (file.type === 'image/jpeg') {
      fileExt = 'jpg';
    } else if (file.type === 'image/png') {
      fileExt = 'png';
    } else if (file.type === 'image/gif') {
      fileExt = 'gif';
    }
    
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileName = `${baseFileName}-${timestamp}-${randomId}.${fileExt}`;
    const storageKey = `assets/${fileName}`;

    // Use the same bucket name format as the seed script
    const bucketName = `site-${siteId.replace(/-/g, '')}`;
    console.log(`Attempting upload to bucket: ${bucketName}`);

    // Upload to Supabase Storage using the standard bucket name format
    console.log(`Uploading to bucket: ${bucketName}, path: ${storageKey}`);
    console.log(`File details: name=${file.name}, size=${file.size}, type=${file.type}`);
    
    // Try the upload with the standard bucket name format
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storageKey, file);
    
    console.log('Upload response:', { data: uploadData, error: uploadError });

    if (uploadError) {
      console.error('Upload failed:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    console.log('Upload successful:', storageKey);

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
    const assetData = {
      site_id: siteId,
      kind,
      storage_key: storageKey,
      width,
      height,
      duration_ms: durationMs,
      checksum: '', // TODO: Calculate checksum
      created_by: user.id
    };
    
    console.log('Creating asset record with data:', assetData);
    
    const { data: asset, error: assetError } = await supabase
      .from('asset')
      .insert(assetData)
      .select()
      .single();

    console.log('Asset insert response:', { data: asset, error: assetError });

    if (assetError) {
      console.error('Asset insert failed:', assetError);
      throw assetError;
    }

    // Create initial asset version
    const { error: versionError } = await supabase
      .from('asset_version')
      .insert({
        asset_id: asset.id,
        version: 1,
        meta: {
          'en-US': {
            alt: meta?.alt || '',
            caption: meta?.caption || '',
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
    // Get asset to find storage key and site_id
    const { data: asset } = await supabase
      .from('asset')
      .select('storage_key, site_id')
      .eq('id', assetId)
      .single();

    if (asset) {
      const bucketName = `site-${asset.site_id.replace(/-/g, '')}`;
      const filesToDelete: string[] = [asset.storage_key];

      // Get all variants for this asset
      const { data: variants } = await supabase
        .from('asset_variant')
        .select('storage_key')
        .eq('asset_id', assetId);

      // Add all variant storage keys to the delete list
      if (variants && variants.length > 0) {
        filesToDelete.push(...variants.map(v => v.storage_key));
      }

      console.log(`Deleting asset and ${variants?.length || 0} variants from storage:`, filesToDelete);

      // Delete all files from storage (original + variants)
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove(filesToDelete);

      if (storageError) {
        console.error('Error deleting files from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database (cascade will handle related records including variant records)
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

    const versions = data as AssetVersion[];
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

    const version = data as AssetVersion;
    return { data: version, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Update asset metadata by creating a new asset version
 */
export async function updateAssetMetadata(
  assetId: string,
  metadata: {
    fileName?: string;
    altText?: string;
    description?: string;
    tags?: string[];
    focalPoint?: { x: number; y: number };
  }
): Promise<ApiResponse<AssetVersion>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Build the meta object for the asset version
    const meta: LocalizedContent<AssetMeta> = {
      'en-US': {
        alt: metadata.altText || '',
        caption: metadata.description || '',
        tags: metadata.tags || []
      }
    };

    // Add name to meta if provided
    if (metadata.fileName) {
      (meta['en-US'] as any).name = metadata.fileName;
    }

    // If focal point is provided, add it to meta
    if (metadata.focalPoint) {
      (meta['en-US'] as any).focalPoint = metadata.focalPoint;
    }

    // Create a new asset version with the metadata
    return await createAssetVersion(assetId, meta);
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Update an existing asset with edited version (replaces original)
 */
export async function updateExistingAsset(
  assetId: string,
  editedImageBlob: Blob,
  editOperation: AssetEditOperation
): Promise<ApiResponse<Asset>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get original asset info
    const { data: originalAsset, error: fetchError } = await supabase
      .from('asset')
      .select('*')
      .eq('id', assetId)
      .single();

    if (fetchError || !originalAsset) {
      throw new Error('Original asset not found');
    }

    // Get dimensions of edited image
    const img = await createImageBitmap(editedImageBlob);
    const width = img.width;
    const height = img.height;

    const bucketName = `site-${originalAsset.site_id.replace(/-/g, '')}`;
    
    // Delete old variants from storage and database
    const { data: oldVariants } = await supabase
      .from('asset_variant')
      .select('storage_key')
      .eq('asset_id', assetId);

    if (oldVariants && oldVariants.length > 0) {
      console.log(`Deleting ${oldVariants.length} old variants`);
      const variantKeys = oldVariants.map(v => v.storage_key);
      await supabase.storage.from(bucketName).remove(variantKeys);
      await supabase.from('asset_variant').delete().eq('asset_id', assetId);
    }

    // Upload edited image to replace original
    console.log(`Updating asset at: ${bucketName}/${originalAsset.storage_key}`);
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(originalAsset.storage_key, editedImageBlob, {
        contentType: 'image/jpeg',
        upsert: true // Replace existing file
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Update asset record with new dimensions
    const { data: updatedAsset, error: updateError } = await supabase
      .from('asset')
      .update({
        width,
        height,
      })
      .eq('id', assetId)
      .select()
      .single();

    if (updateError) {
      console.error('Asset update error:', updateError);
      throw updateError;
    }

    // Get current max version for this asset
    const { data: maxVersionData } = await supabase
      .from('asset_version')
      .select('version')
      .eq('asset_id', assetId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const newVersion = (maxVersionData?.version || 0) + 1;

    // Create new asset version with edit operation
    const { error: versionError } = await supabase
      .from('asset_version')
      .insert({
        asset_id: assetId,
        version: newVersion,
        meta: {
          'en-US': {
            alt: `Edited version ${newVersion}`,
            caption: `Edit: ${editOperation.operation}`,
            tags: ['edited']
          }
        },
        edit_operation: editOperation,
        created_by: user.id
      });

    if (versionError) {
      console.error('Version creation error:', versionError);
      throw versionError;
    }

    // Trigger variant generation for the updated asset
    console.log('Triggering variant generation for updated asset:', assetId);
    generateAssetVariants(assetId).catch((err) => {
      console.error('Failed to generate variants for updated asset:', err);
    });

    const parsedAsset = zAsset.parse(updatedAsset);
    return { data: parsedAsset, error: null };
  } catch (error) {
    console.error('Error updating asset:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Save an edited asset by creating a new asset record and version
 */
export async function saveEditedAsset(
  originalAssetId: string,
  editedImageBlob: Blob,
  editOperation: AssetEditOperation
): Promise<ApiResponse<Asset>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get original asset info
    const { data: originalAsset, error: fetchError } = await supabase
      .from('asset')
      .select('*')
      .eq('id', originalAssetId)
      .single();

    if (fetchError || !originalAsset) {
      throw new Error('Original asset not found');
    }

    // Get dimensions of edited image
    const img = await createImageBitmap(editedImageBlob);
    const width = img.width;
    const height = img.height;

    // Generate storage key for edited asset
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const originalExt = originalAsset.storage_key.split('.').pop();
    const baseName = originalAsset.storage_key.split('/').pop()?.replace(`.${originalExt}`, '') || 'asset';
    const fileName = `${baseName}-edited-${timestamp}-${randomId}.jpg`;
    const storageKey = `assets/${fileName}`;

    // Upload edited image to storage
    const bucketName = `site-${originalAsset.site_id.replace(/-/g, '')}`;
    console.log(`Uploading edited asset to: ${bucketName}/${storageKey}`);

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storageKey, editedImageBlob, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Create new asset record
    const { data: newAsset, error: assetError } = await supabase
      .from('asset')
      .insert({
        site_id: originalAsset.site_id,
        kind: 'image',
        storage_key: storageKey,
        width,
        height,
        checksum: '',
        is_system: false,
        created_by: user.id
      })
      .select()
      .single();

    if (assetError) {
      console.error('Asset creation error:', assetError);
      throw assetError;
    }

    // Create asset version with edit operation
    const { error: versionError } = await supabase
      .from('asset_version')
      .insert({
        asset_id: newAsset.id,
        version: 1,
        meta: {
          'en-US': {
            alt: `Edited version of ${originalAsset.storage_key}`,
            caption: `Edit: ${editOperation.operation}`,
            tags: ['edited']
          }
        },
        edit_operation: editOperation,
        created_by: user.id
      });

    if (versionError) {
      console.error('Version creation error:', versionError);
      throw versionError;
    }

    // Trigger variant generation for the new edited asset
    console.log('Triggering variant generation for edited asset:', newAsset.id);
    generateAssetVariants(newAsset.id).catch((err) => {
      console.error('Failed to generate variants for edited asset:', err);
    });

    const parsedAsset = zAsset.parse(newAsset);
    return { data: parsedAsset, error: null };
  } catch (error) {
    console.error('Error saving edited asset:', error);
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

// Asset variant management
export interface AssetVariant {
  id: string;
  asset_id: string;
  variant_name: string;
  storage_key: string;
  width: number | null;
  height: number | null;
  file_size: number | null;
  created_at: string;
}

export async function generateAssetVariants(assetId: string): Promise<ApiResponse<void>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Get the Supabase URL from environment
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL not configured');

    // Call the Edge Function to generate variants
    const response = await fetch(`${supabaseUrl}/functions/v1/process-asset-variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ assetId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate variants');
    }

    const result = await response.json();
    console.log('Variant generation result:', result);

    return { data: undefined, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getAssetVariants(assetId: string): Promise<ApiResponse<AssetVariant[]>> {
  try {
    const { data, error } = await supabase
      .from('asset_variant')
      .select('*')
      .eq('asset_id', assetId)
      .order('variant_name', { ascending: true });

    if (error) throw error;

    return { data: data as AssetVariant[], error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteAssetVariant(variantId: string): Promise<ApiResponse<void>> {
  try {
    // Get variant to find storage key
    const { data: variant } = await supabase
      .from('asset_variant')
      .select('storage_key, asset_id')
      .eq('id', variantId)
      .single();

    if (variant) {
      // Get asset to find bucket
      const { data: asset } = await supabase
        .from('asset')
        .select('site_id')
        .eq('id', variant.asset_id)
        .single();

      if (asset) {
        const bucketName = `site-${asset.site_id.replace(/-/g, '')}`;
        // Delete from storage
        await supabase.storage
          .from(bucketName)
          .remove([variant.storage_key]);
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('asset_variant')
      .delete()
      .eq('id', variantId);

    if (error) throw error;

    return { data: undefined, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
