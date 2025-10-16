// CMS Zod Validation Schemas
// This file contains Zod schemas for validating CMS data

import { z } from 'zod';

// Helper for i18n content validation
export const zLocalizedContent = <T extends z.ZodTypeAny>(contentSchema: T) =>
  z.record(z.string(), contentSchema);

// Permission validation
export const zPermission = z.enum([
  'cms.pages.read', 'cms.pages.write', 'cms.pages.publish',
  'cms.blocks.read', 'cms.blocks.write', 'cms.blocks.publish',
  'cms.menus.read', 'cms.menus.write', 'cms.menus.publish',
  'cms.assets.read', 'cms.assets.write', 'cms.assets.publish',
  'analytics.read',
  'leads.read', 'leads.write',
  'users.manage',
  'system.admin'
]);

export const zUserPermissions = z.object({
  userId: z.string().uuid(),
  permissions: z.array(zPermission),
  grantedAt: z.string(),
  grantedBy: z.string().uuid().optional()
});

// Visibility validation
export const zVisibility = z.object({
  device: z.array(z.enum(['mobile', 'desktop'])).optional(),
  audience: z.array(z.enum(['anon', 'user', 'admin'])).optional(),
  featureFlags: z.array(z.string()).optional(),
  schedule: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional()
});

// Asset schemas
export const zAssetMeta = z.object({
  alt: zLocalizedContent(z.string()).optional(),
  caption: zLocalizedContent(z.string()).optional(),
  license: z.string().optional(),
  tags: z.array(z.string()).optional(),
  focal_point: z.object({
    x: z.number(),
    y: z.number()
  }).optional()
});

export const zResolvedAsset = z.object({
  id: z.string().uuid(),
  kind: z.enum(['image', 'video', 'file']),
  url: z.string().url(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  durationMs: z.number().int().optional(),
  meta: zAssetMeta
});

export const zAssetVariant = z.object({
  id: z.string().uuid(),
  asset_id: z.string().uuid(),
  variant_type: z.enum(['thumbnail', 'small', 'medium', 'large', 'original']),
  storage_key: z.string(),
  width: z.number().int(),
  height: z.number().int(),
  file_size: z.number().int(),
  url: z.string().url()
});

export const zAssetEditOperation = z.object({
  operation: z.enum(['crop', 'resize', 'rotate']),
  params: z.union([
    z.object({
      operation: z.literal('crop'),
      params: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number()
      })
    }),
    z.object({
      operation: z.literal('resize'),
      params: z.object({
        width: z.number(),
        height: z.number(),
        maintainAspectRatio: z.boolean()
      })
    }),
    z.object({
      operation: z.literal('rotate'),
      params: z.object({
        degrees: z.enum(['90', '180', '270'])
      })
    })
  ])
});

export const zAsset = z.object({
  id: z.string().uuid(),
  site_id: z.string().uuid(),
  kind: z.enum(['image', 'video', 'file']),
  storage_key: z.string(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  duration_ms: z.number().int().optional(),
  checksum: z.string().optional(),
  is_system: z.boolean(),
  system_key: z.string().optional(),
  created_at: z.string(),
  created_by: z.string().uuid()
});

export const zAssetVersion = z.object({
  id: z.string().uuid(),
  asset_id: z.string().uuid(),
  version: z.number().int(),
  meta: zLocalizedContent(zAssetMeta),
  edit_operation: zAssetEditOperation.optional(),
  status: z.enum(['draft', 'published', 'archived']),
  created_at: z.string(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid().optional(),
  updated_at: z.string().optional()
});

export const zAssetPublish = z.object({
  asset_id: z.string().uuid(),
  version: z.number().int(),
  published_by: z.string().uuid(),
  published_at: z.string()
});

// Block schemas
export const zBlockInstance = z.object({
  slot: z.string(),
  order: z.number().int(),
  block_id: z.string().uuid(),
  instance_props: z.record(z.string(), z.unknown()).optional()
});

export const zResolvedBlock = z.object({
  block_id: z.string().uuid(),
  block_version_id: z.string().uuid(),
  type: z.string(),
  layout_variant: z.string(),
  content: zLocalizedContent(z.record(z.string(), z.unknown())),
  assets: z.array(z.object({
    role: z.string(),
    asset: zResolvedAsset
  })),
  instance_props: z.record(z.string(), z.unknown()).optional()
});

export const zBlock = z.object({
  id: z.string().uuid(),
  site_id: z.string().uuid(),
  type: z.string(),
  tag: z.string().optional(),
  is_system: z.boolean(),
  system_key: z.string().optional()
});

export const zBlockVersion = z.object({
  id: z.string().uuid(),
  block_id: z.string().uuid(),
  version: z.number().int(),
  layout_variant: z.string(),
  content: zLocalizedContent(z.record(z.string(), z.unknown())),
  assets: z.array(z.object({
    role: z.string(),
    asset_id: z.string().uuid()
  })),
  status: z.enum(['draft', 'published', 'archived']),
  created_at: z.string(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid().optional(),
  updated_at: z.string().optional()
});

export const zBlockPublish = z.object({
  block_id: z.string().uuid(),
  version: z.number().int(),
  published_by: z.string().uuid(),
  published_at: z.string()
});

// Page schemas
export const zPage = z.object({
  id: z.string().uuid(),
  site_id: z.string().uuid(),
  slug: z.string(),
  is_system: z.boolean(),
  system_key: z.string().optional()
});

export const zPageVersion = z.object({
  id: z.string().uuid(),
  page_id: z.string().uuid(),
  version: z.number().int(),
  title: zLocalizedContent(z.string()),
  layout_variant: z.string().optional(),
  seo: zLocalizedContent(z.record(z.string(), z.unknown())),
  nav_hints: zLocalizedContent(z.record(z.string(), z.unknown())),
  slots: z.array(zBlockInstance),
  status: z.enum(['draft', 'published', 'archived']),
  created_at: z.string(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid().optional(),
  updated_at: z.string().optional()
});

export const zPagePublish = z.object({
  page_id: z.string().uuid(),
  version: z.number().int(),
  published_by: z.string().uuid(),
  published_at: z.string()
});

export const zResolvedPage = z.object({
  site_handle: z.string(),
  slug: z.string(),
  locale: z.string(),
  version: z.number().int(),
  title: z.string(),
  layout_variant: z.string().optional(),
  seo: z.record(z.string(), z.unknown()),
  nav_hints: z.record(z.string(), z.unknown()),
  slots: z.record(z.string(), z.array(zResolvedBlock))
});

// Menu schemas
export const zMenuItem: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.object({
      id: z.string(),
      type: z.literal('page'),
      label: zLocalizedContent(z.string()).optional(),
      target: z.enum(['_self', '_blank']).optional(),
      rel: z.array(z.enum(['nofollow', 'noopener', 'sponsored'])).optional(),
      badge: zLocalizedContent(z.object({
        text: z.string(),
        tone: z.enum(['info', 'success', 'warning'])
      })).optional(),
      visibility: zVisibility.optional(),
      style_hint: z.enum(['legal', 'secondary']).optional(),
      page_id: z.string().uuid(),
      children: z.array(zMenuItem).optional()
    }),
    z.object({
      id: z.string(),
      type: z.enum(['external', 'anchor']),
      label: zLocalizedContent(z.string()).optional(),
      target: z.enum(['_self', '_blank']).optional(),
      rel: z.array(z.enum(['nofollow', 'noopener', 'sponsored'])).optional(),
      badge: zLocalizedContent(z.object({
        text: z.string(),
        tone: z.enum(['info', 'success', 'warning'])
      })).optional(),
      visibility: zVisibility.optional(),
      style_hint: z.enum(['legal', 'secondary']).optional(),
      url: z.string(),
      children: z.array(zMenuItem).optional()
    }),
    z.object({
      id: z.string(),
      type: z.literal('separator'),
      label: zLocalizedContent(z.string()).optional(),
      children: z.array(zMenuItem).optional()
    }),
    z.object({
      id: z.string(),
      type: z.literal('group'),
      label: zLocalizedContent(z.string()).optional(),
      children: z.array(zMenuItem).optional()
    })
  ])
);

export const zMenu = z.object({
  id: z.string().uuid(),
  site_id: z.string().uuid(),
  handle: z.string(),
  label: z.string(),
  is_system: z.boolean(),
  system_key: z.string().optional()
});

export const zMenuVersion = z.object({
  id: z.string().uuid(),
  menu_id: z.string().uuid(),
  version: z.number().int(),
  items: zLocalizedContent(z.array(zMenuItem)),
  status: z.enum(['draft', 'published', 'archived']),
  created_at: z.string(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid().optional(),
  updated_at: z.string().optional()
});

export const zMenuPublish = z.object({
  menu_id: z.string().uuid(),
  version: z.number().int(),
  published_by: z.string().uuid(),
  published_at: z.string()
});

export const zResolvedMenu = z.object({
  handle: z.string(),
  locale: z.string(),
  version: z.number().int(),
  items: z.array(zMenuItem)
});

// Site schema
export const zSite = z.object({
  id: z.string().uuid(),
  handle: z.string(),
  label: z.string(),
  default_locale: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string().uuid().optional(),
  updated_by: z.string().uuid().optional()
});

// Audit log schema
export const zAuditLogEntry = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  user_permissions: z.array(zPermission),
  action: z.enum(['create', 'update', 'publish', 'unpublish', 'delete', 'rollback']),
  entity_type: z.enum(['page', 'block', 'menu', 'asset']),
  entity_id: z.string().uuid(),
  version: z.number().int().optional(),
  changes: z.record(z.string(), z.unknown()).optional(),
  occurred_at: z.string()
});

// API response schemas
export const zApiResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema.nullable(),
    error: z.string().nullable()
  });

export const zPaginatedResponse = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    count: z.number().int(),
    page: z.number().int(),
    page_size: z.number().int(),
    total_pages: z.number().int()
  });

// Content management schemas
export const zContentFilters = z.object({
  status: z.enum(['draft', 'published', 'archived']).optional(),
  type: z.string().optional(),
  is_system: z.boolean().optional(),
  created_by: z.string().uuid().optional(),
  search: z.string().optional()
});

export const zContentSort = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc'])
});

// Image processing schemas
export const zImageProcessingOptions = z.object({
  format: z.enum(['webp', 'jpeg', 'png']).optional(),
  quality: z.number().min(1).max(100).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  maintain_aspect_ratio: z.boolean().optional()
});

export const zImageUploadResult = z.object({
  asset_id: z.string().uuid(),
  storage_key: z.string(),
  variants: z.array(zAssetVariant),
  url: z.string().url()
});
