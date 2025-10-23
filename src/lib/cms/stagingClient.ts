// Staging System Client Functions
// This file contains all client-side functions for the staging system

import { supabase } from '../../shell/lib/supabase';
import { 
  SiteStaging, 
  StagingDependency, 
  ApiResponse
} from './types';

// Create a new staging session
export async function createStaging(params: {
  siteId: string;
  name: string;
  description?: string;
}): Promise<ApiResponse<SiteStaging>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('site_staging')
      .insert({
        site_id: params.siteId,
        name: params.name,
        description: params.description,
        created_by: user.id,
        staged_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Stage an individual entity
export async function stageEntity(params: {
  entityType: 'page' | 'block' | 'menu' | 'asset';
  entityId: string;
  version: number;
  stagingId: string;
}): Promise<ApiResponse<boolean>> {
  try {
    const { data, error } = await supabase.rpc('stage_entity', {
      entity_type: params.entityType,
      entity_id: params.entityId,
      version_number: params.version,
      staging_id: params.stagingId
    });

    if (error) throw error;

    return { data: data as boolean, error: null };
  } catch (error) {
    return { data: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Stage entire site
export async function stageSite(params: {
  siteId: string;
  name: string;
  description?: string;
}): Promise<ApiResponse<SiteStaging>> {
  try {
    const { data, error } = await supabase.rpc('stage_site', {
      site_id_param: params.siteId,
      staging_name: params.name,
      staging_description: params.description
    });

    if (error) throw error;

    // Get the created staging session
    const { data: staging, error: stagingError } = await supabase
      .from('site_staging')
      .select('*')
      .eq('id', data)
      .single();

    if (stagingError) throw stagingError;

    return { data: staging, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Publish staged content atomically
export async function publishStagedContent(stagingId: string): Promise<ApiResponse<boolean>> {
  try {
    const { data, error } = await supabase.rpc('publish_staged_content', {
      staging_id_param: stagingId
    });

    if (error) throw error;

    return { data: data as boolean, error: null };
  } catch (error) {
    return { data: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Rollback staging
export async function rollbackStaging(stagingId: string): Promise<ApiResponse<boolean>> {
  try {
    const { data, error } = await supabase.rpc('rollback_staging', {
      staging_id_param: stagingId
    });

    if (error) throw error;

    return { data: data as boolean, error: null };
  } catch (error) {
    return { data: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get staging dependencies
export async function getStagingDependencies(stagingId: string): Promise<ApiResponse<StagingDependency[]>> {
  try {
    const { data, error } = await supabase.rpc('get_staging_dependencies', {
      staging_id_param: stagingId
    });

    if (error) throw error;

    return { data: data as StagingDependency[], error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get all staging sessions for a site
export async function getSiteStagingSessions(siteId: string): Promise<ApiResponse<SiteStaging[]>> {
  try {
    const { data, error } = await supabase
      .from('site_staging')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get staging session details
export async function getStagingSession(stagingId: string): Promise<ApiResponse<SiteStaging>> {
  try {
    const { data, error } = await supabase
      .from('site_staging')
      .select('*')
      .eq('id', stagingId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Delete staging session
export async function deleteStagingSession(stagingId: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('site_staging')
      .delete()
      .eq('id', stagingId);

    if (error) throw error;

    return { data: true, error: null };
  } catch (error) {
    return { data: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get staged content preview
export async function getStagedContentPreview(_stagingId: string): Promise<ApiResponse<{
  pages: Array<{ id: string; slug: string; title: Record<string, string> }>;
  blocks: Array<{ id: string; type: string; tag?: string }>;
  menus: Array<{ id: string; handle: string; label: string }>;
  assets: Array<{ id: string; kind: string; storage_key: string }>;
}>> {
  try {
    // Get staged pages
    const { data: stagedPages, error: pagesError } = await supabase
      .from('page_version')
      .select(`
        page_id,
        version,
        title,
        page!inner(slug)
      `)
      .eq('staging_status', 'staged');

    if (pagesError) throw pagesError;

    // Get staged blocks
    const { data: stagedBlocks, error: blocksError } = await supabase
      .from('block_version')
      .select(`
        block_id,
        version,
        block!inner(type, tag)
      `)
      .eq('staging_status', 'staged');

    if (blocksError) throw blocksError;

    // Get staged menus
    const { data: stagedMenus, error: menusError } = await supabase
      .from('menu_version')
      .select(`
        menu_id,
        version,
        menu!inner(handle, label)
      `)
      .eq('staging_status', 'staged');

    if (menusError) throw menusError;

    // Get staged assets
    const { data: stagedAssets, error: assetsError } = await supabase
      .from('asset_version')
      .select(`
        asset_id,
        version,
        asset!inner(kind, storage_key)
      `)
      .eq('staging_status', 'staged');

    if (assetsError) throw assetsError;

    const preview = {
      pages: stagedPages?.map(p => ({
        id: p.page_id,
        slug: 'untitled',
        title: p.title
      })) || [],
      blocks: stagedBlocks?.map(b => ({
        id: b.block_id,
        type: 'text',
        tag: 'div'
      })) || [],
      menus: stagedMenus?.map(m => ({
        id: m.menu_id,
        handle: 'untitled',
        label: 'Untitled'
      })) || [],
      assets: stagedAssets?.map(a => ({
        id: a.asset_id,
        kind: 'image',
        storage_key: 'untitled'
      })) || []
    };

    return { data: preview, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
