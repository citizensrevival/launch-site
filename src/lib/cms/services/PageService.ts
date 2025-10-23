// Example of how to refactor client functions to be more testable
import type { SupabaseClient } from '../interfaces/SupabaseClient';
import type { Page, PageVersion, ApiResponse } from '../types';
import { zPage, zPageVersion } from '../schemas';

// Service class that can be easily tested with dependency injection
export class PageService {
  constructor(private client: SupabaseClient) {}

  async createPage(pageData: Omit<Page, 'id'>): Promise<ApiResponse<Page>> {
    try {
      const { data: { user } } = await this.client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Clean up undefined values - PostgreSQL doesn't like undefined
      const cleanedData: any = { ...pageData };
      if (cleanedData.system_key === undefined) {
        cleanedData.system_key = null;
      }

      const { data, error } = await this.client
        .from('page')
        .insert(cleanedData)
        .select()
        .single();

      if (error) throw error;
      const page = zPage.parse(data);
      return { data: page, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async createPageVersion(versionData: Omit<PageVersion, 'id' | 'created_at' | 'created_by'>): Promise<ApiResponse<PageVersion>> {
    try {
      const { data: { user } } = await this.client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Filter out null values for optional fields
      const insertData: any = {
        ...versionData,
        created_by: user.id,
        updated_by: null,
        updated_at: null
      };
      
      // Remove null values for optional fields that might cause issues
      if (insertData.layout_variant === null) {
        delete insertData.layout_variant;
      }
      if (insertData.updated_by === null) {
        delete insertData.updated_by;
      }
      if (insertData.updated_at === null) {
        delete insertData.updated_at;
      }

      const { data, error } = await this.client
        .from('page_version')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      const pageVersion = zPageVersion.parse(data);
      return { data: pageVersion, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getPages(siteId: string): Promise<ApiResponse<Page[]>> {
    try {
      const { data, error } = await this.client
        .from('page')
        .select('*')
        .eq('site_id', siteId);

      if (error) throw error;
      const pages = data.map((page: any) => zPage.parse(page));
      return { data: pages, error: null };
    } catch (error) {
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Factory function to create service with real client
export function createPageService(): PageService {
  // This would import the actual Supabase client
  // For now, this is a placeholder
  throw new Error('Not implemented - use actual Supabase client');
}

// Factory function to create service with mock client for testing
export function createMockPageService(mockClient: SupabaseClient): PageService {
  return new PageService(mockClient);
}
