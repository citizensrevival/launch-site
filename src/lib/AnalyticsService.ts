import { TimeRange } from '../store/slices/adminSlice'

// ================================================
// Analytics Data Types
// ================================================

export interface AnalyticsUser {
  id: string
  anonId: string
  firstSeenAt: string
  lastSeenAt: string
  sessions: number
  avgDuration: number
  hasLead: boolean
  firstReferrer?: string
  lastReferrer?: string
  firstUtmSource?: string
  lastUtmSource?: string
  deviceCategory?: string
  browserName?: string
  osName?: string
  geoCountry?: string
  geoCity?: string
  userSessions?: UserSession[]
}

export interface UserSession {
  id: string
  startedAt: string
  endedAt?: string
  duration: number
  pageviews: number
  events: number
  landingPage: string
  deviceCategory: string
  geoCountry?: string
  geoCity?: string
}

export interface AnalyticsSession {
  id: string
  userId: string
  startedAt: string
  endedAt?: string
  duration: number
  pageviews: number
  events: number
  landingPage: string
  referrer?: string
  deviceCategory: string
  browserName: string
  osName: string
  geoCountry?: string
  geoCity?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  ipAddress?: string
  userAgent?: string
}

export interface AnalyticsEvent {
  name: string
  label: string
  count: number
  uniqueUsers: number
  conversionRate: number
  lastOccurred: string
}

export interface Referrer {
  domain: string
  totalSessions: number
  totalUsers: number
  conversions: number
  avgSessionDuration: number
  bounceRate: number
  pagesPerSession: number
  lastSeen: string
  trafficShare: number
}

export interface AnalyticsOverviewData {
  uniqueUsers: number
  totalSessions: number
  totalPageviews: number
  totalEvents: number
  uniqueUsersOverTime: Array<{ day: string; unique_users: number }>
  sessionsOverTime: Array<{ day: string; sessions: number }>
  topPages: Array<{ path: string; views: number }>
  deviceBreakdown: Array<{ category: string; count: number }>
  newVsReturning: Array<{ type: string; count: number }>
}

export interface UsersData {
  users: AnalyticsUser[]
  newUsersOverTime: Array<{ day: string; new_users: number }>
  newVsReturning: Array<{ type: string; count: number }>
}

export interface SessionsData {
  sessions: AnalyticsSession[]
  sessionsPerUser: Array<{ sessions: number; users: number }>
  avgSessionLength: number
  avgPagesPerSession: number
}

export interface EventsData {
  events: AnalyticsEvent[]
  eventTrends: Array<{ day: string; [key: string]: number | string }>
  topEvents: Array<{ name: string; count: number }>
}

export interface ReferrersData {
  referrers: Referrer[]
  referralTrafficOverTime: Array<{ day: string; referrals: number }>
  trafficShare: Array<{ source: string; count: number }>
  totalReferrals: number
  referralTrafficPercentage: number
  topReferrers: Array<{ domain: string; sessions: number }>
}

// ================================================
// Analytics Service Class
// ================================================

export class AnalyticsService {
  private static instance: AnalyticsService
  private testData: {
    users: AnalyticsUser[]
    sessions: AnalyticsSession[]
    events: AnalyticsEvent[]
    referrers: Referrer[]
  }

  private constructor() {
    this.testData = this.generateTestData()
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  // ================================================
  // Public API Methods
  // ================================================

  public async getAnalyticsOverview(timeRange: TimeRange): Promise<AnalyticsOverviewData> {
    // Simulate API delay
    await this.delay(300)
    
    const { users, sessions, events } = this.testData
    const dateRange = this.getDateRange(timeRange)
    
    return {
      uniqueUsers: users.length,
      totalSessions: sessions.length,
      totalPageviews: sessions.reduce((sum, s) => sum + s.pageviews, 0),
      totalEvents: events.reduce((sum, e) => sum + e.count, 0),
      uniqueUsersOverTime: this.generateTimeSeriesData(dateRange, 'unique_users'),
      sessionsOverTime: this.generateTimeSeriesData(dateRange, 'sessions'),
      topPages: this.getTopPages(sessions),
      deviceBreakdown: this.getDeviceBreakdown(sessions),
      newVsReturning: this.getNewVsReturningUsers(users)
    }
  }

  public async getUsersData(timeRange: TimeRange): Promise<UsersData> {
    await this.delay(200)
    
    const { users } = this.testData
    const dateRange = this.getDateRange(timeRange)
    
    return {
      users: this.filterUsersByTimeRange(users, dateRange),
      newUsersOverTime: this.generateTimeSeriesData(dateRange, 'new_users'),
      newVsReturning: this.getNewVsReturningUsers(users)
    }
  }

  public async getSessionsData(timeRange: TimeRange): Promise<SessionsData> {
    await this.delay(250)
    
    const { sessions } = this.testData
    const dateRange = this.getDateRange(timeRange)
    const filteredSessions = this.filterSessionsByTimeRange(sessions, dateRange)
    
    return {
      sessions: filteredSessions,
      sessionsPerUser: this.getSessionsPerUserDistribution(filteredSessions),
      avgSessionLength: this.calculateAverageSessionLength(filteredSessions),
      avgPagesPerSession: this.calculateAveragePagesPerSession(filteredSessions)
    }
  }

  public async getEventsData(timeRange: TimeRange): Promise<EventsData> {
    await this.delay(200)
    
    const { events } = this.testData
    const dateRange = this.getDateRange(timeRange)
    
    return {
      events: this.filterEventsByTimeRange(events, dateRange),
      eventTrends: this.generateEventTrendsData(dateRange),
      topEvents: this.getTopEvents(events)
    }
  }

  public async getReferrersData(timeRange: TimeRange): Promise<ReferrersData> {
    await this.delay(250)
    
    const { referrers, sessions } = this.testData
    const dateRange = this.getDateRange(timeRange)
    const filteredSessions = this.filterSessionsByTimeRange(sessions, dateRange)
    
    return {
      referrers: this.filterReferrersByTimeRange(referrers, dateRange),
      referralTrafficOverTime: this.generateReferralTrafficData(dateRange),
      trafficShare: this.getTrafficShare(filteredSessions),
      totalReferrals: this.calculateTotalReferrals(filteredSessions),
      referralTrafficPercentage: this.calculateReferralTrafficPercentage(filteredSessions),
      topReferrers: this.getTopReferrers(filteredSessions)
    }
  }

  public async getSessionDetail(sessionId: string): Promise<AnalyticsSession | null> {
    await this.delay(100)
    
    return this.testData.sessions.find(s => s.id === sessionId) || null
  }

  public async getUserDetail(userId: string): Promise<AnalyticsUser | null> {
    await this.delay(100)
    
    return this.testData.users.find(u => u.id === userId) || null
  }

  // ================================================
  // Private Helper Methods
  // ================================================

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private getDateRange(timeRange: TimeRange): { start: Date; end: Date } {
    const now = new Date()
    const end = new Date(now)
    
    let start: Date
    switch (timeRange) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case '7days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        start = new Date(now.getFullYear(), 0, 1)
        break
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    
    return { start, end }
  }

  private generateTimeSeriesData(dateRange: { start: Date; end: Date }, type: string): Array<{ day: string; [key: string]: number }> {
    const days: Array<{ day: string; [key: string]: number }> = []
    const current = new Date(dateRange.start)
    
    while (current <= dateRange.end) {
      const dayStr = current.toISOString().split('T')[0]
      let value = 0
      
      switch (type) {
        case 'unique_users':
          value = Math.floor(Math.random() * 50) + 20
          break
        case 'sessions':
          value = Math.floor(Math.random() * 80) + 30
          break
        case 'new_users':
          value = Math.floor(Math.random() * 40) + 15
          break
        default:
          value = Math.floor(Math.random() * 30) + 10
      }
      
      const dayData: { day: string; [key: string]: number } = { day: dayStr }
      dayData[type] = value
      days.push(dayData)
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  private generateEventTrendsData(dateRange: { start: Date; end: Date }): Array<{ day: string; [key: string]: number | string }> {
    const days = []
    const current = new Date(dateRange.start)
    
    while (current <= dateRange.end) {
      const dayStr = current.toISOString().split('T')[0]
      days.push({
        day: dayStr,
        lead_form_submitted: Math.floor(Math.random() * 20) + 5,
        cta_click: Math.floor(Math.random() * 50) + 20,
        video_play: Math.floor(Math.random() * 15) + 5,
        download_started: Math.floor(Math.random() * 10) + 2
      })
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  private generateReferralTrafficData(dateRange: { start: Date; end: Date }): Array<{ day: string; referrals: number }> {
    const days = []
    const current = new Date(dateRange.start)
    
    while (current <= dateRange.end) {
      const dayStr = current.toISOString().split('T')[0]
      days.push({
        day: dayStr,
        referrals: Math.floor(Math.random() * 30) + 10
      })
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  private filterUsersByTimeRange(users: AnalyticsUser[], dateRange: { start: Date; end: Date }): AnalyticsUser[] {
    return users.filter(user => {
      const firstSeen = new Date(user.firstSeenAt)
      return firstSeen >= dateRange.start && firstSeen <= dateRange.end
    })
  }

  private filterSessionsByTimeRange(sessions: AnalyticsSession[], dateRange: { start: Date; end: Date }): AnalyticsSession[] {
    return sessions.filter(session => {
      const startedAt = new Date(session.startedAt)
      return startedAt >= dateRange.start && startedAt <= dateRange.end
    })
  }

  private filterEventsByTimeRange(events: AnalyticsEvent[], dateRange: { start: Date; end: Date }): AnalyticsEvent[] {
    return events.filter(event => {
      const lastOccurred = new Date(event.lastOccurred)
      return lastOccurred >= dateRange.start && lastOccurred <= dateRange.end
    })
  }

  private filterReferrersByTimeRange(referrers: Referrer[], dateRange: { start: Date; end: Date }): Referrer[] {
    return referrers.filter(referrer => {
      const lastSeen = new Date(referrer.lastSeen)
      return lastSeen >= dateRange.start && lastSeen <= dateRange.end
    })
  }

  private getTopPages(sessions: AnalyticsSession[]): Array<{ path: string; views: number }> {
    const pageViews: { [path: string]: number } = {}
    
    sessions.forEach(session => {
      const path = new URL(session.landingPage).pathname
      pageViews[path] = (pageViews[path] || 0) + session.pageviews
    })
    
    return Object.entries(pageViews)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
  }

  private getDeviceBreakdown(sessions: AnalyticsSession[]): Array<{ category: string; count: number }> {
    const breakdown: { [category: string]: number } = {}
    
    sessions.forEach(session => {
      breakdown[session.deviceCategory] = (breakdown[session.deviceCategory] || 0) + 1
    })
    
    return Object.entries(breakdown)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
  }

  private getNewVsReturningUsers(users: AnalyticsUser[]): Array<{ type: string; count: number }> {
    const newUsers = users.filter(user => {
      const firstSeen = new Date(user.firstSeenAt)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return firstSeen >= thirtyDaysAgo
    }).length
    
    const returningUsers = users.length - newUsers
    
    return [
      { type: 'New Users', count: newUsers },
      { type: 'Returning Users', count: returningUsers }
    ]
  }

  private getSessionsPerUserDistribution(sessions: AnalyticsSession[]): Array<{ sessions: number; users: number }> {
    const userSessionCounts: { [userId: string]: number } = {}
    
    sessions.forEach(session => {
      userSessionCounts[session.userId] = (userSessionCounts[session.userId] || 0) + 1
    })
    
    const distribution: { [sessionCount: number]: number } = {}
    Object.values(userSessionCounts).forEach(count => {
      distribution[count] = (distribution[count] || 0) + 1
    })
    
    return Object.entries(distribution)
      .map(([sessions, users]) => ({ sessions: parseInt(sessions), users }))
      .sort((a, b) => a.sessions - b.sessions)
  }

  private calculateAverageSessionLength(sessions: AnalyticsSession[]): number {
    if (sessions.length === 0) return 0
    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0)
    return Math.round(totalDuration / sessions.length)
  }

  private calculateAveragePagesPerSession(sessions: AnalyticsSession[]): number {
    if (sessions.length === 0) return 0
    const totalPages = sessions.reduce((sum, session) => sum + session.pageviews, 0)
    return Math.round((totalPages / sessions.length) * 10) / 10
  }

  private getTopEvents(events: AnalyticsEvent[]): Array<{ name: string; count: number }> {
    return events
      .map(event => ({ name: event.label, count: event.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
  }

  private getTrafficShare(sessions: AnalyticsSession[]): Array<{ source: string; count: number }> {
    const sources: { [source: string]: number } = {}
    
    sessions.forEach(session => {
      let source = 'Direct'
      if (session.referrer) {
        if (session.referrer.includes('google')) source = 'Google'
        else if (session.referrer.includes('facebook')) source = 'Facebook'
        else if (session.referrer.includes('twitter')) source = 'Twitter'
        else if (session.referrer.includes('linkedin')) source = 'LinkedIn'
        else if (session.referrer.includes('reddit')) source = 'Reddit'
        else source = 'Other'
      }
      
      sources[source] = (sources[source] || 0) + 1
    })
    
    return Object.entries(sources)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
  }

  private calculateTotalReferrals(sessions: AnalyticsSession[]): number {
    return sessions.filter(session => session.referrer).length
  }

  private calculateReferralTrafficPercentage(sessions: AnalyticsSession[]): number {
    if (sessions.length === 0) return 0
    const referralSessions = sessions.filter(session => session.referrer).length
    return Math.round((referralSessions / sessions.length) * 100 * 10) / 10
  }

  private getTopReferrers(sessions: AnalyticsSession[]): Array<{ domain: string; sessions: number }> {
    const referrerCounts: { [domain: string]: number } = {}
    
    sessions.forEach(session => {
      if (session.referrer) {
        try {
          const domain = new URL(session.referrer).hostname
          referrerCounts[domain] = (referrerCounts[domain] || 0) + 1
        } catch {
          // Invalid URL, skip
        }
      }
    })
    
    return Object.entries(referrerCounts)
      .map(([domain, sessions]) => ({ domain, sessions }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 3)
  }

  // ================================================
  // Test Data Generation
  // ================================================

  private generateTestData() {
    const users: AnalyticsUser[] = [
      {
        id: '1',
        anonId: 'anon_abc123',
        firstSeenAt: '2024-01-01T10:00:00Z',
        lastSeenAt: '2024-01-07T15:30:00Z',
        sessions: 12,
        avgDuration: 245,
        hasLead: true,
        firstReferrer: 'https://google.com',
        lastReferrer: 'https://facebook.com',
        firstUtmSource: 'google',
        lastUtmSource: 'facebook',
        deviceCategory: 'desktop',
        browserName: 'Chrome',
        osName: 'Windows',
        geoCountry: 'United States',
        geoCity: 'New York',
        userSessions: [
          {
            id: 'session_1a',
            startedAt: '2024-01-01T10:00:00Z',
            endedAt: '2024-01-01T10:15:00Z',
            duration: 900,
            pageviews: 5,
            events: 3,
            landingPage: 'https://example.com/',
            deviceCategory: 'desktop',
            geoCountry: 'US',
            geoCity: 'New York'
          }
        ]
      },
      {
        id: '2',
        anonId: 'anon_def456',
        firstSeenAt: '2024-01-02T14:20:00Z',
        lastSeenAt: '2024-01-07T09:15:00Z',
        sessions: 8,
        avgDuration: 180,
        hasLead: false,
        firstReferrer: 'https://twitter.com',
        lastReferrer: 'https://linkedin.com',
        firstUtmSource: 'twitter',
        lastUtmSource: 'linkedin',
        deviceCategory: 'mobile',
        browserName: 'Safari',
        osName: 'iOS',
        geoCountry: 'Canada',
        geoCity: 'Toronto'
      }
    ]

    const sessions: AnalyticsSession[] = [
      {
        id: 'session_1',
        userId: 'anon_abc123',
        startedAt: '2024-01-07T10:00:00Z',
        endedAt: '2024-01-07T10:15:00Z',
        duration: 900,
        pageviews: 5,
        events: 3,
        landingPage: 'https://example.com/',
        referrer: 'https://google.com',
        deviceCategory: 'desktop',
        browserName: 'Chrome',
        osName: 'Windows',
        geoCountry: 'US',
        geoCity: 'New York',
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'brand',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 'session_2',
        userId: 'anon_def456',
        startedAt: '2024-01-07T14:20:00Z',
        endedAt: '2024-01-07T14:35:00Z',
        duration: 900,
        pageviews: 3,
        events: 1,
        landingPage: 'https://example.com/about',
        referrer: 'https://facebook.com',
        deviceCategory: 'mobile',
        browserName: 'Safari',
        osName: 'iOS',
        geoCountry: 'CA',
        geoCity: 'Toronto',
        utmSource: 'facebook',
        utmMedium: 'social',
        utmCampaign: 'awareness',
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      }
    ]

    const events: AnalyticsEvent[] = [
      {
        name: 'lead_form_submitted',
        label: 'Lead Form Submitted',
        count: 234,
        uniqueUsers: 189,
        conversionRate: 15.2,
        lastOccurred: '2024-01-07T16:30:00Z'
      },
      {
        name: 'cta_click',
        label: 'CTA Clicked',
        count: 567,
        uniqueUsers: 445,
        conversionRate: 8.7,
        lastOccurred: '2024-01-07T15:45:00Z'
      }
    ]

    const referrers: Referrer[] = [
      {
        domain: 'google.com',
        totalSessions: 1247,
        totalUsers: 892,
        conversions: 156,
        avgSessionDuration: 245,
        bounceRate: 32.5,
        pagesPerSession: 3.2,
        lastSeen: '2024-01-07T15:30:00Z',
        trafficShare: 45.2
      },
      {
        domain: 'facebook.com',
        totalSessions: 567,
        totalUsers: 445,
        conversions: 89,
        avgSessionDuration: 180,
        bounceRate: 28.7,
        pagesPerSession: 2.8,
        lastSeen: '2024-01-07T14:20:00Z',
        trafficShare: 20.6
      }
    ]

    return { users, sessions, events, referrers }
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance()
