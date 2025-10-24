/**
 * Public Analytics types
 * Based on the existing analytics system
 */

export interface AnalyticsUser {
  anonId: string;
  userId?: string;
  traits?: Record<string, any>;
}

export interface AnalyticsSession {
  id: string;
  userId: string;
  landingPage: string;
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
  geo?: {
    country?: string;
    region?: string;
    city?: string;
  };
  properties?: Record<string, any>;
  startedAt: string;
  endedAt?: string;
}

export interface AnalyticsPageview {
  id: number;
  sessionId: string;
  userId: string;
  url: string;
  path: string;
  title?: string;
  referrer?: string | null;
  properties?: Record<string, any>;
  occurredAt: string;
}

export interface AnalyticsEvent {
  id: number;
  sessionId: string;
  userId: string;
  name: string;
  label?: string;
  valueNum?: number;
  valueText?: string;
  properties?: Record<string, any>;
  occurredAt: string;
}

export interface AnalyticsContext {
  user: AnalyticsUser | null;
  session: AnalyticsSession | null;
}

export interface TrackPageviewInput {
  url: string;
  path: string;
  title?: string;
  referrer?: string;
  properties?: Record<string, any>;
}

export interface TrackEventInput {
  name: string;
  label?: string;
  valueNum?: number;
  valueText?: string;
  properties?: Record<string, any>;
}

export interface StartSessionInput {
  landingPage: string;
  landingPath: string;
  referrer?: string | null;
  utm?: AnalyticsSession['utm'];
  device?: AnalyticsSession['device'];
}

export interface UpdateSessionContextInput {
  geo?: AnalyticsSession['geo'];
  device?: AnalyticsSession['device'];
  utm?: AnalyticsSession['utm'];
  properties?: Record<string, any>;
}
