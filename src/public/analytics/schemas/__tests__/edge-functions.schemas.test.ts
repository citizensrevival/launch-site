import { describe, it, expect } from 'vitest';
import {
  UpsertUserRequestSchema,
  StartSessionRequestSchema,
  EndSessionRequestSchema,
  PageviewRequestSchema,
  EventRequestSchema,
  BatchRequestSchema,
  UpdateSessionContextRequestSchema,
  HeartbeatRequestSchema,
  AdminExportRequestSchema,
  UpsertUserResponseSchema,
  StartSessionResponseSchema,
  EndSessionResponseSchema,
  PageviewResponseSchema,
  EventResponseSchema,
  BatchResponseSchema,
  UpdateSessionContextResponseSchema,
  HeartbeatResponseSchema,
  AdminExportResponseSchema,
  EdgeFunctionErrorSchema,
} from '../edge-functions.schemas';

describe('Analytics Edge Function Schemas', () => {
  describe('UpsertUserRequestSchema', () => {
    it('should validate valid request', () => {
      const validRequest = {
        anonId: 'anon_1234567890',
        traits: { source: 'web' }
      };
      expect(() => UpsertUserRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should validate request without traits', () => {
      const validRequest = {
        anonId: 'anon_1234567890'
      };
      expect(() => UpsertUserRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should reject invalid anonId', () => {
      const invalidRequest = {
        anonId: 'short'
      };
      expect(() => UpsertUserRequestSchema.parse(invalidRequest)).toThrow();
    });

    it('should reject missing anonId', () => {
      const invalidRequest = {};
      expect(() => UpsertUserRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe('StartSessionRequestSchema', () => {
    it('should validate valid request', () => {
      const validRequest = {
        anonId: 'anon_1234567890',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        landingPage: 'https://example.com',
        landingPath: '/',
        referrer: 'https://google.com',
        utm: {
          source: 'google',
          medium: 'cpc',
          campaign: 'test'
        },
        device: {
          category: 'desktop' as const,
          browserName: 'Chrome',
          browserVersion: '91.0',
          osName: 'Windows',
          osVersion: '10'
        }
      };
      expect(() => StartSessionRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should validate minimal request', () => {
      const validRequest = {
        anonId: 'anon_1234567890',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        landingPage: 'https://example.com',
        landingPath: '/'
      };
      expect(() => StartSessionRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should reject invalid UUID', () => {
      const invalidRequest = {
        anonId: 'anon_1234567890',
        sessionId: 'not-a-uuid',
        landingPage: 'https://example.com',
        landingPath: '/'
      };
      expect(() => StartSessionRequestSchema.parse(invalidRequest)).toThrow();
    });

    it('should reject invalid URL', () => {
      const invalidRequest = {
        anonId: 'anon_1234567890',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        landingPage: 'not-a-url',
        landingPath: '/'
      };
      expect(() => StartSessionRequestSchema.parse(invalidRequest)).toThrow();
    });

    it('should reject invalid device category', () => {
      const invalidRequest = {
        anonId: 'anon_1234567890',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        landingPage: 'https://example.com',
        landingPath: '/',
        device: {
          category: 'invalid' as any,
          browserName: 'Chrome',
          osName: 'Windows'
        }
      };
      expect(() => StartSessionRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe('EndSessionRequestSchema', () => {
    it('should validate valid request', () => {
      const validRequest = {
        sessionId: '123e4567-e89b-12d3-a456-426614174000'
      };
      expect(() => EndSessionRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should reject invalid UUID', () => {
      const invalidRequest = {
        sessionId: 'not-a-uuid'
      };
      expect(() => EndSessionRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe('PageviewRequestSchema', () => {
    it('should validate valid request', () => {
      const validRequest = {
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        url: 'https://example.com/page',
        path: '/page',
        title: 'Test Page',
        referrer: 'https://google.com',
        properties: { source: 'organic' },
        occurredAt: '2024-01-01T00:00:00Z'
      };
      expect(() => PageviewRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should validate minimal request', () => {
      const validRequest = {
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        url: 'https://example.com/page',
        path: '/page'
      };
      expect(() => PageviewRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should reject invalid datetime', () => {
      const invalidRequest = {
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        url: 'https://example.com/page',
        path: '/page',
        occurredAt: 'not-a-datetime'
      };
      expect(() => PageviewRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe('EventRequestSchema', () => {
    it('should validate valid request', () => {
      const validRequest = {
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'button_click',
        label: 'header_cta',
        valueNum: 1,
        properties: { element: 'button' },
        occurredAt: '2024-01-01T00:00:00Z'
      };
      expect(() => EventRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should validate minimal request', () => {
      const validRequest = {
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'button_click'
      };
      expect(() => EventRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should reject empty name', () => {
      const invalidRequest = {
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        name: ''
      };
      expect(() => EventRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe('BatchRequestSchema', () => {
    it('should validate valid request', () => {
      const validRequest = {
        user: {
          anonId: 'anon_1234567890',
          traits: { source: 'web' }
        },
        session: {
          anonId: 'anon_1234567890',
          sessionId: '123e4567-e89b-12d3-a456-426614174000',
          landingPage: 'https://example.com',
          landingPath: '/'
        },
        pageviews: [{
          sessionId: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174001',
          url: 'https://example.com/page',
          path: '/page'
        }],
        events: [{
          sessionId: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174001',
          name: 'button_click'
        }]
      };
      expect(() => BatchRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should validate empty request', () => {
      const validRequest = {};
      expect(() => BatchRequestSchema.parse(validRequest)).not.toThrow();
    });
  });

  describe('UpdateSessionContextRequestSchema', () => {
    it('should validate valid request', () => {
      const validRequest = {
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        geo: {
          country: 'US',
          region: 'CA',
          city: 'San Francisco'
        },
        device: {
          category: 'desktop' as const,
          browserName: 'Chrome',
          osName: 'Windows'
        },
        utm: {
          source: 'google',
          medium: 'cpc'
        },
        properties: { custom: 'value' }
      };
      expect(() => UpdateSessionContextRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should validate minimal request', () => {
      const validRequest = {
        sessionId: '123e4567-e89b-12d3-a456-426614174000'
      };
      expect(() => UpdateSessionContextRequestSchema.parse(validRequest)).not.toThrow();
    });
  });

  describe('HeartbeatRequestSchema', () => {
    it('should validate valid request', () => {
      const validRequest = {
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001'
      };
      expect(() => HeartbeatRequestSchema.parse(validRequest)).not.toThrow();
    });
  });

  describe('AdminExportRequestSchema', () => {
    it('should validate valid request', () => {
      const validRequest = {
        entity: 'events' as const,
        dateFrom: '2024-01-01T00:00:00Z',
        dateTo: '2024-01-31T23:59:59Z',
        filters: { eventName: 'lead_form_submitted' },
        format: 'json' as const
      };
      expect(() => AdminExportRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should validate minimal request', () => {
      const validRequest = {
        entity: 'users' as const
      };
      expect(() => AdminExportRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should reject invalid entity', () => {
      const invalidRequest = {
        entity: 'invalid' as any
      };
      expect(() => AdminExportRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe('Response Schemas', () => {
    it('should validate UpsertUserResponse', () => {
      const validResponse = { userId: '123e4567-e89b-12d3-a456-426614174001' };
      expect(() => UpsertUserResponseSchema.parse(validResponse)).not.toThrow();
    });

    it('should validate StartSessionResponse', () => {
      const validResponse = {
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001'
      };
      expect(() => StartSessionResponseSchema.parse(validResponse)).not.toThrow();
    });

    it('should validate EndSessionResponse', () => {
      const validResponse = { ok: true };
      expect(() => EndSessionResponseSchema.parse(validResponse)).not.toThrow();
    });

    it('should validate PageviewResponse', () => {
      const validResponse = { id: 123 };
      expect(() => PageviewResponseSchema.parse(validResponse)).not.toThrow();
    });

    it('should validate EventResponse', () => {
      const validResponse = { id: 456 };
      expect(() => EventResponseSchema.parse(validResponse)).not.toThrow();
    });

    it('should validate BatchResponse', () => {
      const validResponse = {
        userId: '123e4567-e89b-12d3-a456-426614174001',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        pageviewIds: [1, 2, 3],
        eventIds: [4, 5, 6]
      };
      expect(() => BatchResponseSchema.parse(validResponse)).not.toThrow();
    });

    it('should validate UpdateSessionContextResponse', () => {
      const validResponse = { ok: true };
      expect(() => UpdateSessionContextResponseSchema.parse(validResponse)).not.toThrow();
    });

    it('should validate HeartbeatResponse', () => {
      const validResponse = {
        ok: true,
        serverTime: '2024-01-01T00:00:00Z'
      };
      expect(() => HeartbeatResponseSchema.parse(validResponse)).not.toThrow();
    });

    it('should validate AdminExportResponse', () => {
      const validResponse = {
        url: 'https://example.com/export.csv',
        rows: [{ id: 1, name: 'test' }],
        count: 100
      };
      expect(() => AdminExportResponseSchema.parse(validResponse)).not.toThrow();
    });
  });

  describe('Error Schemas', () => {
    it('should validate EdgeFunctionError', () => {
      const validError = {
        error: 'Validation failed',
        details: { field: 'sessionId', message: 'Invalid UUID' }
      };
      expect(() => EdgeFunctionErrorSchema.parse(validError)).not.toThrow();
    });

    it('should validate error without details', () => {
      const validError = {
        error: 'Internal server error'
      };
      expect(() => EdgeFunctionErrorSchema.parse(validError)).not.toThrow();
    });
  });

  describe('Edge Cases and Malicious Inputs', () => {
    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const request = {
        anonId: longString,
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        landingPage: 'https://example.com',
        landingPath: '/'
      };
      expect(() => StartSessionRequestSchema.parse(request)).not.toThrow();
    });

    it('should handle special characters in strings', () => {
      const specialString = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const request = {
        anonId: 'anon_1234567890',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        landingPage: 'https://example.com',
        landingPath: specialString
      };
      expect(() => StartSessionRequestSchema.parse(request)).not.toThrow();
    });

    it('should handle unicode characters', () => {
      const unicodeString = '🚀🎉💻';
      const request = {
        anonId: 'anon_1234567890',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        landingPage: 'https://example.com',
        landingPath: unicodeString
      };
      expect(() => StartSessionRequestSchema.parse(request)).not.toThrow();
    });

    it('should handle null and undefined values', () => {
      const request = {
        anonId: 'anon_1234567890',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        landingPage: 'https://example.com',
        landingPath: '/',
        referrer: null,
        utm: undefined,
        device: undefined
      };
      expect(() => StartSessionRequestSchema.parse(request)).not.toThrow();
    });

    it('should handle empty objects', () => {
      const request = {
        anonId: 'anon_1234567890',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        landingPage: 'https://example.com',
        landingPath: '/',
        utm: {},
        properties: {}
      };
      expect(() => StartSessionRequestSchema.parse(request)).not.toThrow();
    });

    it('should handle deeply nested objects', () => {
      const request = {
        anonId: 'anon_1234567890',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        landingPage: 'https://example.com',
        landingPath: '/',
        properties: {
          level1: {
            level2: {
              level3: {
                value: 'deep'
              }
            }
          }
        }
      };
      expect(() => StartSessionRequestSchema.parse(request)).not.toThrow();
    });
  });
});
