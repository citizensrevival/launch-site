import { describe, it, expect } from 'vitest';
import {
  ResolvePageRequestSchema,
  ResolvedPageSchema,
  ResolvedPageSlotSchema,
  ResolvedBlockSchema,
  ResolvedBlockAssetSchema,
  ResolvedAssetSchema,
  ResolvedAssetVariantSchema,
  PageResolutionErrorSchema,
} from '../page.edge-functions.schemas';

describe('CMS Page Edge Function Schemas', () => {
  describe('ResolvePageRequestSchema', () => {
    it('should validate valid request', () => {
      const validRequest = {
        page_id: '123e4567-e89b-12d3-a456-426614174000',
        site_id: '123e4567-e89b-12d3-a456-426614174001',
        locale: 'en-US'
      };
      expect(() => ResolvePageRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should validate minimal request', () => {
      const validRequest = {
        page_id: '123e4567-e89b-12d3-a456-426614174000'
      };
      expect(() => ResolvePageRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should reject invalid UUID', () => {
      const invalidRequest = {
        page_id: 'not-a-uuid'
      };
      expect(() => ResolvePageRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe('ResolvedAssetVariantSchema', () => {
    it('should validate complete variant', () => {
      const validVariant = {
        variant_name: 'thumbnail',
        storage_key: 'assets/thumbnails/image.jpg',
        width: 150,
        height: 150,
        file_size: 1024
      };
      expect(() => ResolvedAssetVariantSchema.parse(validVariant)).not.toThrow();
    });

    it('should validate minimal variant', () => {
      const validVariant = {
        variant_name: 'original',
        storage_key: 'assets/original/image.jpg'
      };
      expect(() => ResolvedAssetVariantSchema.parse(validVariant)).not.toThrow();
    });
  });

  describe('ResolvedAssetSchema', () => {
    it('should validate image asset', () => {
      const validAsset = {
        id: 'asset-1',
        kind: 'image',
        storage_key: 'assets/images/hero.jpg',
        width: 1920,
        height: 1080,
        variants: [
          {
            variant_name: 'thumbnail',
            storage_key: 'assets/thumbnails/hero.jpg',
            width: 150,
            height: 150
          }
        ],
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-123'
      };
      expect(() => ResolvedAssetSchema.parse(validAsset)).not.toThrow();
    });

    it('should validate video asset', () => {
      const validAsset = {
        id: 'asset-2',
        kind: 'video',
        storage_key: 'assets/videos/intro.mp4',
        width: 1920,
        height: 1080,
        duration_ms: 30000,
        variants: [],
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-123'
      };
      expect(() => ResolvedAssetSchema.parse(validAsset)).not.toThrow();
    });

    it('should validate document asset', () => {
      const validAsset = {
        id: 'asset-3',
        kind: 'document',
        storage_key: 'assets/documents/guide.pdf',
        variants: [],
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-123'
      };
      expect(() => ResolvedAssetSchema.parse(validAsset)).not.toThrow();
    });
  });

  describe('ResolvedBlockAssetSchema', () => {
    it('should validate block asset', () => {
      const validBlockAsset = {
        role: 'hero_image',
        asset: {
          id: 'asset-1',
          kind: 'image',
          storage_key: 'assets/images/hero.jpg',
          width: 1920,
          height: 1080,
          variants: [],
          published_at: '2024-01-01T00:00:00Z',
          published_by: 'user-123'
        }
      };
      expect(() => ResolvedBlockAssetSchema.parse(validBlockAsset)).not.toThrow();
    });
  });

  describe('ResolvedBlockSchema', () => {
    it('should validate text block', () => {
      const validBlock = {
        id: 'block-1',
        type: 'text',
        tag: 'h1',
        layout_variant: 'hero',
        content: {
          text: 'Welcome to our site',
          style: { fontSize: '2rem', color: '#333' }
        },
        assets: [],
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-123'
      };
      expect(() => ResolvedBlockSchema.parse(validBlock)).not.toThrow();
    });

    it('should validate image block', () => {
      const validBlock = {
        id: 'block-2',
        type: 'image',
        layout_variant: 'full-width',
        content: {
          alt: 'Hero image',
          caption: 'Beautiful landscape'
        },
        assets: [
          {
            role: 'image',
            asset: {
              id: 'asset-1',
              kind: 'image',
              storage_key: 'assets/images/hero.jpg',
              width: 1920,
              height: 1080,
              variants: [],
              published_at: '2024-01-01T00:00:00Z',
              published_by: 'user-123'
            }
          }
        ],
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-123'
      };
      expect(() => ResolvedBlockSchema.parse(validBlock)).not.toThrow();
    });

    it('should validate complex block with multiple assets', () => {
      const validBlock = {
        id: 'block-3',
        type: 'gallery',
        layout_variant: 'grid',
        content: {
          title: 'Photo Gallery',
          columns: 3
        },
        assets: [
          {
            role: 'image_1',
            asset: {
              id: 'asset-1',
              kind: 'image',
              storage_key: 'assets/images/photo1.jpg',
              width: 800,
              height: 600,
              variants: [],
              published_at: '2024-01-01T00:00:00Z',
              published_by: 'user-123'
            }
          },
          {
            role: 'image_2',
            asset: {
              id: 'asset-2',
              kind: 'image',
              storage_key: 'assets/images/photo2.jpg',
              width: 800,
              height: 600,
              variants: [],
              published_at: '2024-01-01T00:00:00Z',
              published_by: 'user-123'
            }
          }
        ],
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-123'
      };
      expect(() => ResolvedBlockSchema.parse(validBlock)).not.toThrow();
    });
  });

  describe('ResolvedPageSlotSchema', () => {
    it('should validate page slot', () => {
      const validSlot = {
        slot: 'header',
        order: 1,
        block: {
          id: 'block-1',
          type: 'text',
          layout_variant: 'hero',
          content: { text: 'Welcome' },
          assets: [],
          published_at: '2024-01-01T00:00:00Z',
          published_by: 'user-123'
        }
      };
      expect(() => ResolvedPageSlotSchema.parse(validSlot)).not.toThrow();
    });
  });

  describe('ResolvedPageSchema', () => {
    it('should validate complete page', () => {
      const validPage = {
        id: 'page-1',
        slug: 'home',
        title: { en: 'Home Page', es: 'Página Principal' },
        layout_variant: 'default',
        seo: {
          meta_title: 'Home - My Site',
          meta_description: 'Welcome to our site',
          keywords: ['home', 'welcome']
        },
        nav_hints: {
          show_in_nav: true,
          nav_order: 1
        },
        slots: [
          {
            slot: 'header',
            order: 1,
            block: {
              id: 'block-1',
              type: 'text',
              layout_variant: 'hero',
              content: { text: 'Welcome' },
              assets: [],
              published_at: '2024-01-01T00:00:00Z',
              published_by: 'user-123'
            }
          }
        ],
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-123'
      };
      expect(() => ResolvedPageSchema.parse(validPage)).not.toThrow();
    });

    it('should validate minimal page', () => {
      const validPage = {
        id: 'page-1',
        slug: 'home',
        title: { en: 'Home' },
        seo: {},
        nav_hints: {},
        slots: [],
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-123'
      };
      expect(() => ResolvedPageSchema.parse(validPage)).not.toThrow();
    });
  });

  describe('PageResolutionErrorSchema', () => {
    it('should validate error response', () => {
      const validError = {
        error: 'Page not found'
      };
      expect(() => PageResolutionErrorSchema.parse(validError)).not.toThrow();
    });
  });

  describe('Edge Cases and Malicious Inputs', () => {
    it('should handle complex content structures', () => {
      const block = {
        id: 'complex-block',
        type: 'rich-text',
        layout_variant: 'article',
        content: {
          html: '<div><h1>Title</h1><p>Content with <strong>formatting</strong> and <em>styles</em></p></div>',
          styles: {
            h1: { fontSize: '2rem', color: '#333' },
            p: { fontSize: '1rem', lineHeight: 1.5 }
          },
          metadata: {
            wordCount: 150,
            readingTime: 2
          }
        },
        assets: [],
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-123'
      };
      expect(() => ResolvedBlockSchema.parse(block)).not.toThrow();
    });

    it('should handle special characters in content', () => {
      const block = {
        id: 'special-block',
        type: 'text',
        layout_variant: 'default',
        content: {
          text: 'Special characters: <>&"\' and unicode: 🚀🎉💻',
          html: '<p>HTML with <script>alert("xss")</script> tags</p>'
        },
        assets: [],
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-123'
      };
      expect(() => ResolvedBlockSchema.parse(block)).not.toThrow();
    });

    it('should handle very large content', () => {
      const largeContent = 'a'.repeat(100000);
      const block = {
        id: 'large-block',
        type: 'text',
        layout_variant: 'default',
        content: {
          text: largeContent,
          metadata: { size: 'large' }
        },
        assets: [],
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-123'
      };
      expect(() => ResolvedBlockSchema.parse(block)).not.toThrow();
    });

    it('should handle deeply nested content', () => {
      const block = {
        id: 'nested-block',
        type: 'complex',
        layout_variant: 'nested',
        content: {
          level1: {
            level2: {
              level3: {
                level4: {
                  value: 'deeply nested'
                }
              }
            }
          }
        },
        assets: [],
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-123'
      };
      expect(() => ResolvedBlockSchema.parse(block)).not.toThrow();
    });

    it('should handle multiple asset variants', () => {
      const asset = {
        id: 'multi-variant-asset',
        kind: 'image',
        storage_key: 'assets/images/hero.jpg',
        width: 1920,
        height: 1080,
        variants: [
          {
            variant_name: 'thumbnail',
            storage_key: 'assets/thumbnails/hero.jpg',
            width: 150,
            height: 150,
            file_size: 1024
          },
          {
            variant_name: 'medium',
            storage_key: 'assets/medium/hero.jpg',
            width: 800,
            height: 600,
            file_size: 2048
          },
          {
            variant_name: 'large',
            storage_key: 'assets/large/hero.jpg',
            width: 1920,
            height: 1080,
            file_size: 4096
          }
        ],
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-123'
      };
      expect(() => ResolvedAssetSchema.parse(asset)).not.toThrow();
    });
  });
});
