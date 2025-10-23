// Client-side Resolution Functions
// This file contains client-side resolution functions for preview mode

import { supabase } from '../../shell/lib/supabase';
import { ApiResponse } from './types';

// Resolved content interfaces
export interface ResolvedPage {
  id: string;
  slug: string;
  title: Record<string, string>;
  layout_variant?: string;
  seo: Record<string, any>;
  nav_hints: Record<string, any>;
  slots: Array<{
    slot: string;
    order: number;
    block: ResolvedBlock;
  }>;
  published_at: string;
  published_by: string;
}

export interface ResolvedBlock {
  id: string;
  type: string;
  tag?: string;
  layout_variant: string;
  content: Record<string, any>;
  assets: Array<{
    role: string;
    asset: ResolvedAsset;
  }>;
  published_at: string;
  published_by: string;
}

export interface ResolvedAsset {
  id: string;
  kind: string;
  storage_key: string;
  width?: number;
  height?: number;
  duration_ms?: number;
  variants: Array<{
    variant_name: string;
    storage_key: string;
    width?: number;
    height?: number;
    file_size?: number;
  }>;
  published_at: string;
  published_by: string;
}

export interface ResolvedMenu {
  id: string;
  handle: string;
  label: string;
  items: Array<ResolvedMenuItem>;
  published_at: string;
  published_by: string;
}

export interface ResolvedMenuItem {
  id: string;
  type: 'page' | 'external' | 'anchor' | 'separator' | 'group';
  label: Record<string, string>;
  target?: string;
  rel?: string;
  children?: Array<ResolvedMenuItem>;
  visibility?: {
    device?: Array<'mobile' | 'desktop'>;
    audience?: Array<'anon' | 'user' | 'admin'>;
    featureFlags?: string[];
    schedule?: { start?: string; end?: string };
  };
  badge?: {
    text: Record<string, string>;
    color: string;
  };
  style_hints?: Record<string, any>;
}

// Resolve a published page with all its referenced blocks and assets
export async function resolvePage(
  pageId: string,
  _locale: string = 'en-US'
): Promise<ApiResponse<ResolvedPage>> {
  try {
    // Get published page
    const { data: pageData, error: pageError } = await supabase
      .from('page')
      .select(`
        id,
        slug,
        site_id
      `)
      .eq('id', pageId)
      .single()

    if (pageError || !pageData) {
      return { data: null, error: 'Page not found' };
    }

    // Get published page version
    const { data: pageVersion, error: versionError } = await supabase
      .from('page_version')
      .select(`
        version,
        title,
        layout_variant,
        seo,
        nav_hints,
        slots,
        created_at,
        created_by
      `)
      .eq('page_id', pageId)
      .single()

    if (versionError || !pageVersion) {
      return { data: null, error: 'Published page version not found' };
    }

    // Get publish info
    const { data: publishInfo, error: publishError } = await supabase
      .from('page_publish')
      .select('published_at, published_by')
      .eq('page_id', pageId)
      .single()

    if (publishError || !publishInfo) {
      return { data: null, error: 'Page publish info not found' };
    }

    // Resolve blocks for each slot
    const resolvedSlots = await Promise.all(
      pageVersion.slots.map(async (slot: any) => {
        // Get published block version
        const { data: blockVersion, error: blockVersionError } = await supabase
          .from('block_version')
          .select(`
            version,
            layout_variant,
            content,
            assets,
            created_at,
            created_by
          `)
          .eq('block_id', slot.block_id)
          .single()

        if (blockVersionError || !blockVersion) {
          console.warn(`Block ${slot.block_id} not found or not published`);
          return null;
        }

        // Get block info
        const { data: blockInfo, error: blockInfoError } = await supabase
          .from('block')
          .select('type, tag')
          .eq('id', slot.block_id)
          .single()

        if (blockInfoError || !blockInfo) {
          console.warn(`Block info for ${slot.block_id} not found`);
          return null;
        }

        // Get block publish info
        const { data: blockPublishInfo, error: blockPublishError } = await supabase
          .from('block_publish')
          .select('published_at, published_by')
          .eq('block_id', slot.block_id)
          .single()

        if (blockPublishError || !blockPublishInfo) {
          console.warn(`Block publish info for ${slot.block_id} not found`);
          return null;
        }

        // Resolve assets for this block
        const resolvedAssets = await Promise.all(
          blockVersion.assets.map(async (assetRef: any) => {
            // Get published asset version
            const { data: assetVersion, error: assetVersionError } = await supabase
              .from('asset_version')
              .select(`
                version,
                meta,
                created_at,
                created_by
              `)
              .eq('asset_id', assetRef.asset_id)
              .single()

            if (assetVersionError || !assetVersion) {
              console.warn(`Asset ${assetRef.asset_id} not found or not published`);
              return null;
            }

            // Get asset info
            const { data: assetInfo, error: assetInfoError } = await supabase
              .from('asset')
              .select('kind, storage_key, width, height, duration_ms')
              .eq('id', assetRef.asset_id)
              .single()

            if (assetInfoError || !assetInfo) {
              console.warn(`Asset info for ${assetRef.asset_id} not found`);
              return null;
            }

            // Get asset publish info
            const { data: assetPublishInfo, error: assetPublishError } = await supabase
              .from('asset_publish')
              .select('published_at, published_by')
              .eq('asset_id', assetRef.asset_id)
              .single()

            if (assetPublishError || !assetPublishInfo) {
              console.warn(`Asset publish info for ${assetRef.asset_id} not found`);
              return null;
            }

            // Get asset variants
            const { data: assetVariants, error: variantsError } = await supabase
              .from('asset_variant')
              .select('variant_name, storage_key, width, height, file_size')
              .eq('asset_id', assetRef.asset_id)

            if (variantsError) {
              console.warn(`Asset variants for ${assetRef.asset_id} not found`);
            }

            return {
              role: assetRef.role,
              asset: {
                id: assetRef.asset_id,
                kind: assetInfo.kind,
                storage_key: assetInfo.storage_key,
                width: assetInfo.width,
                height: assetInfo.height,
                duration_ms: assetInfo.duration_ms,
                variants: assetVariants || [],
                published_at: assetPublishInfo.published_at,
                published_by: assetPublishInfo.published_by
              }
            };
          })
        );

        return {
          slot: slot.slot,
          order: slot.order,
          block: {
            id: slot.block_id,
            type: blockInfo.type,
            tag: blockInfo.tag,
            layout_variant: blockVersion.layout_variant,
            content: blockVersion.content,
            assets: resolvedAssets.filter(asset => asset !== null),
            published_at: blockPublishInfo.published_at,
            published_by: blockPublishInfo.published_by
          }
        };
      })
    );

    // Filter out null slots (blocks that couldn't be resolved)
    const validSlots = resolvedSlots.filter(slot => slot !== null);

    // Build resolved page
    const resolvedPage: ResolvedPage = {
      id: pageData.id,
      slug: pageData.slug,
      title: pageVersion.title,
      layout_variant: pageVersion.layout_variant,
      seo: pageVersion.seo,
      nav_hints: pageVersion.nav_hints,
      slots: validSlots,
      published_at: publishInfo.published_at,
      published_by: publishInfo.published_by
    };

    return { data: resolvedPage, error: null };

  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Resolve a published menu with its item tree
export async function resolveMenu(
  menuId: string,
  _locale: string = 'en-US'
): Promise<ApiResponse<ResolvedMenu>> {
  try {
    // Get published menu
    const { data: menuData, error: menuError } = await supabase
      .from('menu')
      .select(`
        id,
        handle,
        label,
        site_id
      `)
      .eq('id', menuId)
      .single()

    if (menuError || !menuData) {
      return { data: null, error: 'Menu not found' };
    }

    // Get published menu version
    const { data: menuVersion, error: versionError } = await supabase
      .from('menu_version')
      .select(`
        version,
        items,
        created_at,
        created_by
      `)
      .eq('menu_id', menuId)
      .single()

    if (versionError || !menuVersion) {
      return { data: null, error: 'Published menu version not found' };
    }

    // Get publish info
    const { data: publishInfo, error: publishError } = await supabase
      .from('menu_publish')
      .select('published_at, published_by')
      .eq('menu_id', menuId)
      .single()

    if (publishError || !publishInfo) {
      return { data: null, error: 'Menu publish info not found' };
    }

    // Resolve menu items recursively
    const resolveMenuItems = async (items: any[]): Promise<ResolvedMenuItem[]> => {
      return Promise.all(
        items.map(async (item: any) => {
          const resolvedItem: ResolvedMenuItem = {
            id: item.id,
            type: item.type,
            label: item.label,
            target: item.target,
            rel: item.rel,
            visibility: item.visibility,
            badge: item.badge,
            style_hints: item.style_hints
          };

          // If this is a page item, resolve the page slug
          if (item.type === 'page' && item.page_id) {
            const { data: pageData, error: pageError } = await supabase
              .from('page')
              .select('slug')
              .eq('id', item.page_id)
              .single()

            if (!pageError && pageData) {
              resolvedItem.target = `/${pageData.slug}`;
            }
          }

          // Resolve children recursively
          if (item.children && item.children.length > 0) {
            resolvedItem.children = await resolveMenuItems(item.children);
          }

          return resolvedItem;
        })
      );
    };

    // Resolve all menu items
    const resolvedItems = await resolveMenuItems(menuVersion.items);

    // Build resolved menu
    const resolvedMenu: ResolvedMenu = {
      id: menuData.id,
      handle: menuData.handle,
      label: menuData.label,
      items: resolvedItems,
      published_at: publishInfo.published_at,
      published_by: publishInfo.published_by
    };

    return { data: resolvedMenu, error: null };

  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Resolve page by slug
export async function resolvePageBySlug(
  slug: string,
  siteId: string,
  locale: string = 'en-US'
): Promise<ApiResponse<ResolvedPage>> {
  try {
    // Get page by slug
    const { data: pageData, error: pageError } = await supabase
      .from('page')
      .select('id')
      .eq('slug', slug)
      .eq('site_id', siteId)
      .single()

    if (pageError || !pageData) {
      return { data: null, error: 'Page not found' };
    }

    return await resolvePage(pageData.id, locale);

  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Resolve menu by handle
export async function resolveMenuByHandle(
  handle: string,
  siteId: string,
  locale: string = 'en-US'
): Promise<ApiResponse<ResolvedMenu>> {
  try {
    // Get menu by handle
    const { data: menuData, error: menuError } = await supabase
      .from('menu')
      .select('id')
      .eq('handle', handle)
      .eq('site_id', siteId)
      .single()

    if (menuError || !menuData) {
      return { data: null, error: 'Menu not found' };
    }

    return await resolveMenu(menuData.id, locale);

  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get all published pages for a site
export async function getPublishedPages(siteId: string): Promise<ApiResponse<Array<{
  id: string;
  slug: string;
  title: Record<string, string>;
  published_at: string;
}>>> {
  try {
    const { data, error } = await supabase
      .from('page')
      .select(`
        id,
        slug
      `)
      .eq('site_id', siteId);

    if (error) {
      return { data: [], error: error.message };
    }

    const pages = data?.map(page => ({
      id: page.id,
      slug: page.slug,
      title: { 'en-US': 'Untitled' },
      published_at: new Date().toISOString()
    })) || [];

    return { data: pages, error: null };

  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get all published menus for a site
export async function getPublishedMenus(siteId: string): Promise<ApiResponse<Array<{
  id: string;
  handle: string;
  label: string;
  published_at: string;
}>>> {
  try {
    const { data, error } = await supabase
      .from('menu')
      .select(`
        id,
        handle,
        label
      `)
      .eq('site_id', siteId);

    if (error) {
      return { data: [], error: error.message };
    }

    const menus = data?.map(menu => ({
      id: menu.id,
      handle: menu.handle,
      label: menu.label,
      published_at: new Date().toISOString()
    })) || [];

    return { data: menus, error: null };

  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
