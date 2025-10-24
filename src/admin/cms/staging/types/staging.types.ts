import { PublishStatus } from '../../../../core/types/cms.types';

export interface StagingEnvironment {
  id: string;
  site_id: string;
  name: string;
  description?: string;
  url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface StagingDeployment {
  id: string;
  environment_id: string;
  site_id: string;
  status: 'pending' | 'building' | 'deployed' | 'failed' | 'cancelled';
  deployment_type: 'full' | 'incremental';
  changes: StagingChange[];
  deployed_at?: string;
  deployed_by: string;
  created_at: string;
  updated_at: string;
}

export interface StagingChange {
  id: string;
  type: 'page' | 'menu' | 'block' | 'asset';
  entity_id: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  changes: Record<string, unknown>;
  created_at: string;
  created_by: string;
}

export interface StagingPreview {
  id: string;
  deployment_id: string;
  url: string;
  expires_at: string;
  created_at: string;
  created_by: string;
}

export interface CreateStagingEnvironmentInput {
  site_id: string;
  name: string;
  description?: string;
  url: string;
  created_by: string;
}

export interface UpdateStagingEnvironmentInput {
  name?: string;
  description?: string;
  url?: string;
  is_active?: boolean;
  updated_by: string;
}

export interface CreateStagingDeploymentInput {
  environment_id: string;
  site_id: string;
  deployment_type: 'full' | 'incremental';
  changes: Omit<StagingChange, 'id' | 'created_at' | 'created_by'>[];
  deployed_by: string;
}

export interface UpdateStagingDeploymentInput {
  status?: 'pending' | 'building' | 'deployed' | 'failed' | 'cancelled';
  deployed_at?: string;
  updated_by: string;
}

export interface StagingFilters {
  site_id?: string;
  environment_id?: string;
  status?: string;
  deployment_type?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface StagingSortOptions {
  field: 'created_at' | 'updated_at' | 'name' | 'status' | 'deployed_at';
  direction: 'asc' | 'desc';
}

export interface StagingListResponse {
  environments: StagingEnvironment[];
  deployments: StagingDeployment[];
  totalCount: number;
  hasMore: boolean;
}

export interface StagingResponse {
  environment: StagingEnvironment;
  deployment?: StagingDeployment;
}

export interface StagingPreviewResponse {
  preview: StagingPreview;
  url: string;
}
