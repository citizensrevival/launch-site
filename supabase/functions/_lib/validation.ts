import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// ================================================
// Request/Response Schemas
// ================================================

export const UpsertUserReq = z.object({
  anonId: z.string().min(10),            // UUID-like string from client
  traits: z.record(z.any()).optional(),  // non-PII
})
export type UpsertUserRes = { userId: string }

export const StartSessionReq = z.object({
  anonId: z.string(),
  sessionId: z.string().uuid(),          // client-generated is fine
  landingPage: z.string().url(),
  landingPath: z.string(),
  referrer: z.string().nullable(),
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
})
export type StartSessionRes = { sessionId: string; userId: string }

export const EndSessionReq = z.object({
  sessionId: z.string().uuid(),
})
export type EndSessionRes = { ok: true }

export const PageviewReq = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  url: z.string().url(),
  path: z.string(),
  title: z.string().optional(),
  referrer: z.string().nullable().optional(),
  properties: z.record(z.any()).optional(),
  occurredAt: z.string().datetime().optional(), // fallback to server now()
})
export type PageviewRes = { id: number }

export const EventReq = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1),
  label: z.string().optional(),
  valueNum: z.number().optional(),
  valueText: z.string().optional(),
  properties: z.record(z.any()).optional(),
  occurredAt: z.string().datetime().optional(),
})
export type EventRes = { id: number }

export const BatchReq = z.object({
  user: UpsertUserReq.optional(),
  session: StartSessionReq.optional(),
  pageviews: z.array(PageviewReq).optional(),
  events: z.array(EventReq).optional(),
})
export type BatchRes = {
  userId?: string;
  sessionId?: string;
  pageviewIds?: number[];
  eventIds?: number[];
}

export const UpdateSessionContextReq = z.object({
  sessionId: z.string().uuid(),
  geo: z.object({
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
  }).partial().optional(),
  device: StartSessionReq.shape.device.optional(),
  utm: StartSessionReq.shape.utm.optional(),
  properties: z.record(z.any()).optional(),
})
export type UpdateSessionContextRes = { ok: true }

export const HeartbeatReq = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
})
export type HeartbeatRes = { ok: true; serverTime: string }

export const AdminExportReq = z.object({
  entity: z.enum(['users','sessions','events','pageviews']),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  filters: z.record(z.any()).optional(), // e.g., { eventName:'lead_form_submitted' }
  format: z.enum(['json','csv']).default('json'),
})
export type AdminExportRes = { url?: string; rows?: unknown[]; count?: number }
