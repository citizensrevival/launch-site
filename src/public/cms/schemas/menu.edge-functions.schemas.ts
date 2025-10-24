import { z } from 'zod';
import type {
  ResolveMenuRequest,
  ResolvedMenu,
  ResolvedMenuItem,
  MenuResolutionError,
} from '../types/menu.edge-functions';

// ================================================
// Request Schemas
// ================================================

export const ResolveMenuRequestSchema = z.object({
  menu_id: z.string().uuid(),
  site_id: z.string().uuid().optional(),
  locale: z.string().optional().default('en-US'),
});

// ================================================
// Response Schemas
// ================================================

export const ResolvedMenuItemSchema = z.object({
  id: z.string(),
  type: z.enum(['page', 'external', 'anchor', 'separator', 'group']),
  label: z.record(z.string()),
  target: z.string().optional(),
  rel: z.string().optional(),
  children: z.array(z.any()).optional(), // Simplified for now - no recursion
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
  style_hints: z.record(z.any()).optional(),
});

export const ResolvedMenuSchema = z.object({
  id: z.string(),
  handle: z.string(),
  label: z.string(),
  items: z.array(ResolvedMenuItemSchema),
  published_at: z.string(),
  published_by: z.string(),
});

// ================================================
// Error Schemas
// ================================================

export const MenuResolutionErrorSchema = z.object({
  error: z.string(),
});
