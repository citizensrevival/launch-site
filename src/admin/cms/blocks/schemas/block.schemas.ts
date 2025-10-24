import { z } from 'zod';

// ================================================
// Block Schemas
// ================================================

export const BlockSchema = z.object({
  id: z.string().uuid(),
  site_id: z.string().uuid().nullable().optional(),
  type: z.string().min(1),
  tag: z.string().nullable().optional(),
  is_system: z.boolean().nullable().optional(),
  system_key: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  // created_by: z.string().uuid(), // TODO: Implement proper user tracking
  // updated_by: z.string().uuid(), // TODO: Implement proper user tracking
});

export const CreateBlockInputSchema = z.object({
  site_id: z.string().uuid().optional(),
  type: z.string().min(1),
  tag: z.string().optional(),
  is_system: z.boolean().optional().default(false),
  system_key: z.string().optional(),
  // created_by: z.string().uuid(), // TODO: Implement proper user tracking
});

export const UpdateBlockInputSchema = z.object({
  type: z.string().min(1).optional(),
  tag: z.string().optional(),
  system_key: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

export const BlockFiltersSchema = z.object({
  type: z.string().optional(),
  tag: z.string().optional(),
  is_system: z.boolean().optional(),
  system_key: z.string().optional(),
  created_by: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const BlockSortOptionsSchema = z.object({
  field: z.enum(['created_at', 'updated_at', 'type', 'tag', 'system_key']),
  direction: z.enum(['asc', 'desc']),
});

// ================================================
// Response Schemas
// ================================================

export const BlockListResponseSchema = z.object({
  blocks: z.array(BlockSchema),
  totalCount: z.number(),
  hasMore: z.boolean(),
});

export const BlockResponseSchema = BlockSchema;
