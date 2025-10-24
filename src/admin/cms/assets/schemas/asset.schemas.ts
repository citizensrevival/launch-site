import { z } from 'zod';
import type { Asset, AssetInput, AssetUpdate, AssetFilters, AssetSortOptions, AssetListResponse, AssetResponse } from '../types/asset.types';

// ================================================
// Asset Schemas
// ================================================

export const AssetSchema = z.object({
  id: z.string().uuid(),
  kind: z.enum(['image', 'video', 'audio', 'document', 'other']),
  storage_key: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration_ms: z.number().nullable().optional(),
  file_size: z.number().optional(),
  mime_type: z.string().optional(),
  alt_text: z.string().optional(),
  caption: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid(),
});

export const AssetInputSchema = z.object({
  kind: z.enum(['image', 'video', 'audio', 'document', 'other']),
  storage_key: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration_ms: z.number().nullable().optional(),
  file_size: z.number().optional(),
  mime_type: z.string().optional(),
  alt_text: z.string().optional(),
  caption: z.string().optional(),
  published_by: z.string().uuid(),
});

export const AssetUpdateSchema = z.object({
  kind: z.enum(['image', 'video', 'audio', 'document', 'other']).optional(),
  storage_key: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration_ms: z.number().nullable().optional(),
  file_size: z.number().optional(),
  mime_type: z.string().optional(),
  alt_text: z.string().optional(),
  caption: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

export const AssetFiltersSchema = z.object({
  kind: z.enum(['image', 'video', 'audio', 'document', 'other']).optional(),
  published_by: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const AssetSortOptionsSchema = z.object({
  field: z.enum(['created_at', 'updated_at', 'kind', 'storage_key']),
  direction: z.enum(['asc', 'desc']),
});

// ================================================
// Response Schemas
// ================================================

export const AssetListResponseSchema = z.object({
  assets: z.array(AssetSchema),
  totalCount: z.number(),
  hasMore: z.boolean(),
});

export const AssetResponseSchema = AssetSchema;
