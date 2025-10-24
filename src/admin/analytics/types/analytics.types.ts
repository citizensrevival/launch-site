// Analytics types for admin dashboard
export interface UsersData {
  total: number;
  new: number;
  returning: number;
  active: number;
  users: AnalyticsUser[];
  newUsersOverTime: Array<{
    date: string;
    count: number;
  }>;
  newVsReturning: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export interface AnalyticsOverview {
  users: UsersData;
  sessions: {
    total: number;
    active: number;
    avgDuration: number;
  };
  events: {
    total: number;
    topEvents: Array<{
      name: string;
      count: number;
    }>;
  };
  uniqueUsers: number;
  totalSessions: number;
  totalPageviews: number;
  totalEvents: number;
  uniqueUsersOverTime: Array<{
    date: string;
    count: number;
  }>;
  sessionsOverTime: Array<{
    date: string;
    count: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  newVsReturning: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  topPages: Array<{
    page: string;
    views: number;
    percentage: number;
  }>;
}

export interface SessionData {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  pageViews: number;
  events: number;
}

export interface EventData {
  id: string;
  sessionId: string;
  userId: string;
  name: string;
  properties: Record<string, any>;
  timestamp: string;
  count: number;
  uniqueUsers: number;
  conversionRate: number;
  lastOccurred: string;
}

export interface Referrer {
  id: string;
  domain: string;
  url: string;
  count: number;
  percentage: number;
  totalSessions: number;
  totalUsers: number;
  conversions: number;
  avgSessionDuration: number;
  bounceRate: number;
  pagesPerSession: number;
  sessions: number;
  trafficShare: number;
  lastSeen: string;
}

export interface ReferrersData {
  total: number;
  referrers: Referrer[];
  totalReferrals: number;
  referralTrafficPercentage: number;
  topReferrers: Referrer[];
  referralTrafficOverTime: Array<{
    date: string;
    count: number;
  }>;
  trafficShare: Array<{
    domain: string;
    percentage: number;
  }>;
}

export interface AnalyticsSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  pageViews: number;
  events: number;
  userAgent: string;
  referrer?: string;
  country?: string;
  city?: string;
  ipAddress?: string;
  deviceCategory?: string;
  geoCountry?: string;
  landingPage?: string;
  browserName?: string;
  osName?: string;
  geoCity?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface SessionsData {
  total: number;
  sessions: AnalyticsSession[];
}

export interface AnalyticsUser {
  id: string;
  userId: string;
  anonId?: string;
  firstSeen: string;
  lastSeen: string;
  totalSessions: number;
  totalPageviews: number;
  totalEvents: number;
  avgSessionDuration: number;
  bounceRate: number;
  pagesPerSession: number;
  deviceCategory: string;
  geoCountry: string;
  geoCity: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  hasLead?: boolean;
  browserName?: string;
  osName?: string;
  firstReferrer?: string;
  userSessions?: AnalyticsSession[];
}
