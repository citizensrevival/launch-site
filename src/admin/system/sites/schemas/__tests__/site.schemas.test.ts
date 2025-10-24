import { describe, it, expect } from 'vitest';
import {
  SiteSchema,
  CreateSiteInputSchema,
  UpdateSiteInputSchema,
  SiteFiltersSchema,
  SiteListResultSchema,
} from '../site.schemas';

describe('System Sites Schemas', () => {
  describe('SiteSchema', () => {
    it('should validate complete site', () => {
      const validSite = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'My Site',
        slug: 'my-site',
        domain: 'https://example.com',
        description: 'A test site',
        settings: { theme: 'dark', language: 'en' },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174001',
        updated_by: '123e4567-e89b-12d3-a456-426614174001',
      };
      expect(() => SiteSchema.parse(validSite)).not.toThrow();
    });

    it('should validate minimal site', () => {
      const validSite = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Minimal Site',
        slug: 'minimal',
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174001',
        updated_by: '123e4567-e89b-12d3-a456-426614174001',
      };
      expect(() => SiteSchema.parse(validSite)).not.toThrow();
    });

    it('should reject invalid UUID', () => {
      const invalidSite = {
        id: 'not-a-uuid',
        name: 'Test Site',
        slug: 'test',
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174001',
        updated_by: '123e4567-e89b-12d3-a456-426614174001',
      };
      expect(() => SiteSchema.parse(invalidSite)).toThrow();
    });

    it('should reject invalid slug', () => {
      const invalidSite = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Site',
        slug: 'Invalid Slug!',
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174001',
        updated_by: '123e4567-e89b-12d3-a456-426614174001',
      };
      expect(() => SiteSchema.parse(invalidSite)).toThrow();
    });

    it('should reject invalid domain', () => {
      const invalidSite = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Site',
        slug: 'test',
        domain: 'not-a-url',
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174001',
        updated_by: '123e4567-e89b-12d3-a456-426614174001',
      };
      expect(() => SiteSchema.parse(invalidSite)).toThrow();
    });
  });

  describe('CreateSiteInputSchema', () => {
    it('should validate complete input', () => {
      const validInput = {
        name: 'New Site',
        slug: 'new-site',
        domain: 'https://newsite.com',
        description: 'A new site',
        settings: { theme: 'light' },
      };
      expect(() => CreateSiteInputSchema.parse(validInput)).not.toThrow();
    });

    it('should validate minimal input', () => {
      const validInput = {
        name: 'Minimal Site',
        slug: 'minimal',
      };
      expect(() => CreateSiteInputSchema.parse(validInput)).not.toThrow();
    });

    it('should reject missing required fields', () => {
      const invalidInput = {
        slug: 'test',
      };
      expect(() => CreateSiteInputSchema.parse(invalidInput)).toThrow();
    });

    it('should reject invalid slug format', () => {
      const invalidInput = {
        name: 'Test Site',
        slug: 'Invalid Slug!',
      };
      expect(() => CreateSiteInputSchema.parse(invalidInput)).toThrow();
    });
  });

  describe('UpdateSiteInputSchema', () => {
    it('should validate partial update', () => {
      const validUpdate = {
        name: 'Updated Site',
        settings: { theme: 'dark' },
      };
      expect(() => UpdateSiteInputSchema.parse(validUpdate)).not.toThrow();
    });

    it('should validate empty update', () => {
      const validUpdate = {};
      expect(() => UpdateSiteInputSchema.parse(validUpdate)).not.toThrow();
    });

    it('should reject invalid slug format', () => {
      const invalidUpdate = {
        slug: 'Invalid Slug!',
      };
      expect(() => UpdateSiteInputSchema.parse(invalidUpdate)).toThrow();
    });
  });

  describe('SiteFiltersSchema', () => {
    it('should validate complete filters', () => {
      const validFilters = {
        search: 'test',
        domain: 'example.com',
        created_after: '2024-01-01T00:00:00Z',
        created_before: '2024-12-31T23:59:59Z',
        updated_after: '2024-01-01T00:00:00Z',
        updated_before: '2024-12-31T23:59:59Z',
      };
      expect(() => SiteFiltersSchema.parse(validFilters)).not.toThrow();
    });

    it('should validate empty filters', () => {
      const validFilters = {};
      expect(() => SiteFiltersSchema.parse(validFilters)).not.toThrow();
    });

    it('should reject invalid datetime', () => {
      const invalidFilters = {
        created_after: 'not-a-datetime',
      };
      expect(() => SiteFiltersSchema.parse(invalidFilters)).toThrow();
    });
  });

  describe('SiteListResultSchema', () => {
    it('should validate complete result', () => {
      const validResult = {
        sites: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Site 1',
            slug: 'site-1',
            settings: {},
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            created_by: '123e4567-e89b-12d3-a456-426614174001',
            updated_by: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
        total: 1,
        hasMore: false,
      };
      expect(() => SiteListResultSchema.parse(validResult)).not.toThrow();
    });

    it('should validate empty result', () => {
      const validResult = {
        sites: [],
        total: 0,
        hasMore: false,
      };
      expect(() => SiteListResultSchema.parse(validResult)).not.toThrow();
    });
  });

  describe('Edge Cases and Malicious Inputs', () => {
    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const site = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: longString,
        slug: 'test',
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174001',
        updated_by: '123e4567-e89b-12d3-a456-426614174001',
      };
      expect(() => SiteSchema.parse(site)).toThrow(); // Should reject long name
    });

    it('should handle special characters in name', () => {
      const site = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Site with <script>alert("xss")</script>',
        slug: 'test',
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174001',
        updated_by: '123e4567-e89b-12d3-a456-426614174001',
      };
      expect(() => SiteSchema.parse(site)).not.toThrow();
    });

    it('should handle unicode characters', () => {
      const site = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '🚀 Site Name 🎉',
        slug: 'test',
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174001',
        updated_by: '123e4567-e89b-12d3-a456-426614174001',
      };
      expect(() => SiteSchema.parse(site)).not.toThrow();
    });

    it('should handle complex settings', () => {
      const site = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Site',
        slug: 'test',
        settings: {
          theme: 'dark',
          language: 'en',
          features: {
            analytics: true,
            cms: true,
            auth: false,
          },
          custom: {
            level1: {
              level2: {
                value: 'deep'
              }
            }
          }
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174001',
        updated_by: '123e4567-e89b-12d3-a456-426614174001',
      };
      expect(() => SiteSchema.parse(site)).not.toThrow();
    });

    it('should handle malicious slug attempts', () => {
      const maliciousSlugs = [
        '../../../etc/passwd',
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
      ];

      maliciousSlugs.forEach(slug => {
        const site = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Test Site',
          slug,
          settings: {},
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          created_by: '123e4567-e89b-12d3-a456-426614174001',
          updated_by: '123e4567-e89b-12d3-a456-426614174001',
        };
        expect(() => SiteSchema.parse(site)).toThrow();
      });
    });
  });
});
