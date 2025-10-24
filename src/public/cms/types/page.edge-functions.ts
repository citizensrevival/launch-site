/**
 * Edge function types for CMS Page resolution
 * Extracted from supabase/functions/resolvePage/index.ts
 */

// ================================================
// Request Types
// ================================================

export interface ResolvePageRequest {
  page_id: string;
  site_id?: string;
  locale?: string;
}

// ================================================
// Response Types
// ================================================

export interface ResolvedPage {
  id: string;
  slug: string;
  title: Record<string, string>;
  layout_variant?: string;
  seo: Record<string, any>;
  nav_hints: Record<string, any>;
  slots: ResolvedPageSlot[];
  published_at: string;
  published_by: string;
}

export interface ResolvedPageSlot {
  slot: string;
  order: number;
  block: ResolvedBlock;
}

export interface ResolvedBlock {
  id: string;
  type: string;
  tag?: string;
  layout_variant: string;
  content: Record<string, any>;
  assets: ResolvedBlockAsset[];
  published_at: string;
  published_by: string;
}

export interface ResolvedBlockAsset {
  role: string;
  asset: ResolvedAsset;
}

export interface ResolvedAsset {
  id: string;
  kind: string;
  storage_key: string;
  width?: number;
  height?: number;
  duration_ms?: number;
  variants: ResolvedAssetVariant[];
  published_at: string;
  published_by: string;
}

export interface ResolvedAssetVariant {
  variant_name: string;
  storage_key: string;
  width?: number;
  height?: number;
  file_size?: number;
}

// ================================================
// Error Types
// ================================================

export interface PageResolutionError {
  error: string;
}
