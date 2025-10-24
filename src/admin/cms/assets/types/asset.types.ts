/**
 * CMS Assets types
 * Based on database schema for asset, asset_version, asset_variant, asset_publish tables
 */

export interface Asset {
  id: string;
  kind: string;
  storage_key: string;
  width?: number | null;
  height?: number | null;
  duration_ms?: number | null;
  site_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetVersion {
  id: string;
  asset_id: string;
  version: number;
  meta: Record<string, any>;
  created_at: string;
  created_by: string;
}

export interface AssetVariant {
  id: string;
  asset_id: string;
  variant_name: string;
  storage_key: string;
  width?: number;
  height?: number;
  file_size?: number;
  created_at: string;
  created_by: string;
}

export interface AssetPublish {
  id: string;
  asset_id: string;
  version: number;
  published_at: string;
  published_by: string;
}

export interface AssetInput {
  kind: 'image' | 'video' | 'audio' | 'document' | 'other';
  storage_key: string;
  width?: number;
  height?: number;
  duration_ms?: number;
  file_size?: number;
  mime_type?: string;
  alt_text?: string;
  caption?: string;
  published_by: string;
}

export interface AssetUpdate {
  kind?: 'image' | 'video' | 'audio' | 'document' | 'other';
  storage_key?: string;
  width?: number;
  height?: number;
  duration_ms?: number;
  file_size?: number;
  mime_type?: string;
  alt_text?: string;
  caption?: string;
}

export interface AssetFilters {
  kind?: 'image' | 'video' | 'audio' | 'document' | 'other';
  published_by?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface AssetSortOptions {
  field: 'created_at' | 'updated_at' | 'kind' | 'storage_key';
  direction: 'asc' | 'desc';
}

export interface AssetListResponse {
  assets: Asset[];
  totalCount: number;
  hasMore: boolean;
}

export interface AssetResponse extends Asset {}

export interface AssetUsage {
  asset_id: string;
  block_id?: string;
  page_id?: string;
  role: string;
  usage_count: number;
}

export interface CropParams {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResizeParams {
  width: number;
  height: number;
  maintainAspectRatio?: boolean;
}

export interface RotateParams {
  angle: number;
}

export interface AssetEditOperation {
  type: 'crop' | 'resize' | 'rotate' | 'filter';
  params: Record<string, any>;
  operation?: {
    type: 'crop' | 'resize' | 'rotate' | 'filter';
    params: Record<string, any>;
  };
}
