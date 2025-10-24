import { SupabaseClient } from '@supabase/supabase-js';
import { BaseService } from '../../../core/services/BaseService';
import type { Database } from '../../../core/types/database.types';
import type {
  ResolvedPage,
  ResolvedPageSlot,
  ResolvedPageBlock,
  PageResolutionError,
  ResolvePageRequest,
} from '../types/page.types';

export class PageResolver extends BaseService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase);
  }

  async resolvePage(request: ResolvePageRequest): Promise<{ success: true; data: ResolvedPage } | { success: false; error: string }> {
    try {
      const { slug, site_id, locale = 'en-US', version } = request;

      // Build the query to get the published page
      let query = this.supabase
        .from('cms_page_publishes')
        .select(`
          page_id,
          locale,
          version,
          published_at,
          published_by,
          pages!inner(
            id,
            slug,
            site_id
          ),
          page_versions!inner(
            id,
            title,
            template,
            seo,
            nav_hints,
            slots
          )
        `)
        .eq('pages.slug', slug)
        .eq('locale', locale);

      if (site_id) {
        query = query.eq('pages.site_id', site_id);
      }

      if (version) {
        query = query.eq('version', version);
      }

      const { data, error } = await query.single();

      if (error) {
        return this.handleError(error, 'resolvePage');
      }

      if (!data) {
        return this.handleError(new Error('Page not found'), 'resolvePage');
      }

      // Resolve the page with all its content
      const resolvedPage = await this.buildResolvedPage(data);

      return this.success(resolvedPage);
    } catch (error) {
      return this.handleError(error, 'resolvePage');
    }
  }

  async resolvePageBySlug(slug: string, siteId?: string, locale = 'en-US'): Promise<{ success: true; data: ResolvedPage } | { success: false; error: string }> {
    return this.resolvePage({ slug, site_id: siteId, locale });
  }

  async resolveSystemPage(systemKey: string, siteId?: string, locale = 'en-US'): Promise<{ success: true; data: ResolvedPage } | { success: false; error: string }> {
    try {
      // System pages are special pages that are identified by a system key
      // This would typically be stored in a system_pages table or similar
      const { data, error } = await this.supabase
        .from('cms_pages')
        .select(`
          page_id,
          system_key,
          pages!inner(
            id,
            slug,
            site_id
          )
        `)
        .eq('system_key', systemKey)
        .eq('locale', locale);

      if (siteId) {
        // Add site filter if provided
        // This would need to be added to the query
      }

      if (error) {
        return this.handleError(error, 'resolveSystemPage');
      }

      if (!data) {
        return this.handleError(new Error('System page not found'), 'resolveSystemPage');
      }

      // Resolve the system page
      const resolvedPage = await this.resolvePage({
        slug: data.pages.slug,
        site_id: data.pages.site_id,
        locale,
      });

      return resolvedPage;
    } catch (error) {
      return this.handleError(error, 'resolveSystemPage');
    }
  }

  private async buildResolvedPage(pageData: any): Promise<ResolvedPage> {
    // This method would build the complete resolved page structure
    // including resolving all blocks and their content
    
    const resolvedSlots: ResolvedPageSlot[] = [];
    
    for (const slot of pageData.page_versions.slots || []) {
      const resolvedBlocks: ResolvedPageBlock[] = [];
      
      for (const block of slot.blocks || []) {
        // Resolve block content and assets
        const blockContent = await this.resolveBlockContent(block.block_id, block.block_version);
        
        resolvedBlocks.push({
          id: block.id,
          block_id: block.block_id,
          block_version: block.block_version,
          instance_props: block.instance_props,
          order: block.order,
          content: blockContent.content,
          assets: blockContent.assets,
        });
      }
      
      resolvedSlots.push({
        id: slot.id,
        name: slot.name,
        blocks: resolvedBlocks,
      });
    }

    return {
      id: pageData.pages.id,
      slug: pageData.pages.slug,
      title: pageData.page_versions.title,
      locale: pageData.locale,
      template: pageData.page_versions.template,
      seo: pageData.page_versions.seo,
      nav_hints: pageData.page_versions.nav_hints,
      slots: resolvedSlots,
      published_at: pageData.published_at,
      published_by: pageData.published_by,
    };
  }

  private async resolveBlockContent(blockId: string, version: number): Promise<{ content?: any; assets?: any[] }> {
    try {
      // Get block content and assets
      const { data, error } = await this.supabase
        .from('cms_block_versions')
        .select('content, assets')
        .eq('block_id', blockId)
        .eq('version', version)
        .single();

      if (error) {
        console.warn(`Failed to resolve block content for block ${blockId} version ${version}:`, error);
        return {};
      }

      return {
        content: data?.content,
        assets: data?.assets,
      };
    } catch (error) {
      console.warn(`Error resolving block content for block ${blockId} version ${version}:`, error);
      return {};
    }
  }
}
