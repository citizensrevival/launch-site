import { z } from 'zod';
import type {
  ResolvePageRequest,
  ResolvedPage,
  ResolvedPageSlot,
  ResolvedBlock,
  ResolvedBlockAsset,
  ResolvedAsset,
  ResolvedAssetVariant,
  PageResolutionError,
} from '../types/page.edge-functions';

// ================================================
// Request Schemas
// ================================================

export const ResolvePageRequestSchema = z.object({
  page_id: z.string().uuid(),
  site_id: z.string().uuid().optional(),
  locale: z.string().optional().default('en-US'),
});

// ================================================
// Response Schemas
// ================================================

export const ResolvedAssetVariantSchema = z.object({
  variant_name: z.string(),
  storage_key: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  file_size: z.number().optional(),
});

export const ResolvedAssetSchema = z.object({
  id: z.string(),
  kind: z.string(),
  storage_key: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration_ms: z.number().optional(),
  variants: z.array(ResolvedAssetVariantSchema),
  published_at: z.string(),
  published_by: z.string(),
});

export const ResolvedBlockAssetSchema = z.object({
  role: z.string(),
  asset: ResolvedAssetSchema,
});

export const ResolvedBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  tag: z.string().optional(),
  layout_variant: z.string(),
  content: z.record(z.unknown()),
  assets: z.array(ResolvedBlockAssetSchema),
  published_at: z.string(),
  published_by: z.string(),
});

export const ResolvedPageSlotSchema = z.object({
  slot: z.string(),
  order: z.number(),
  block: ResolvedBlockSchema,
});

export const ResolvedPageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.record(z.string()),
  layout_variant: z.string().optional(),
  seo: z.record(z.unknown()),
  nav_hints: z.record(z.unknown()),
  slots: z.array(ResolvedPageSlotSchema),
  published_at: z.string(),
  published_by: z.string(),
});

// ================================================
// Error Schemas
// ================================================

export const PageResolutionErrorSchema = z.object({
  error: z.string(),
});
