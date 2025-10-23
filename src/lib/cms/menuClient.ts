// Menu Client Functions
// Menu-specific Supabase client functions

import { supabase } from '../../shell/lib/supabase';
import { hasPermission } from './client';
import type {
  Menu, MenuVersion, ContentFilters, ContentSort,
  PaginatedResponse, ApiResponse
} from './types';

export async function getMenus(
  siteId: string,
  filters?: ContentFilters,
  sort?: ContentSort,
  page = 1,
  pageSize = 20
): Promise<ApiResponse<PaginatedResponse<Menu>>> {
  try {
    let query = supabase
      .from('menu')
      .select('*', { count: 'exact' })
      .eq('site_id', siteId);

    // Apply filters
    if (filters?.search) {
      query = query.or(`handle.ilike.%${filters.search}%,label.ilike.%${filters.search}%,system_key.ilike.%${filters.search}%`);
    }

    if (filters?.is_system !== undefined) {
      query = query.eq('is_system', filters.is_system);
    }

    // Apply sorting
    if (sort?.field && sort?.direction) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) throw error;

    return {
      data: {
        data: data || [],
        count: 0,
        page,
        page_size: pageSize,
        total_pages: 0
      },
      error: null
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getMenu(menuId: string): Promise<ApiResponse<Menu>> {
  try {
    const { data, error } = await supabase
      .from('menu')
      .select('*')
      .eq('id', menuId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createMenu(menuData: Omit<Menu, 'id'>): Promise<ApiResponse<Menu>> {
  try {
    // Check permissions
    const canCreate = await hasPermission('cms.menus.write');
    if (!canCreate) {
      return { data: null, error: 'Insufficient permissions to create menu' };
    }

    const { data, error } = await supabase
      .from('menu')
      .insert(menuData)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateMenu(menuId: string, updates: Partial<Menu>): Promise<ApiResponse<Menu>> {
  try {
    const { data, error } = await supabase
      .from('menu')
      .update(updates)
      .eq('id', menuId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteMenu(menuId: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('menu')
      .delete()
      .eq('id', menuId);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    return { data: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getMenuVersions(menuId: string): Promise<ApiResponse<MenuVersion[]>> {
  try {
    const { data, error } = await supabase
      .from('menu_version')
      .select('*')
      .eq('menu_id', menuId)
      .order('version', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createMenuVersion(versionData: Omit<MenuVersion, 'id'>): Promise<ApiResponse<MenuVersion>> {
  try {
    // Check permissions
    const canCreate = await hasPermission('cms.menus.write');
    if (!canCreate) {
      return { data: null, error: 'Insufficient permissions to create menu version' };
    }

    const { data, error } = await supabase
      .from('menu_version')
      .insert(versionData)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateMenuVersion(versionId: string, updates: Partial<MenuVersion>): Promise<ApiResponse<MenuVersion>> {
  try {
    const { data, error } = await supabase
      .from('menu_version')
      .update(updates)
      .eq('id', versionId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function publishMenu(menuId: string, versionNumber: number): Promise<ApiResponse<boolean>> {
  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('menu_publish')
      .upsert({
        menu_id: menuId,
        version: versionNumber,
        published_by: user.id
      });

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    return { data: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function unpublishMenu(menuId: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('menu_publish')
      .delete()
      .eq('menu_id', menuId);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    return { data: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
