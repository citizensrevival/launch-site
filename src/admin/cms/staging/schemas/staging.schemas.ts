import { z } from 'zod';
import type { StagingEnvironment, CreateStagingEnvironmentInput, UpdateStagingEnvironmentInput, StagingFilters, StagingSortOptions, StagingListResponse, StagingResponse } from '../types/staging.types';

// ================================================
// Staging Environment Schemas
// ================================================

export const StagingEnvironmentSchema = z.object({
  id: z.string().uuid(),
  site_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable().optional(),
  url: z.string().url(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid(),
});

export const CreateStagingEnvironmentInputSchema = z.object({
  site_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable().optional(),
  url: z.string().url(),
  created_by: z.string().uuid(),
});

export const UpdateStagingEnvironmentInputSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).nullable().optional(),
  url: z.string().url().optional(),
  is_active: z.boolean().optional(),
  updated_by: z.string().uuid(),
}).refine(data => Object.keys(data).filter(key => key !== 'updated_by').length > 0, {
  message: "At least one field must be provided for update (excluding updated_by)"
});

export const StagingFiltersSchema = z.object({
  site_id: z.string().uuid().optional(),
  environment_id: z.string().uuid().optional(),
  status: z.string().optional(),
  deployment_type: z.string().optional(),
  created_by: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const StagingSortOptionsSchema = z.object({
  field: z.enum(['created_at', 'updated_at', 'name', 'status', 'deployed_at']),
  direction: z.enum(['asc', 'desc']),
});

// ================================================
// Response Schemas
// ================================================

export const StagingListResponseSchema = z.object({
  environments: z.array(StagingEnvironmentSchema),
  deployments: z.array(z.any()), // Simplified for now
  totalCount: z.number(),
  hasMore: z.boolean(),
});

export const StagingResponseSchema = z.object({
  environment: StagingEnvironmentSchema,
  deployment: z.any().optional(), // Simplified for now
});

export const StagingPreviewResponseSchema = z.object({
  preview: z.object({
    id: z.string().uuid(),
    deployment_id: z.string().uuid(),
    url: z.string().url(),
    expires_at: z.string().datetime(),
    created_at: z.string().datetime(),
    created_by: z.string().uuid(),
  }),
  url: z.string().url(),
});
