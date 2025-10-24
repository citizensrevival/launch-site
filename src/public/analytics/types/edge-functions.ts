/**
 * Edge function request/response types for analytics
 * Extracted from supabase/functions/_lib/validation.ts
 */

// ================================================
// Request Types
// ================================================

export interface UpsertUserRequest {
  anonId: string; // UUID-like string from client
  traits?: Record<string, any>; // non-PII
}

export interface StartSessionRequest {
  anonId: string;
  sessionId: string; // UUID
  landingPage: string; // URL
  landingPath: string;
  referrer?: string | null;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  device?: {
    category: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown';
    browserName: string;
    browserVersion?: string;
    osName: string;
    osVersion?: string;
  };
}

export interface EndSessionRequest {
  sessionId: string; // UUID
}

export interface PageviewRequest {
  sessionId: string; // UUID
  userId: string; // UUID
  url: string; // URL
  path: string;
  title?: string;
  referrer?: string | null;
  properties?: Record<string, any>;
  occurredAt?: string; // ISO datetime
}

export interface EventRequest {
  sessionId: string; // UUID
  userId: string; // UUID
  name: string;
  label?: string;
  valueNum?: number;
  valueText?: string;
  properties?: Record<string, any>;
  occurredAt?: string; // ISO datetime
}

export interface BatchRequest {
  user?: UpsertUserRequest;
  session?: StartSessionRequest;
  pageviews?: PageviewRequest[];
  events?: EventRequest[];
}

export interface UpdateSessionContextRequest {
  sessionId: string; // UUID
  geo?: {
    country?: string;
    region?: string;
    city?: string;
  };
  device?: StartSessionRequest['device'];
  utm?: StartSessionRequest['utm'];
  properties?: Record<string, any>;
}

export interface HeartbeatRequest {
  sessionId: string; // UUID
  userId: string; // UUID
}

export interface AdminExportRequest {
  entity: 'users' | 'sessions' | 'events' | 'pageviews';
  dateFrom?: string; // ISO datetime
  dateTo?: string; // ISO datetime
  filters?: Record<string, any>; // e.g., { eventName:'lead_form_submitted' }
  format?: 'json' | 'csv';
}

// ================================================
// Response Types
// ================================================

export interface UpsertUserResponse {
  userId: string;
}

export interface StartSessionResponse {
  sessionId: string;
  userId: string;
}

export interface EndSessionResponse {
  ok: true;
}

export interface PageviewResponse {
  id: number;
}

export interface EventResponse {
  id: number;
}

export interface BatchResponse {
  userId?: string;
  sessionId?: string;
  pageviewIds?: number[];
  eventIds?: number[];
}

export interface UpdateSessionContextResponse {
  ok: true;
}

export interface HeartbeatResponse {
  ok: true;
  serverTime: string;
}

export interface AdminExportResponse {
  url?: string;
  rows?: unknown[];
  count?: number;
}

// ================================================
// Error Types
// ================================================

export interface EdgeFunctionError {
  error: string;
  details?: any;
}
