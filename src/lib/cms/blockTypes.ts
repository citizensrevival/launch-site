// CMS Block Types and Templates
// This file defines common block types with their schemas and templates

import { z } from 'zod';

// Helper for i18n content validation
export const zLocalizedContent = <T extends z.ZodTypeAny>(contentSchema: T) =>
  z.record(z.string(), contentSchema);

// Base field types
export const zTextField = z.object({
  key: z.string(),
  label: z.string(),
  type: z.literal('text'),
  required: z.boolean().default(false),
  placeholder: z.string().optional()
});

export const zTextareaField = z.object({
  key: z.string(),
  label: z.string(),
  type: z.literal('textarea'),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  rows: z.number().default(3)
});

export const zUrlField = z.object({
  key: z.string(),
  label: z.string(),
  type: z.literal('url'),
  required: z.boolean().default(false),
  placeholder: z.string().optional()
});

export const zColorField = z.object({
  key: z.string(),
  label: z.string(),
  type: z.literal('color'),
  required: z.boolean().default(false),
  default: z.string().optional()
});

export const zNumberField = z.object({
  key: z.string(),
  label: z.string(),
  type: z.literal('number'),
  required: z.boolean().default(false),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().default(1)
});

export const zSelectField = z.object({
  key: z.string(),
  label: z.string(),
  type: z.literal('select'),
  required: z.boolean().default(false),
  options: z.array(z.object({
    value: z.string(),
    label: z.string()
  }))
});

export const zArrayField = z.object({
  key: z.string(),
  label: z.string(),
  type: z.literal('array'),
  required: z.boolean().default(false),
  itemType: z.enum(['text', 'url', 'email']).default('text'),
  placeholder: z.string().optional()
});

export const zAssetField = z.object({
  key: z.string(),
  label: z.string(),
  type: z.literal('asset'),
  required: z.boolean().default(false),
  role: z.string(),
  acceptedTypes: z.array(z.enum(['image', 'video', 'file'])).default(['image']),
  multiple: z.boolean().default(false)
});

export type FieldDefinition = 
  | z.infer<typeof zTextField>
  | z.infer<typeof zTextareaField>
  | z.infer<typeof zUrlField>
  | z.infer<typeof zColorField>
  | z.infer<typeof zNumberField>
  | z.infer<typeof zSelectField>
  | z.infer<typeof zArrayField>
  | z.infer<typeof zAssetField>;

// Block type definitions
export interface BlockTypeDefinition {
  type: string;
  label: string;
  description: string;
  icon: string;
  category: 'content' | 'layout' | 'interactive' | 'media';
  fields: FieldDefinition[];
  layoutVariants: string[];
  previewComponent?: string;
  schema: z.ZodSchema;
  assetRoles?: string[];
  requiredAssets?: string[];
}

// Hero Block Type
export const heroBlockType: BlockTypeDefinition = {
  type: 'hero',
  label: 'Hero Section',
  description: 'Large banner section with title, subtitle, and call-to-action',
  icon: 'mdiViewDashboard',
  category: 'content',
  fields: [
    {
      key: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      placeholder: 'Enter hero title...'
    },
    {
      key: 'subtitle',
      label: 'Subtitle',
      type: 'text',
      required: false,
      placeholder: 'Enter hero subtitle...'
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Enter hero description...',
      rows: 3
    },
    {
      key: 'cta_text',
      label: 'Call to Action Text',
      type: 'text',
      required: false,
      placeholder: 'Learn More'
    },
    {
      key: 'cta_url',
      label: 'Call to Action URL',
      type: 'url',
      required: false,
      placeholder: 'https://example.com'
    },
    {
      key: 'background_color',
      label: 'Background Color',
      type: 'color',
      required: false,
      default: '#1f2937'
    },
    {
      key: 'hero_image',
      label: 'Hero Image',
      type: 'asset',
      required: false,
      role: 'hero_image',
      acceptedTypes: ['image'],
      multiple: false
    }
  ],
  layoutVariants: ['default', 'centered', 'left-aligned', 'right-aligned'],
  previewComponent: 'HeroBlockPreview',
  assetRoles: ['hero_image', 'hero_background'],
  requiredAssets: ['hero_image'],
  schema: zLocalizedContent(z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    cta_text: z.string().optional(),
    cta_url: z.string().url().optional(),
    background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
  }))
};

// Features Block Type
export const featuresBlockType: BlockTypeDefinition = {
  type: 'features',
  label: 'Features Section',
  description: 'Grid of feature items with icons, titles, and descriptions',
  icon: 'mdiViewGrid',
  category: 'content',
  fields: [
    {
      key: 'title',
      label: 'Section Title',
      type: 'text',
      required: true,
      placeholder: 'Our Features'
    },
    {
      key: 'subtitle',
      label: 'Section Subtitle',
      type: 'text',
      required: false,
      placeholder: 'What we offer...'
    },
    {
      key: 'features',
      label: 'Features',
      type: 'array',
      required: true,
      itemType: 'text',
      placeholder: 'Add feature item...'
    },
    {
      key: 'columns',
      label: 'Number of Columns',
      type: 'number',
      required: false,
      min: 1,
      max: 4,
      step: 1
    },
    {
      key: 'feature_icons',
      label: 'Feature Icons',
      type: 'asset',
      required: false,
      role: 'feature_icons',
      acceptedTypes: ['image'],
      multiple: true
    }
  ],
  layoutVariants: ['grid-2', 'grid-3', 'grid-4', 'list'],
  previewComponent: 'FeaturesBlockPreview',
  assetRoles: ['feature_icons', 'feature_images'],
  requiredAssets: [],
  schema: zLocalizedContent(z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    features: z.array(z.string()).min(1),
    columns: z.number().int().min(1).max(4).optional()
  }))
};

// CTA Block Type
export const ctaBlockType: BlockTypeDefinition = {
  type: 'cta',
  label: 'Call to Action',
  description: 'Prominent call-to-action section with button and text',
  icon: 'mdiHandPointingRight',
  category: 'interactive',
  fields: [
    {
      key: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      placeholder: 'Ready to get started?'
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Join thousands of satisfied customers...',
      rows: 3
    },
    {
      key: 'button_text',
      label: 'Button Text',
      type: 'text',
      required: true,
      placeholder: 'Get Started'
    },
    {
      key: 'button_url',
      label: 'Button URL',
      type: 'url',
      required: true,
      placeholder: 'https://example.com/signup'
    },
    {
      key: 'button_style',
      label: 'Button Style',
      type: 'select',
      required: false,
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'outline', label: 'Outline' }
      ]
    },
    {
      key: 'background_color',
      label: 'Background Color',
      type: 'color',
      required: false,
      default: '#3b82f6'
    }
  ],
  layoutVariants: ['centered', 'left-aligned', 'right-aligned', 'split'],
  previewComponent: 'CtaBlockPreview',
  assetRoles: ['cta_background', 'cta_image'],
  requiredAssets: [],
  schema: zLocalizedContent(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    button_text: z.string().min(1),
    button_url: z.string().url(),
    button_style: z.enum(['primary', 'secondary', 'outline']).optional(),
    background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
  }))
};

// Text Block Type
export const textBlockType: BlockTypeDefinition = {
  type: 'text',
  label: 'Text Content',
  description: 'Rich text content with formatting options',
  icon: 'mdiFormatText',
  category: 'content',
  fields: [
    {
      key: 'content',
      label: 'Content',
      type: 'textarea',
      required: true,
      placeholder: 'Enter your text content...',
      rows: 6
    },
    {
      key: 'text_align',
      label: 'Text Alignment',
      type: 'select',
      required: false,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
        { value: 'justify', label: 'Justify' }
      ]
    },
    {
      key: 'text_size',
      label: 'Text Size',
      type: 'select',
      required: false,
      options: [
        { value: 'sm', label: 'Small' },
        { value: 'base', label: 'Base' },
        { value: 'lg', label: 'Large' },
        { value: 'xl', label: 'Extra Large' }
      ]
    }
  ],
  layoutVariants: ['default', 'narrow', 'wide', 'full-width'],
  previewComponent: 'TextBlockPreview',
  assetRoles: ['text_image', 'text_background'],
  requiredAssets: [],
  schema: zLocalizedContent(z.object({
    content: z.string().min(1),
    text_align: z.enum(['left', 'center', 'right', 'justify']).optional(),
    text_size: z.enum(['sm', 'base', 'lg', 'xl']).optional()
  }))
};

// Image-Text Block Type
export const imageTextBlockType: BlockTypeDefinition = {
  type: 'image-text',
  label: 'Image & Text',
  description: 'Combined image and text content with layout options',
  icon: 'mdiImageText',
  category: 'media',
  fields: [
    {
      key: 'title',
      label: 'Title',
      type: 'text',
      required: false,
      placeholder: 'Enter title...'
    },
    {
      key: 'content',
      label: 'Content',
      type: 'textarea',
      required: true,
      placeholder: 'Enter your content...',
      rows: 4
    },
    {
      key: 'image',
      label: 'Image',
      type: 'asset',
      required: true,
      role: 'content_image',
      acceptedTypes: ['image'],
      multiple: false
    },
    {
      key: 'image_alt',
      label: 'Image Alt Text',
      type: 'text',
      required: true,
      placeholder: 'Describe the image...'
    },
    {
      key: 'layout',
      label: 'Layout',
      type: 'select',
      required: false,
      options: [
        { value: 'image-left', label: 'Image Left' },
        { value: 'image-right', label: 'Image Right' },
        { value: 'image-top', label: 'Image Top' },
        { value: 'image-bottom', label: 'Image Bottom' }
      ]
    },
    {
      key: 'image_size',
      label: 'Image Size',
      type: 'select',
      required: false,
      options: [
        { value: 'small', label: 'Small (25%)' },
        { value: 'medium', label: 'Medium (50%)' },
        { value: 'large', label: 'Large (75%)' }
      ]
    }
  ],
  layoutVariants: ['image-left', 'image-right', 'image-top', 'image-bottom'],
  previewComponent: 'ImageTextBlockPreview',
  assetRoles: ['content_image', 'content_background'],
  requiredAssets: ['content_image'],
  schema: zLocalizedContent(z.object({
    title: z.string().optional(),
    content: z.string().min(1),
    image_alt: z.string().min(1),
    layout: z.enum(['image-left', 'image-right', 'image-top', 'image-bottom']).optional(),
    image_size: z.enum(['small', 'medium', 'large']).optional()
  }))
};

// Card Block Type
export const cardBlockType: BlockTypeDefinition = {
  type: 'card',
  label: 'Card',
  description: 'Card component with image, title, and content',
  icon: 'mdiCard',
  category: 'content',
  fields: [
    {
      key: 'title',
      label: 'Card Title',
      type: 'text',
      required: true,
      placeholder: 'Card Title'
    },
    {
      key: 'content',
      label: 'Card Content',
      type: 'textarea',
      required: false,
      placeholder: 'Card description...',
      rows: 3
    },
    {
      key: 'image',
      label: 'Card Image',
      type: 'asset',
      required: false,
      role: 'card_image',
      acceptedTypes: ['image'],
      multiple: false
    },
    {
      key: 'image_alt',
      label: 'Image Alt Text',
      type: 'text',
      required: false,
      placeholder: 'Describe the image...'
    },
    {
      key: 'button_text',
      label: 'Button Text',
      type: 'text',
      required: false,
      placeholder: 'Learn More'
    },
    {
      key: 'button_url',
      label: 'Button URL',
      type: 'url',
      required: false,
      placeholder: 'https://example.com'
    }
  ],
  layoutVariants: ['default', 'horizontal', 'minimal', 'featured'],
  previewComponent: 'CardBlockPreview',
  assetRoles: ['card_image', 'card_icon'],
  requiredAssets: [],
  schema: zLocalizedContent(z.object({
    title: z.string().min(1),
    content: z.string().optional(),
    image_alt: z.string().optional(),
    button_text: z.string().optional(),
    button_url: z.string().url().optional()
  }))
};

// List Block Type
export const listBlockType: BlockTypeDefinition = {
  type: 'list',
  label: 'List',
  description: 'Ordered or unordered list of items',
  icon: 'mdiFormatListBulleted',
  category: 'content',
  fields: [
    {
      key: 'title',
      label: 'List Title',
      type: 'text',
      required: false,
      placeholder: 'List Title'
    },
    {
      key: 'items',
      label: 'List Items',
      type: 'array',
      required: true,
      itemType: 'text',
      placeholder: 'Add list item...'
    },
    {
      key: 'list_type',
      label: 'List Type',
      type: 'select',
      required: false,
      options: [
        { value: 'bullet', label: 'Bullet List' },
        { value: 'numbered', label: 'Numbered List' },
        { value: 'checklist', label: 'Checklist' }
      ]
    }
  ],
  layoutVariants: ['default', 'compact', 'spaced'],
  previewComponent: 'ListBlockPreview',
  assetRoles: ['list_icons', 'list_images'],
  requiredAssets: [],
  schema: zLocalizedContent(z.object({
    title: z.string().optional(),
    items: z.array(z.string()).min(1),
    list_type: z.enum(['bullet', 'numbered', 'checklist']).optional()
  }))
};

// Grid Block Type
export const gridBlockType: BlockTypeDefinition = {
  type: 'grid',
  label: 'Grid Layout',
  description: 'Grid layout for organizing content',
  icon: 'mdiViewGridOutline',
  category: 'layout',
  fields: [
    {
      key: 'title',
      label: 'Grid Title',
      type: 'text',
      required: false,
      placeholder: 'Grid Title'
    },
    {
      key: 'columns',
      label: 'Number of Columns',
      type: 'number',
      required: true,
      min: 1,
      max: 6,
      step: 1
    },
    {
      key: 'gap',
      label: 'Grid Gap',
      type: 'select',
      required: false,
      options: [
        { value: 'none', label: 'No Gap' },
        { value: 'sm', label: 'Small Gap' },
        { value: 'md', label: 'Medium Gap' },
        { value: 'lg', label: 'Large Gap' }
      ]
    },
    {
      key: 'items',
      label: 'Grid Items',
      type: 'array',
      required: true,
      itemType: 'text',
      placeholder: 'Add grid item...'
    }
  ],
  layoutVariants: ['equal', 'auto', 'fixed'],
  previewComponent: 'GridBlockPreview',
  assetRoles: ['grid_images', 'grid_background'],
  requiredAssets: [],
  schema: zLocalizedContent(z.object({
    title: z.string().optional(),
    columns: z.number().int().min(1).max(6),
    gap: z.enum(['none', 'sm', 'md', 'lg']).optional(),
    items: z.array(z.string()).min(1)
  }))
};

// All block types
export const blockTypes: BlockTypeDefinition[] = [
  heroBlockType,
  featuresBlockType,
  ctaBlockType,
  textBlockType,
  imageTextBlockType,
  cardBlockType,
  listBlockType,
  gridBlockType
];

// Helper functions
export function getBlockType(type: string): BlockTypeDefinition | undefined {
  return blockTypes.find(bt => bt.type === type);
}

export function getBlockTypeFields(type: string): FieldDefinition[] {
  const blockType = getBlockType(type);
  return blockType?.fields || [];
}

export function getBlockTypeSchema(type: string): z.ZodSchema | undefined {
  const blockType = getBlockType(type);
  return blockType?.schema;
}

export function getBlockTypesByCategory(category: string): BlockTypeDefinition[] {
  return blockTypes.filter(bt => bt.category === category);
}

export function getBlockTypeAssetRoles(type: string): string[] {
  const blockType = getBlockType(type);
  return blockType?.assetRoles || [];
}

export function getBlockTypeRequiredAssets(type: string): string[] {
  const blockType = getBlockType(type);
  return blockType?.requiredAssets || [];
}

export function validateBlockAssets(type: string, assets: Array<{ role: string; asset_id: string }>): { valid: boolean; errors: string[] } {
  const blockType = getBlockType(type);
  if (!blockType) {
    return { valid: false, errors: [`Unknown block type: ${type}`] };
  }

  const errors: string[] = [];
  const assetRoles = assets.map(a => a.role);
  
  // Check required assets
  if (blockType.requiredAssets) {
    for (const requiredRole of blockType.requiredAssets) {
      if (!assetRoles.includes(requiredRole)) {
        errors.push(`Missing required asset role: ${requiredRole}`);
      }
    }
  }

  // Check for invalid roles
  if (blockType.assetRoles) {
    for (const asset of assets) {
      if (!blockType.assetRoles.includes(asset.role)) {
        errors.push(`Invalid asset role for ${type} block: ${asset.role}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateBlockContent(type: string, content: any): { valid: boolean; errors: string[] } {
  const schema = getBlockTypeSchema(type);
  if (!schema) {
    return { valid: false, errors: [`Unknown block type: ${type}`] };
  }

  try {
    schema.parse(content);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        valid: false, 
        errors: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`) 
      };
    }
    return { valid: false, errors: ['Validation failed'] };
  }
}

// Block type categories
export const blockCategories = [
  { key: 'content', label: 'Content', icon: 'mdiFormatText' },
  { key: 'layout', label: 'Layout', icon: 'mdiViewGrid' },
  { key: 'interactive', label: 'Interactive', icon: 'mdiHandPointingRight' },
  { key: 'media', label: 'Media', icon: 'mdiImage' }
] as const;

export type BlockCategory = typeof blockCategories[number]['key'];
