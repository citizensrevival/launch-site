import { LocalizedContent } from '../../../core/types/cms.types';

export interface ResolvedPage {
  id: string;
  slug: string;
  title: string;
  locale: string;
  template: string;
  seo: Record<string, unknown>;
  nav_hints: Record<string, unknown>;
  slots: ResolvedPageSlot[];
  published_at: string;
  published_by: string;
}

export interface ResolvedPageSlot {
  id: string;
  name: string;
  blocks: ResolvedPageBlock[];
}

export interface ResolvedPageBlock {
  id: string;
  block_id: string;
  block_version: number;
  instance_props?: Record<string, unknown>;
  order: number;
  content?: LocalizedContent<Record<string, unknown>>;
  assets?: Array<{ role: string; asset_id: string }>;
}

export interface PageResolutionError {
  error: string;
  details?: string;
}

export interface ResolvePageRequest {
  slug: string;
  site_id?: string;
  locale?: string;
  version?: number;
}
