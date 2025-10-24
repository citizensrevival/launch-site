import { describe, it, expect } from 'vitest';
import {
  ResolveMenuRequestSchema,
  ResolvedMenuSchema,
  ResolvedMenuItemSchema,
  MenuResolutionErrorSchema,
} from '../menu.edge-functions.schemas';

describe('CMS Menu Edge Function Schemas', () => {
  describe('ResolveMenuRequestSchema', () => {
    it('should validate valid request', () => {
      const validRequest = {
        menu_id: '123e4567-e89b-12d3-a456-426614174000',
        site_id: '123e4567-e89b-12d3-a456-426614174001',
        locale: 'en-US'
      };
      expect(() => ResolveMenuRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should validate minimal request', () => {
      const validRequest = {
        menu_id: '123e4567-e89b-12d3-a456-426614174000'
      };
      expect(() => ResolveMenuRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should reject invalid UUID', () => {
      const invalidRequest = {
        menu_id: 'not-a-uuid'
      };
      expect(() => ResolveMenuRequestSchema.parse(invalidRequest)).toThrow();
    });

    it('should reject missing menu_id', () => {
      const invalidRequest = {};
      expect(() => ResolveMenuRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe('ResolvedMenuItemSchema', () => {
    it('should validate page item', () => {
      const validItem = {
        id: 'item-1',
        type: 'page' as const,
        label: { en: 'Home', es: 'Inicio' },
        target: '/home',
        visibility: {
          device: ['mobile', 'desktop'],
          audience: ['anon', 'user']
        }
      };
      expect(() => ResolvedMenuItemSchema.parse(validItem)).not.toThrow();
    });

    it('should validate external item', () => {
      const validItem = {
        id: 'item-2',
        type: 'external' as const,
        label: { en: 'External Link' },
        target: 'https://example.com',
        rel: 'noopener'
      };
      expect(() => ResolvedMenuItemSchema.parse(validItem)).not.toThrow();
    });

    it('should validate separator item', () => {
      const validItem = {
        id: 'item-3',
        type: 'separator' as const,
        label: { en: '' }
      };
      expect(() => ResolvedMenuItemSchema.parse(validItem)).not.toThrow();
    });

    it('should validate group with children', () => {
      const validItem = {
        id: 'group-1',
        type: 'group' as const,
        label: { en: 'Products' },
        children: [
          {
            id: 'sub-item-1',
            type: 'page' as const,
            label: { en: 'Product 1' },
            target: '/product-1'
          }
        ]
      };
      expect(() => ResolvedMenuItemSchema.parse(validItem)).not.toThrow();
    });

    it('should validate item with badge', () => {
      const validItem = {
        id: 'item-4',
        type: 'page' as const,
        label: { en: 'New Feature' },
        target: '/new-feature',
        badge: {
          text: { en: 'NEW' },
          color: '#ff0000'
        }
      };
      expect(() => ResolvedMenuItemSchema.parse(validItem)).not.toThrow();
    });

    it('should validate item with style hints', () => {
      const validItem = {
        id: 'item-5',
        type: 'page' as const,
        label: { en: 'Styled Item' },
        target: '/styled',
        style_hints: {
          css_class: 'highlight',
          priority: 1
        }
      };
      expect(() => ResolvedMenuItemSchema.parse(validItem)).not.toThrow();
    });

    it('should reject invalid type', () => {
      const invalidItem = {
        id: 'item-1',
        type: 'invalid' as any,
        label: { en: 'Test' }
      };
      expect(() => ResolvedMenuItemSchema.parse(invalidItem)).toThrow();
    });

    it('should reject missing required fields', () => {
      const invalidItem = {
        type: 'page' as const,
        label: { en: 'Test' }
      };
      expect(() => ResolvedMenuItemSchema.parse(invalidItem)).toThrow();
    });
  });

  describe('ResolvedMenuSchema', () => {
    it('should validate complete menu', () => {
      const validMenu = {
        id: 'menu-1',
        handle: 'main-menu',
        label: 'Main Menu',
        items: [
          {
            id: 'item-1',
            type: 'page' as const,
            label: { en: 'Home' },
            target: '/'
          }
        ],
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-123'
      };
      expect(() => ResolvedMenuSchema.parse(validMenu)).not.toThrow();
    });

    it('should validate empty menu', () => {
      const validMenu = {
        id: 'menu-1',
        handle: 'empty-menu',
        label: 'Empty Menu',
        items: [],
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-123'
      };
      expect(() => ResolvedMenuSchema.parse(validMenu)).not.toThrow();
    });

    it('should reject missing required fields', () => {
      const invalidMenu = {
        id: 'menu-1',
        handle: 'main-menu'
      };
      expect(() => ResolvedMenuSchema.parse(invalidMenu)).toThrow();
    });
  });

  describe('MenuResolutionErrorSchema', () => {
    it('should validate error response', () => {
      const validError = {
        error: 'Menu not found'
      };
      expect(() => MenuResolutionErrorSchema.parse(validError)).not.toThrow();
    });

    it('should reject missing error field', () => {
      const invalidError = {};
      expect(() => MenuResolutionErrorSchema.parse(invalidError)).toThrow();
    });
  });

  describe('Edge Cases and Malicious Inputs', () => {
    it('should handle deeply nested menu items', () => {
      const deepItem = {
        id: 'deep-1',
        type: 'group' as const,
        label: { en: 'Level 1' },
        children: [
          {
            id: 'deep-2',
            type: 'group' as const,
            label: { en: 'Level 2' },
            children: [
              {
                id: 'deep-3',
                type: 'page' as const,
                label: { en: 'Level 3' },
                target: '/deep'
              }
            ]
          }
        ]
      };
      expect(() => ResolvedMenuItemSchema.parse(deepItem)).not.toThrow();
    });

    it('should handle special characters in labels', () => {
      const item = {
        id: 'special-1',
        type: 'page' as const,
        label: { 
          en: 'Special & Characters <script>alert("xss")</script>',
          es: 'Caracteres Especiales'
        },
        target: '/special'
      };
      expect(() => ResolvedMenuItemSchema.parse(item)).not.toThrow();
    });

    it('should handle unicode characters', () => {
      const item = {
        id: 'unicode-1',
        type: 'page' as const,
        label: { en: '🚀 Menu Item 🎉' },
        target: '/unicode'
      };
      expect(() => ResolvedMenuItemSchema.parse(item)).not.toThrow();
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const item = {
        id: 'long-1',
        type: 'page' as const,
        label: { en: longString },
        target: '/long'
      };
      expect(() => ResolvedMenuItemSchema.parse(item)).not.toThrow();
    });

    it('should handle complex visibility rules', () => {
      const item = {
        id: 'complex-1',
        type: 'page' as const,
        label: { en: 'Complex Item' },
        target: '/complex',
        visibility: {
          device: ['mobile', 'desktop'],
          audience: ['anon', 'user', 'admin'],
          featureFlags: ['feature-1', 'feature-2'],
          schedule: {
            start: '2024-01-01T00:00:00Z',
            end: '2024-12-31T23:59:59Z'
          }
        }
      };
      expect(() => ResolvedMenuItemSchema.parse(item)).not.toThrow();
    });
  });
});
