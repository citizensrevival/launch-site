/**
 * CMS Pages types
 * Based on database schema for page, page_version, page_publish tables
 */

import type { Json } from '../../../../core/types/database.types';

export interface Page {
  id: string;
  site_id: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
  is_system: boolean | null;
  system_key: string | null;
}

export interface PageVersion {
  id: string;
  page_id: string | null;
  version: number;
  title: Json;
  layout_variant: string | null;
  seo: Json | null;
  nav_hints: Json | null;
  slots: Json | null;
  created_at: string;
  created_by: string | null;
}

export interface PageSlot {
  id: string;
  name: string;
  blocks: PageSlotBlock[];
}

export interface PageSlotBlock {
  id: string;
  block_id: string;
  block_version: number;
  instance_props?: Record<string, any>;
  order: number;
}

export interface PagePublish {
  page_id: string;
  locale: string;
  version: number;
  published_at: string;
  published_by: string;
}

export interface CreatePageInput {
  site_id: string;
  slug: string;
  created_by: string;
}

export interface UpdatePageInput {
  slug?: string;
}

export interface CreatePageVersionInput {
  page_id: string;
  title: string;
  locale?: string;
  template: string;
  seo?: Record<string, any>;
  nav_hints?: Record<string, any>;
  slots?: PageSlot[];
  created_by: string;
}

export interface UpdatePageVersionInput {
  title?: string;
  template?: string;
  seo?: Record<string, any>;
  nav_hints?: Record<string, any>;
  slots?: PageSlot[];
}

export interface PageFilters {
  slug?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface PageSortOptions {
  field: 'created_at' | 'updated_at' | 'slug';
  direction: 'asc' | 'desc';
}

export interface PageListResponse {
  pages: Page[];
  totalCount: number;
  hasMore: boolean;
}

export interface PageResponse extends Page {}

export interface PageUsage {
  page_id: string;
  usage_count: number;
}
