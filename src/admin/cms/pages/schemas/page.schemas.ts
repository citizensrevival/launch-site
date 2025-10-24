import { z } from 'zod';
import type { Page, CreatePageInput, UpdatePageInput, PageFilters, PageSortOptions, PageListResponse, PageResponse } from '../types/page.types';

// ================================================
// Page Slot Block Schema
// ================================================

const PageSlotBlockSchema = z.object({
  id: z.string(),
  block_id: z.string().uuid(),
  block_version: z.number().int().positive(),
  instance_props: z.record(z.unknown()).optional(),
  order: z.number().int().min(0),
});

// ================================================
// Page Slot Schema
// ================================================

const PageSlotSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  blocks: z.array(PageSlotBlockSchema),
});

// ================================================
// Page Schemas
// ================================================

export const PageSchema = z.object({
  id: z.string().uuid(),
  site_id: z.string().uuid().nullable(),
  slug: z.string().min(1).max(255),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  is_system: z.boolean().nullable(),
  system_key: z.string().nullable(),
});

export const PageVersionSchema = z.object({
  id: z.string().uuid(),
  page_id: z.string().uuid().nullable(),
  version: z.number().int().positive(),
  title: z.unknown(),
  layout_variant: z.string().nullable(),
  seo: z.unknown().nullable(),
  nav_hints: z.unknown().nullable(),
  slots: z.unknown().nullable(),
  created_at: z.string().datetime(),
  created_by: z.string().nullable(),
});

export const CreatePageInputSchema = z.object({
  site_id: z.string().uuid().nullable(),
  slug: z.string().min(1).max(255),
});

export const UpdatePageInputSchema = z.object({
  slug: z.string().min(1).max(255).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

export const CreatePageVersionInputSchema = z.object({
  page_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  locale: z.string().min(2).max(10).optional().default('en-US'),
  template: z.string().min(1).max(100),
  seo: z.record(z.any()).optional().default({}),
  nav_hints: z.record(z.any()).optional().default({}),
  slots: z.array(PageSlotSchema).optional().default([]),
  created_by: z.string().uuid(),
});

export const UpdatePageVersionInputSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  template: z.string().min(1).max(100).optional(),
  seo: z.record(z.any()).optional(),
  nav_hints: z.record(z.any()).optional(),
  slots: z.array(PageSlotSchema).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

export const PageFiltersSchema = z.object({
  slug: z.string().optional(),
  created_by: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const PageSortOptionsSchema = z.object({
  field: z.enum(['created_at', 'updated_at', 'slug']),
  direction: z.enum(['asc', 'desc']),
});

// ================================================
// Response Schemas
// ================================================

export const PageListResponseSchema = z.object({
  pages: z.array(PageSchema),
  totalCount: z.number(),
  hasMore: z.boolean(),
});

export const PageResponseSchema = PageSchema;
