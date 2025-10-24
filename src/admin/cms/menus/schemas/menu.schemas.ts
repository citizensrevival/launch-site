import { z } from 'zod';
import type { Menu, CreateMenuInput, UpdateMenuInput, MenuFilters, MenuSortOptions, MenuListResponse, MenuResponse } from '../types/menu.types';

// ================================================
// Menu Item Schema (simplified to avoid recursion issues)
// ================================================

const MenuItemSchema = z.object({
  id: z.string(),
  type: z.enum(['page', 'external', 'anchor', 'separator', 'group']),
  label: z.record(z.string()),
  target: z.string().optional(),
  rel: z.string().optional(),
  children: z.array(z.lazy(() => MenuItemSchema)).optional(), // Recursive schema
  visibility: z.object({
    device: z.array(z.enum(['mobile', 'desktop'])).optional(),
    audience: z.array(z.enum(['anon', 'user', 'admin'])).optional(),
    featureFlags: z.array(z.string()).optional(),
    schedule: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
  }).optional(),
  badge: z.object({
    text: z.record(z.string()),
    color: z.string(),
  }).optional(),
  style_hints: z.record(z.unknown()).optional(),
});

// ================================================
// Menu Schemas
// ================================================

export const MenuSchema = z.object({
  id: z.string().uuid(),
  site_id: z.string().uuid().nullable(),
  handle: z.string().min(1).max(100),
  label: z.string().min(1).max(255),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  is_system: z.boolean().nullable(),
  system_key: z.string().nullable(),
});

export const MenuVersionSchema = z.object({
  id: z.string().uuid(),
  menu_id: z.string().uuid().nullable(),
  version: z.number().int().positive(),
  items: z.unknown().nullable(),
  created_at: z.string().datetime(),
  created_by: z.string().nullable(),
});

export const CreateMenuInputSchema = z.object({
  site_id: z.string().uuid().nullable(),
  handle: z.string().min(1).max(100),
  label: z.string().min(1).max(255),
});

export const UpdateMenuInputSchema = z.object({
  handle: z.string().min(1).max(100).optional(),
  label: z.string().min(1).max(255).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

export const CreateMenuVersionInputSchema = z.object({
  menu_id: z.string().uuid().nullable(),
  items: z.unknown().nullable(),
  created_by: z.string().nullable(),
});

export const UpdateMenuVersionInputSchema = z.object({
  items: z.unknown().nullable().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

export const MenuFiltersSchema = z.object({
  handle: z.string().optional(),
  label: z.string().optional(),
  created_by: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const MenuSortOptionsSchema = z.object({
  field: z.enum(['created_at', 'updated_at', 'handle', 'label']),
  direction: z.enum(['asc', 'desc']),
});

// ================================================
// Response Schemas
// ================================================

export const MenuListResponseSchema = z.object({
  menus: z.array(MenuSchema),
  totalCount: z.number(),
  hasMore: z.boolean(),
});

export const MenuResponseSchema = MenuSchema;
