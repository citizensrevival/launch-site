import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../../core/types/database.types';
import { BaseService } from '../../../../core/services/BaseService';
import { MenuFiltersSchema, CreateMenuInputSchema, UpdateMenuInputSchema, CreateMenuVersionInputSchema, UpdateMenuVersionInputSchema } from '../schemas/menu.schemas';
import type { Menu, CreateMenuInput, UpdateMenuInput, MenuFilters, MenuSortOptions, MenuListResponse, MenuResponse, MenuVersion, CreateMenuVersionInput, UpdateMenuVersionInput } from '../types/menu.types';

export class MenuService extends BaseService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase);
  }

  /**
   * List menus with optional filtering, sorting, and pagination.
   */
  public async listMenus(
    filters: MenuFilters = {},
    sortBy: MenuSortOptions = { field: 'created_at', direction: 'desc' },
    limit: number = 50,
    offset: number = 0
  ): Promise<{ success: true; data: MenuListResponse } | { success: false; error: string }> {
    try {
      const validatedFilters = MenuFiltersSchema.parse(filters);

      let query = this.supabase
        .from('cms_menus')
        .select('*', { count: 'exact' });

      // Apply filters
      if (validatedFilters.handle) {
        query = query.eq('handle', validatedFilters.handle);
      }
      if (validatedFilters.label) {
        query = query.eq('label', validatedFilters.label);
      }
      if (validatedFilters.created_by) {
        query = query.eq('created_by', validatedFilters.created_by);
      }
      if (validatedFilters.date_from) {
        query = query.gte('created_at', validatedFilters.date_from);
      }
      if (validatedFilters.date_to) {
        query = query.lte('created_at', validatedFilters.date_to);
      }
      if (validatedFilters.search) {
        query = query.or(`handle.ilike.%${validatedFilters.search}%,label.ilike.%${validatedFilters.search}%`);
      }

      // Apply sorting
      query = query.order(sortBy.field, { ascending: sortBy.direction === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return this.handleError(error, 'listMenus');
      }

      const result: MenuListResponse = {
        menus: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > offset + limit,
      };

      return this.success(result);
    } catch (error) {
      return this.handleError(error, 'listMenus');
    }
  }

  /**
   * Get a single menu by ID.
   */
  public async getMenu(id: string): Promise<{ success: true; data: MenuResponse } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('cms_menus')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return this.handleError(error, 'getMenu');
      }

      if (!data) {
        return { success: false, error: 'Menu not found' };
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'getMenu');
    }
  }

  /**
   * Create a new menu.
   */
  public async createMenu(input: CreateMenuInput): Promise<{ success: true; data: MenuResponse } | { success: false; error: string }> {
    try {
      const validatedInput = CreateMenuInputSchema.parse(input);

      const { data, error } = await this.supabase
        .from('cms_menus')
        .insert({
          ...validatedInput,
          updated_by: validatedInput.created_by, // Assuming created_by is also the updater
        })
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'createMenu');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'createMenu');
    }
  }

  /**
   * Update an existing menu.
   */
  public async updateMenu(id: string, updates: UpdateMenuInput): Promise<{ success: true; data: MenuResponse } | { success: false; error: string }> {
    try {
      const validatedUpdates = UpdateMenuInputSchema.parse(updates);

      const { data, error } = await this.supabase
        .from('cms_menus')
        .update({
          ...validatedUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'updateMenu');
      }

      if (!data) {
        return { success: false, error: 'Menu not found' };
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'updateMenu');
    }
  }

  /**
   * Delete a menu.
   */
  public async deleteMenu(id: string): Promise<{ success: true; data: { id: string } } | { success: false; error: string }> {
    try {
      const { error } = await this.supabase
        .from('cms_menus')
        .delete()
        .eq('id', id);

      if (error) {
        return this.handleError(error, 'deleteMenu');
      }

      return this.success({ id });
    } catch (error) {
      return this.handleError(error, 'deleteMenu');
    }
  }

  /**
   * Get menu versions for a menu.
   */
  public async getMenuVersions(menuId: string): Promise<{ success: true; data: MenuVersion[] } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('cms_menu_versions')
        .select('*')
        .eq('menu_id', menuId)
        .order('version', { ascending: false });

      if (error) {
        return this.handleError(error, 'getMenuVersions');
      }

      return this.success(data || []);
    } catch (error) {
      return this.handleError(error, 'getMenuVersions');
    }
  }

  /**
   * Create a new menu version.
   */
  public async createMenuVersion(input: CreateMenuVersionInput): Promise<{ success: true; data: MenuVersion } | { success: false; error: string }> {
    try {
      const validatedInput = CreateMenuVersionInputSchema.parse(input);

      // Get the next version number
      const { data: versions, error: versionError } = await this.supabase
        .from('cms_menu_versions')
        .select('version')
        .eq('menu_id', validatedInput.menu_id)
        .order('version', { ascending: false })
        .limit(1);

      if (versionError) {
        return this.handleError(versionError, 'createMenuVersion');
      }

      const nextVersion = versions && versions.length > 0 ? versions[0].version + 1 : 1;

      const { data, error } = await this.supabase
        .from('cms_menu_versions')
        .insert({
          ...validatedInput,
          version: nextVersion,
          updated_by: validatedInput.created_by,
        })
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'createMenuVersion');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'createMenuVersion');
    }
  }

  /**
   * Update a menu version.
   */
  public async updateMenuVersion(menuId: string, version: number, updates: UpdateMenuVersionInput): Promise<{ success: true; data: MenuVersion } | { success: false; error: string }> {
    try {
      const validatedUpdates = UpdateMenuVersionInputSchema.parse(updates);

      const { data, error } = await this.supabase
        .from('cms_menu_versions')
        .update({
          ...validatedUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('menu_id', menuId)
        .eq('version', version)
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'updateMenuVersion');
      }

      if (!data) {
        return { success: false, error: 'Menu version not found' };
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'updateMenuVersion');
    }
  }

  /**
   * Publish a menu version.
   */
  public async publishMenu(menuId: string, version: number, publishedBy: string): Promise<{ success: true; data: { menu_id: string; version: number } } | { success: false; error: string }> {
    try {
      // Update the menu_version status to published
      const { error: versionError } = await this.supabase
        .from('cms_menu_versions')
        .update({ status: 'published' })
        .eq('menu_id', menuId)
        .eq('version', version);

      if (versionError) {
        return this.handleError(versionError, 'publishMenu');
      }

      // Insert or update the menu_publish record
      const { error: publishError } = await this.supabase
        .from('cms_menu_publishes')
        .upsert({
          menu_id: menuId,
          version: version,
          published_by: publishedBy,
          published_at: new Date().toISOString(),
        });

      if (publishError) {
        return this.handleError(publishError, 'publishMenu');
      }

      return this.success({ menu_id: menuId, version });
    } catch (error) {
      return this.handleError(error, 'publishMenu');
    }
  }

  /**
   * Get the published version of a menu.
   */
  public async getPublishedMenu(menuId: string): Promise<{ success: true; data: MenuVersion } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('cms_menu_publishes')
        .select(`
          version,
          menu_version!inner(*)
        `)
        .eq('menu_id', menuId)
        .single();

      if (error) {
        return this.handleError(error, 'getPublishedMenu');
      }

      if (!data) {
        return { success: false, error: 'No published version found' };
      }

      return this.success(data.menu_version);
    } catch (error) {
      return this.handleError(error, 'getPublishedMenu');
    }
  }
}
