import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../../core/types/database.types';
import { BaseService } from '../../../../core/services/BaseService';
import { SiteFiltersSchema, CreateSiteInputSchema, UpdateSiteInputSchema } from '../schemas/site.schemas';
import type { Site, CreateSiteInput, UpdateSiteInput, SiteFilters, SiteListResult } from '../types/site.types';

export class SiteService extends BaseService {
  /**
   * Get all sites with optional filtering and pagination
   */
  public async getSites(
    filters: SiteFilters = {},
    limit = 50,
    offset = 0
  ): Promise<{ success: true; data: SiteListResult } | { success: false; error: string }> {
    try {
      // Validate filters
      const validatedFilters = SiteFiltersSchema.parse(filters);

      let query = this.supabase
        .from('system_sites')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (validatedFilters.search) {
        query = query.or(`name.ilike.%${validatedFilters.search}%,slug.ilike.%${validatedFilters.search}%,description.ilike.%${validatedFilters.search}%`);
      }

      if (validatedFilters.domain) {
        query = query.eq('domain', validatedFilters.domain);
      }

      if (validatedFilters.created_after) {
        query = query.gte('created_at', validatedFilters.created_after);
      }

      if (validatedFilters.created_before) {
        query = query.lte('created_at', validatedFilters.created_before);
      }

      if (validatedFilters.updated_after) {
        query = query.gte('updated_at', validatedFilters.updated_after);
      }

      if (validatedFilters.updated_before) {
        query = query.lte('updated_at', validatedFilters.updated_before);
      }

      const { data, error, count } = await query;

      if (error) {
        return this.handleError(error, 'getSites');
      }

      const result: SiteListResult = {
        sites: data || [],
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      };

      return this.success(result);
    } catch (error) {
      return this.handleError(error, 'getSites');
    }
  }

  /**
   * Get a site by ID
   */
  public async getSiteById(id: string): Promise<{ success: true; data: Site } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('system_sites')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return this.handleError(error, 'getSiteById');
      }

      if (!data) {
        return { success: false, error: 'Site not found' };
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'getSiteById');
    }
  }

  /**
   * Get a site by slug
   */
  public async getSiteBySlug(slug: string): Promise<{ success: true; data: Site } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('system_sites')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        return this.handleError(error, 'getSiteBySlug');
      }

      if (!data) {
        return { success: false, error: 'Site not found' };
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'getSiteBySlug');
    }
  }

  /**
   * Create a new site
   */
  public async createSite(
    input: CreateSiteInput,
    userId: string
  ): Promise<{ success: true; data: Site } | { success: false; error: string }> {
    try {
      // Validate input
      const validatedInput = CreateSiteInputSchema.parse(input);

      // Check if slug already exists
      const { data: existingSite } = await this.supabase
        .from('system_sites')
        .select('id')
        .eq('slug', validatedInput.slug)
        .single();

      if (existingSite) {
        return { success: false, error: 'Site with this slug already exists' };
      }

      const { data, error } = await this.supabase
        .from('system_sites')
        .insert({
          ...validatedInput,
          created_by: userId,
          updated_by: userId,
        })
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'createSite');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'createSite');
    }
  }

  /**
   * Update a site
   */
  public async updateSite(
    id: string,
    input: UpdateSiteInput,
    userId: string
  ): Promise<{ success: true; data: Site } | { success: false; error: string }> {
    try {
      // Validate input
      const validatedInput = UpdateSiteInputSchema.parse(input);

      // If slug is being updated, check if it already exists
      if (validatedInput.slug) {
        const { data: existingSite } = await this.supabase
          .from('system_sites')
          .select('id')
          .eq('slug', validatedInput.slug)
          .neq('id', id)
          .single();

        if (existingSite) {
          return { success: false, error: 'Site with this slug already exists' };
        }
      }

      const { data, error } = await this.supabase
        .from('system_sites')
        .update({
          ...validatedInput,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'updateSite');
      }

      if (!data) {
        return { success: false, error: 'Site not found' };
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'updateSite');
    }
  }

  /**
   * Delete a site
   */
  public async deleteSite(id: string): Promise<{ success: true; data: { id: string } } | { success: false; error: string }> {
    try {
      const { error } = await this.supabase
        .from('system_sites')
        .delete()
        .eq('id', id);

      if (error) {
        return this.handleError(error, 'deleteSite');
      }

      return this.success({ id });
    } catch (error) {
      return this.handleError(error, 'deleteSite');
    }
  }

  /**
   * Check if a slug is available
   */
  public async isSlugAvailable(slug: string, excludeId?: string): Promise<{ success: true; data: { available: boolean } } | { success: false; error: string }> {
    try {
      let query = this.supabase
        .from('system_sites')
        .select('id')
        .eq('slug', slug);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query.single();

      if (error && error.code === 'PGRST116') {
        // No rows found, slug is available
        return this.success({ available: true });
      }

      if (error) {
        return this.handleError(error, 'isSlugAvailable');
      }

      // Slug exists
      return this.success({ available: false });
    } catch (error) {
      return this.handleError(error, 'isSlugAvailable');
    }
  }
}
