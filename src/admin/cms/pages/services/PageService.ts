import { SupabaseClient } from '@supabase/supabase-js';
import { BaseService } from '../../../../core/services/BaseService';
import type { Database } from '../../../../core/types/database.types';
import type {
  Page,
  CreatePageInput,
  UpdatePageInput,
  CreatePageVersionInput,
  UpdatePageVersionInput,
  PageFilters,
  PageSortOptions,
  PageListResponse,
  PageResponse,
} from '../types/page.types';

export class PageService extends BaseService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase);
  }

  async listPages(
    filters?: PageFilters,
    sort?: PageSortOptions,
    page = 1,
    limit = 20
  ): Promise<{ success: true; data: PageListResponse } | { success: false; error: string }> {
    try {
      let query = this.supabase
        .from('cms_pages')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters) {
        if (filters.slug) {
          query = query.eq('slug', filters.slug);
        }
        if (filters.created_by) {
          query = query.eq('created_by', filters.created_by);
        }
        if (filters.date_from) {
          query = query.gte('created_at', filters.date_from);
        }
        if (filters.date_to) {
          query = query.lte('created_at', filters.date_to);
        }
        if (filters.search) {
          query = query.or(`slug.ilike.%${filters.search}%`);
        }
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return this.handleError(error, 'listPages');
      }

      return this.success({
        pages: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > page * limit,
      });
    } catch (error) {
      return this.handleError(error, 'listPages');
    }
  }

  async getPage(id: string): Promise<{ success: true; data: Page } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('cms_pages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return this.handleError(error, 'getPage');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'getPage');
    }
  }

  async createPage(input: CreatePageInput): Promise<{ success: true; data: Page } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('cms_pages')
        .insert(input)
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'createPage');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'createPage');
    }
  }

  async updatePage(id: string, updates: UpdatePageInput): Promise<{ success: true; data: Page } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('cms_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'updatePage');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'updatePage');
    }
  }

  async deletePage(id: string): Promise<{ success: true } | { success: false; error: string }> {
    try {
      const { error } = await this.supabase
        .from('cms_pages')
        .delete()
        .eq('id', id);

      if (error) {
        return this.handleError(error, 'deletePage');
      }

      return this.success({});
    } catch (error) {
      return this.handleError(error, 'deletePage');
    }
  }

  async listPageVersions(pageId: string): Promise<{ success: true; data: any[] } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('cms_page_versions')
        .select('*')
        .eq('page_id', pageId)
        .order('version', { ascending: false });

      if (error) {
        return this.handleError(error, 'listPageVersions');
      }

      return this.success(data || []);
    } catch (error) {
      return this.handleError(error, 'listPageVersions');
    }
  }

  async getPageVersion(pageId: string, version: number): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('page_versions')
        .select('*')
        .eq('page_id', pageId)
        .eq('version', version)
        .single();

      if (error) {
        return this.handleError(error, 'getPageVersion');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'getPageVersion');
    }
  }

  async createPageVersion(input: CreatePageVersionInput): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('cms_page_versions')
        .insert(input)
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'createPageVersion');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'createPageVersion');
    }
  }

  async updatePageVersion(pageId: string, version: number, updates: UpdatePageVersionInput): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('cms_page_versions')
        .update(updates)
        .eq('page_id', pageId)
        .eq('version', version)
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'updatePageVersion');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'updatePageVersion');
    }
  }

  async publishPage(pageId: string, locale: string, version: number, publishedBy: string): Promise<{ success: true } | { success: false; error: string }> {
    try {
      const { error } = await this.supabase
        .from('cms_page_publishes')
        .insert({
          page_id: pageId,
          locale,
          version,
          published_by: publishedBy,
        });

      if (error) {
        return this.handleError(error, 'publishPage');
      }

      return this.success({});
    } catch (error) {
      return this.handleError(error, 'publishPage');
    }
  }
}
