import { z } from 'zod';
import type { Site, CreateSiteInput, UpdateSiteInput, SiteFilters } from '../types/site.types';

// ================================================
// Site Schemas
// ================================================

export const SiteSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  domain: z.string().url(),
  default_locale: z.string().min(2).max(10),
  settings: z.unknown().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateSiteInputSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  domain: z.string().url(),
  default_locale: z.string().min(2).max(10),
  settings: z.unknown().nullable().optional(),
});

export const UpdateSiteInputSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  domain: z.string().url().optional(),
  default_locale: z.string().min(2).max(10).optional(),
  settings: z.unknown().nullable().optional(),
});

export const SiteFiltersSchema = z.object({
  search: z.string().optional(),
  domain: z.string().optional(),
  created_after: z.string().datetime().optional(),
  created_before: z.string().datetime().optional(),
  updated_after: z.string().datetime().optional(),
  updated_before: z.string().datetime().optional(),
});

// ================================================
// Response Schemas
// ================================================

export const SiteListResultSchema = z.object({
  sites: z.array(SiteSchema),
  total: z.number(),
  hasMore: z.boolean(),
});
