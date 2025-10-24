import { z } from 'zod';

// ================================================
// Request Schemas
// ================================================

export const UpsertUserRequestSchema = z.object({
  anonId: z.string().min(10, "AnonId must be at least 10 characters"), // UUID-like string from client
  traits: z.record(z.string(), z.unknown()).optional(), // non-PII
});

export const StartSessionRequestSchema = z.object({
  anonId: z.string(),
  sessionId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid UUID format"), // client-generated is fine
  landingPage: z.string().regex(/^https?:\/\/.+\..+/, "Invalid URL format"),
  landingPath: z.string(),
  referrer: z.string().nullable().optional().transform(val => val === undefined ? null : val),
  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).partial().optional(),
  device: z.object({
    category: z.enum(['desktop','mobile','tablet','bot','unknown']),
    browserName: z.string(),
    browserVersion: z.string().optional(),
    osName: z.string(),
    osVersion: z.string().optional(),
  }).optional(),
});

export const EndSessionRequestSchema = z.object({
  sessionId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid UUID format"),
});

export const PageviewRequestSchema = z.object({
  sessionId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid UUID format"),
  userId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid UUID format"),
  url: z.string().regex(/^https?:\/\/.+\..+/, "Invalid URL format"),
  path: z.string(),
  title: z.string().optional(),
  referrer: z.string().nullable().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
  occurredAt: z.string().datetime().optional(), // fallback to server now()
});

export const EventRequestSchema = z.object({
  sessionId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid UUID format"),
  userId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid UUID format"),
  name: z.string().min(1),
  label: z.string().optional(),
  valueNum: z.number().optional(),
  valueText: z.string().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
  occurredAt: z.string().datetime().optional(),
});

export const BatchRequestSchema = z.object({
  user: UpsertUserRequestSchema.optional(),
  session: StartSessionRequestSchema.optional(),
  pageviews: z.array(PageviewRequestSchema).optional(),
  events: z.array(EventRequestSchema).optional(),
});

export const UpdateSessionContextRequestSchema = z.object({
  sessionId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid UUID format"),
  geo: z.object({
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
  }).partial().optional(),
  device: StartSessionRequestSchema.shape.device.optional(),
  utm: StartSessionRequestSchema.shape.utm.optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
});

export const HeartbeatRequestSchema = z.object({
  sessionId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid UUID format"),
  userId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid UUID format"),
});

export const AdminExportRequestSchema = z.object({
  entity: z.enum(['users','sessions','events','pageviews']),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  filters: z.record(z.string(), z.unknown()).optional(), // e.g., { eventName:'lead_form_submitted' }
  format: z.enum(['json','csv']).default('json'),
});

// ================================================
// Response Schemas
// ================================================

export const UpsertUserResponseSchema = z.object({
  userId: z.string(),
});

export const StartSessionResponseSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
});

export const EndSessionResponseSchema = z.object({
  ok: z.literal(true),
});

export const PageviewResponseSchema = z.object({
  id: z.number(),
});

export const EventResponseSchema = z.object({
  id: z.number(),
});

export const BatchResponseSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  pageviewIds: z.array(z.number()).optional(),
  eventIds: z.array(z.number()).optional(),
});

export const UpdateSessionContextResponseSchema = z.object({
  ok: z.literal(true),
});

export const HeartbeatResponseSchema = z.object({
  ok: z.literal(true),
  serverTime: z.string(),
});

export const AdminExportResponseSchema = z.object({
  url: z.string().optional(),
  rows: z.array(z.unknown()).optional(),
  count: z.number().optional(),
});

// ================================================
// Error Schemas
// ================================================

export const EdgeFunctionErrorSchema = z.object({
  error: z.string(),
  details: z.unknown().optional(),
});
