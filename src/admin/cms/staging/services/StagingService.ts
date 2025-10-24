import { SupabaseClient } from '@supabase/supabase-js';
import { BaseService } from '../../../../core/services/BaseService';
import type { Database } from '../../../../core/types/database.types';
import type {
  StagingEnvironment,
  CreateStagingEnvironmentInput,
  UpdateStagingEnvironmentInput,
  StagingFilters,
  StagingSortOptions,
  StagingListResponse,
  StagingResponse,
  StagingPreviewResponse,
} from '../types/staging.types';

export class StagingService extends BaseService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase);
  }

  async listEnvironments(
    filters?: StagingFilters,
    sort?: StagingSortOptions,
    page = 1,
    limit = 20
  ): Promise<{ success: true; data: StagingListResponse } | { success: false; error: string }> {
    try {
      let query = this.supabase
        .from('site_staging')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters) {
        if (filters.site_id) {
          query = query.eq('site_id', filters.site_id);
        }
        if (filters.environment_id) {
          query = query.eq('id', filters.environment_id);
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
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
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
        return this.handleError(error, 'listEnvironments');
      }

      return this.success({
        environments: data || [],
        deployments: [], // Simplified for now
        totalCount: count || 0,
        hasMore: (count || 0) > page * limit,
      });
    } catch (error) {
      return this.handleError(error, 'listEnvironments');
    }
  }

  async getEnvironment(id: string): Promise<{ success: true; data: StagingEnvironment } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('site_staging')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return this.handleError(error, 'getEnvironment');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'getEnvironment');
    }
  }

  async createEnvironment(input: CreateStagingEnvironmentInput): Promise<{ success: true; data: StagingEnvironment } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('site_staging')
        .insert(input)
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'createEnvironment');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'createEnvironment');
    }
  }

  async updateEnvironment(id: string, updates: UpdateStagingEnvironmentInput): Promise<{ success: true; data: StagingEnvironment } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('site_staging')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'updateEnvironment');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'updateEnvironment');
    }
  }

  async deleteEnvironment(id: string): Promise<{ success: true } | { success: false; error: string }> {
    try {
      const { error } = await this.supabase
        .from('site_staging')
        .delete()
        .eq('id', id);

      if (error) {
        return this.handleError(error, 'deleteEnvironment');
      }

      return this.success({});
    } catch (error) {
      return this.handleError(error, 'deleteEnvironment');
    }
  }

  async createDeployment(environmentId: string, changes: any[], deployedBy: string): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('site_staging')
        .insert({
          site_id: '', // This would need to be determined from the environment
          staging_name: 'deployment',
          staging_description: 'Staging deployment',
          created_by: deployedBy,
        })
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'createDeployment');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'createDeployment');
    }
  }

  async getDeployment(id: string): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('site_staging')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return this.handleError(error, 'getDeployment');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'getDeployment');
    }
  }

  async updateDeploymentStatus(id: string, status: string, updatedBy: string): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('site_staging')
        .update({
          staging_name: status === 'deployed' ? 'deployed' : 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'updateDeploymentStatus');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'updateDeploymentStatus');
    }
  }

  async createPreview(deploymentId: string, createdBy: string): Promise<{ success: true; data: StagingPreviewResponse } | { success: false; error: string }> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

      const { data, error } = await this.supabase
        .from('site_staging')
        .insert({
          site_id: deploymentId,
          staging_name: 'preview',
          staging_description: `Preview for deployment ${deploymentId}`,
          created_by: createdBy,
        })
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'createPreview');
      }

      return this.success({
        preview: data,
        url: data.url,
      });
    } catch (error) {
      return this.handleError(error, 'createPreview');
    }
  }

  async getPreview(id: string): Promise<{ success: true; data: StagingPreviewResponse } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('site_staging')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return this.handleError(error, 'getPreview');
      }

      return this.success({
        preview: data,
        url: data.url,
      });
    } catch (error) {
      return this.handleError(error, 'getPreview');
    }
  }

  async deletePreview(id: string): Promise<{ success: true } | { success: false; error: string }> {
    try {
      const { error } = await this.supabase
        .from('site_staging')
        .delete()
        .eq('id', id);

      if (error) {
        return this.handleError(error, 'deletePreview');
      }

      return this.success({});
    } catch (error) {
      return this.handleError(error, 'deletePreview');
    }
  }

  public async getStagedContentPreview(_stagingId: string): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
      // TODO: Implement staged content preview logic
      const previewData = {
        id: _stagingId,
        url: `https://staging-preview-${_stagingId}.example.com`,
        content: {},
        changes: [],
        created_at: new Date().toISOString(),
      };

      return this.success(previewData);
    } catch (error) {
      return this.handleError(error, 'getStagedContentPreview');
    }
  }
}
