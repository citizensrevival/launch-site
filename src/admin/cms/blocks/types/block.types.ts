/**
 * CMS Blocks types
 * Based on database schema for block, block_version, block_publish tables
 */

export interface Block {
  id: string;
  site_id?: string | null;
  type: string;
  tag?: string | null;
  is_system?: boolean | null;
  system_key?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlockVersion {
  id: string;
  block_id: string;
  version: number;
  layout_variant: string;
  content: Record<string, any>;
  assets: Array<{ role: string; asset_id: string }>;
  status: 'draft' | 'published' | 'archived' | 'staged';
  created_at: string;
  created_by: string;
  updated_by?: string | null;
  updated_at?: string | null;
}

export interface BlockPublish {
  block_id: string;
  version: number;
  published_at: string;
  published_by: string;
}

export interface CreateBlockInput {
  site_id?: string;
  type: string;
  tag?: string;
  is_system?: boolean;
  system_key?: string;
  // created_by: string; // TODO: Implement proper user tracking
}

export interface UpdateBlockInput {
  type?: string;
  tag?: string;
  system_key?: string;
}

export interface CreateBlockVersionInput {
  block_id: string;
  layout_variant: string;
  content: Record<string, any>;
  assets?: Array<{ role: string; asset_id: string }>;
  // created_by: string; // TODO: Implement proper user tracking
}

export interface UpdateBlockVersionInput {
  layout_variant?: string;
  content?: Record<string, any>;
  assets?: Array<{ role: string; asset_id: string }>;
}

export interface BlockFilters {
  type?: string;
  tag?: string;
  is_system?: boolean;
  system_key?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface BlockSortOptions {
  field: 'created_at' | 'updated_at' | 'type' | 'tag' | 'system_key';
  direction: 'asc' | 'desc';
}

export interface BlockListResponse {
  blocks: Block[];
  totalCount: number;
  hasMore: boolean;
}

export interface BlockResponse extends Block {}

export interface BlockUsage {
  block_id: string;
  page_id?: string;
  usage_count: number;
}

// Additional types for components
export interface LocalizedContent<T = Record<string, unknown>> {
  [locale: string]: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  total_pages: number;
  current_page: number;
}

export interface ContentSort {
  field: string;
  direction: 'asc' | 'desc';
}
