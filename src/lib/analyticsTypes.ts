// ================================================
// Citizens Revival Analytics Tracker Interfaces
// ================================================

/**
 * Represents the identifying and contextual information
 * about the user's browser/device.
 */
export interface AnalyticsUser {
  anonId: string;             // Persistent UUID stored in localStorage or cookie
  userId?: string;             // UUID returned from backend after upsert
  firstSeenAt?: string;       // ISO string
  lastSeenAt?: string;
  isReturning?: boolean;
}

/**
 * Represents a single browsing session.
 */
export interface AnalyticsSession {
  sessionId: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  referrer?: string;
  landingPage?: string;
  landingPath?: string;
  utm?: Partial<UTMParams>;
  device?: DeviceInfo;
  geo?: GeoInfo;
}

/**
 * UTM parameters extracted from URL.
 */
export interface UTMParams {
  source: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

/**
 * Basic device / user agent info.
 */
export interface DeviceInfo {
  category: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown';
  browserName: string;
  browserVersion?: string;
  osName: string;
  osVersion?: string;
}

/**
 * Basic geolocation info (from IP or external API).
 */
export interface GeoInfo {
  country?: string;
  region?: string;
  city?: string;
}

/**
 * Represents a single custom event (e.g. button click, form submit).
 */
export interface AnalyticsEvent {
  name: string;                     // e.g. "lead_form_submitted"
  label?: string;                   // Human-readable label
  valueNum?: number;                // Optional numeric metric
  valueText?: string;               // Optional text value
  properties?: Record<string, any>; // Extra structured metadata
}

/**
 * Represents a pageview entry.
 */
export interface PageviewEvent {
  url: string;
  path: string;
  title?: string;
  referrer?: string;
  properties?: Record<string, any>;
}

// ================================================
// Public Tracker API
// ================================================

/**
 * The public API exposed by your frontend analytics tracker.
 */
export interface AnalyticsTracker {
  /** Initialize tracker — creates or restores user & session context. */
  init(): Promise<void>;

  /** Identify current user with a stable anonId (optional custom override). */
  identify(anonId?: string): Promise<void>;

  /** Manually start a new session (optional; usually automatic). */
  startSession(): Promise<void>;

  /** End current session (flush events, mark ended_at). */
  endSession(): Promise<void>;

  /** Track a pageview (e.g., on React Router route change). */
  trackPageview(event: PageviewEvent): Promise<void>;

  /** Track a custom event (click, form submission, etc.). */
  trackEvent(event: AnalyticsEvent): Promise<void>;

  /** Attach session-level metadata (e.g. after async location lookup). */
  updateSessionContext(context: Partial<Pick<AnalyticsSession, 'geo' | 'device' | 'utm'>>): Promise<void>;

  /** Return current context (useful for debugging or local dashboards). */
  getContext(): {
    user: AnalyticsUser | null;
    session: AnalyticsSession | null;
  };

  /** Optional: flush all pending events to Supabase manually. */
  flush(): Promise<void>;

  /** Optional: clear stored identifiers (e.g., GDPR "forget me"). */
  reset(): Promise<void>;
}

// ================================================
// API Response Types
// ================================================

export interface UpsertUserResponse {
  userId: string;
}

export interface StartSessionResponse {
  sessionId: string;
  userId: string;
}

export interface EndSessionResponse {
  ok: boolean;
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
  ok: boolean;
}

export interface HeartbeatResponse {
  ok: boolean;
  serverTime: string;
}
