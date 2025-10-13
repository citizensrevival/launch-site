import { TimeRange } from '../store/slices/adminSlice'
import { supabase } from './supabase'

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
    const dateRange = this.getDateRange(timeRange)
    const startDate = dateRange.start.toISOString()
    const endDate = dateRange.end.toISOString()

    try {
      // Get unique users count
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id')
        .gte('first_seen_at', startDate)
        .lte('first_seen_at', endDate)

      if (usersError) throw usersError

      // Get sessions count
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('id')
        .gte('started_at', startDate)
        .lte('started_at', endDate)

      if (sessionsError) throw sessionsError

      // Get pageviews count
      const { data: pageviewsData, error: pageviewsError } = await supabase
        .from('pageviews')
        .select('id')
        .gte('occurred_at', startDate)
        .lte('occurred_at', endDate)

      if (pageviewsError) throw pageviewsError

      // Get events count
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .gte('occurred_at', startDate)
        .lte('occurred_at', endDate)

      if (eventsError) throw eventsError

      // Get unique users over time
      const { data: usersOverTime, error: usersOverTimeError } = await supabase
        .from('v_unique_users_daily')
        .select('day, unique_users')
        .gte('day', startDate.split('T')[0])
        .lte('day', endDate.split('T')[0])
        .order('day')

      if (usersOverTimeError) throw usersOverTimeError

      // Get sessions over time
      const { data: sessionsOverTime, error: sessionsOverTimeError } = await supabase
        .from('v_sessions_summary')
        .select('started_at')
        .gte('started_at', startDate)
        .lte('started_at', endDate)
        .order('started_at')

      if (sessionsOverTimeError) throw sessionsOverTimeError

      // Get top pages
      const { data: topPagesData, error: topPagesError } = await supabase
        .from('pageviews')
        .select('path')
        .gte('occurred_at', startDate)
        .lte('occurred_at', endDate)

      if (topPagesError) throw topPagesError

      // Get device breakdown
      const { data: deviceData, error: deviceError } = await supabase
        .from('sessions')
        .select('device_category')
        .gte('started_at', startDate)
        .lte('started_at', endDate)

      if (deviceError) throw deviceError

      // Get new vs returning users
      const { data: newVsReturningData, error: newVsReturningError } = await supabase
        .from('users')
        .select('first_seen_at, last_seen_at')
        .gte('first_seen_at', startDate)
        .lte('first_seen_at', endDate)

      if (newVsReturningError) throw newVsReturningError

      // Process the data
      const uniqueUsers = usersData?.length || 0
      const totalSessions = sessionsData?.length || 0
      const totalPageviews = pageviewsData?.length || 0
      const totalEvents = eventsData?.length || 0

      // Process unique users over time
      const uniqueUsersOverTime = usersOverTime?.map(item => ({
        day: item.day,
        unique_users: item.unique_users
      })) || []

      // Process sessions over time (group by day)
      const sessionsByDay = sessionsOverTime?.reduce((acc, session) => {
        const day = session.started_at.split('T')[0]
        acc[day] = (acc[day] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const sessionsOverTimeFormatted = Object.entries(sessionsByDay).map(([day, sessions]) => ({
        day,
        sessions
      }))

      // Process top pages
      const pageCounts = topPagesData?.reduce((acc, page) => {
        acc[page.path] = (acc[page.path] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const topPages = Object.entries(pageCounts)
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10)

      // Process device breakdown
      const deviceCounts = deviceData?.reduce((acc, session) => {
        const category = session.device_category || 'unknown'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const deviceBreakdown = Object.entries(deviceCounts).map(([category, count]) => ({
        category,
        count
      }))

      // Process new vs returning users
      const newUsers = newVsReturningData?.filter(user => {
        const firstSeen = new Date(user.first_seen_at)
        const lastSeen = new Date(user.last_seen_at)
        return firstSeen.getTime() === lastSeen.getTime() // Same day = new user
      }).length || 0

      const returningUsers = uniqueUsers - newUsers

      const newVsReturning = [
        { type: 'New Users', count: newUsers },
        { type: 'Returning Users', count: returningUsers }
      ]

      return {
        uniqueUsers,
        totalSessions,
        totalPageviews,
        totalEvents,
        uniqueUsersOverTime,
        sessionsOverTime: sessionsOverTimeFormatted,
        topPages,
        deviceBreakdown,
        newVsReturning
      }

    } catch (error) {
      console.error('Error fetching analytics overview:', error)
      // Fallback to mock data if real data fails
      return this.getMockAnalyticsOverview(timeRange)
    }
  }

  private async getMockAnalyticsOverview(timeRange: TimeRange): Promise<AnalyticsOverviewData> {
    // Fallback to mock data
    const { users, sessions, events } = this.testData
    const dateRange = this.getDateRange(timeRange)
    
    return {
      uniqueUsers: users.length,
      totalSessions: sessions.length,
      totalPageviews: sessions.reduce((sum, s) => sum + s.pageviews, 0),
      totalEvents: events.reduce((sum, e) => sum + e.count, 0),
      uniqueUsersOverTime: this.generateTimeSeriesData(dateRange, 'unique_users').map(item => ({
        day: item.day,
        unique_users: item.unique_users as number
      })),
      sessionsOverTime: this.generateTimeSeriesData(dateRange, 'sessions').map(item => ({
        day: item.day,
        sessions: item.sessions as number
      })),
      topPages: this.getTopPages(sessions),
      deviceBreakdown: this.getDeviceBreakdown(sessions),
      newVsReturning: this.getNewVsReturningUsers(users)
    }
  }

  public async getUsersData(timeRange: TimeRange): Promise<UsersData> {
    const dateRange = this.getDateRange(timeRange)
    const startDate = dateRange.start.toISOString()
    const endDate = dateRange.end.toISOString()

    try {
      // Get users with their sessions
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          anon_id,
          first_seen_at,
          last_seen_at,
          first_referrer,
          last_referrer,
          first_utm_source,
          last_utm_source,
          properties
        `)
        .gte('first_seen_at', startDate)
        .lte('first_seen_at', endDate)
        .order('first_seen_at', { ascending: false })

      if (usersError) throw usersError

      // Get sessions for each user
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('v_sessions_summary')
        .select('*')
        .gte('started_at', startDate)
        .lte('started_at', endDate)
        .order('started_at', { ascending: false })

      if (sessionsError) throw sessionsError

      // Get events to check for lead submissions
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('user_id, name')
        .gte('occurred_at', startDate)
        .lte('occurred_at', endDate)
        .eq('name', 'lead_submitted')

      if (eventsError) throw eventsError

      // Get new users over time by querying users directly
      const { data: newUsersOverTime, error: newUsersError } = await supabase
        .from('users')
        .select('first_seen_at')
        .gte('first_seen_at', startDate)
        .lte('first_seen_at', endDate)
        .order('first_seen_at')

      if (newUsersError) throw newUsersError

      // Group users by day to create new users over time data
      const usersByDay = new Map<string, number>()
      newUsersOverTime?.forEach(user => {
        const day = user.first_seen_at.split('T')[0]
        usersByDay.set(day, (usersByDay.get(day) || 0) + 1)
      })

      // Create array of all days in range with new user counts
      const startDateObj = new Date(startDate)
      const endDateObj = new Date(endDate)
      const newUsersOverTimeData = []
      
      for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
        const dayStr = d.toISOString().split('T')[0]
        newUsersOverTimeData.push({
          day: dayStr,
          new_users: usersByDay.get(dayStr) || 0
        })
      }

      // Process users data
      const users: AnalyticsUser[] = usersData?.map(user => {
        const userSessions = sessionsData?.filter(session => session.user_id === user.id) || []
        const hasLead = eventsData?.some(event => event.user_id === user.id) || false
        
        return {
          id: user.id,
          anonId: user.anon_id,
          firstSeenAt: user.first_seen_at,
          lastSeenAt: user.last_seen_at,
          sessions: userSessions.length,
          avgDuration: userSessions.length > 0 
            ? userSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / userSessions.length 
            : 0,
          hasLead,
          firstReferrer: user.first_referrer,
          lastReferrer: user.last_referrer,
          firstUtmSource: user.first_utm_source,
          lastUtmSource: user.last_utm_source,
          deviceCategory: user.properties?.device_category || 'desktop',
          browserName: user.properties?.browser_name || 'Unknown',
          osName: user.properties?.os_name || 'Unknown',
          geoCountry: user.properties?.geo_country || 'Unknown',
          geoCity: user.properties?.geo_city || 'Unknown',
          userSessions: userSessions.map(session => ({
            id: session.id,
            startedAt: session.started_at,
            endedAt: session.ended_at,
            duration: session.duration || 0,
            pageviews: session.pageviews || 0,
            events: session.events || 0,
            landingPage: session.landing_page,
            deviceCategory: session.device_category || 'desktop',
            geoCountry: session.geo_country,
            geoCity: session.geo_city
          }))
        }
      }) || []

      return {
        users,
        newUsersOverTime: newUsersOverTimeData,
        newVsReturning: this.getNewVsReturningUsers(users)
      }
    } catch (error) {
      console.error('Error fetching users data:', error)
      // Fallback to mock data if database fails
      return this.getMockUsersData(timeRange)
    }
  }

  public async getUsersData_OLD(timeRange: TimeRange): Promise<UsersData> {
    const dateRange = this.getDateRange(timeRange)
    const startDate = dateRange.start.toISOString()
    const endDate = dateRange.end.toISOString()

    try {
      // Get users with their sessions
      const { data: usersData, error: usersError } = await supabase
        .from('analytics.users')
        .select(`
          id,
          anon_id,
          first_seen_at,
          last_seen_at,
          first_referrer,
          last_referrer,
          first_utm_source,
          last_utm_source,
          properties
        `)
        .gte('first_seen_at', startDate)
        .lte('first_seen_at', endDate)
        .order('first_seen_at', { ascending: false })

      if (usersError) throw usersError

      // Get sessions for each user
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('analytics.v_sessions_summary')
        .select('*')
        .gte('started_at', startDate)
        .lte('started_at', endDate)
        .order('started_at', { ascending: false })

      if (sessionsError) throw sessionsError

      // Get events to check for lead submissions
      const { data: eventsData, error: eventsError } = await supabase
        .from('analytics.events')
        .select('user_id, name')
        .eq('name', 'lead_form_submitted')
        .gte('occurred_at', startDate)
        .lte('occurred_at', endDate)

      if (eventsError) throw eventsError

      // Process users data
      const usersWithSessions = usersData?.map(user => {
        const userSessions = sessionsData?.filter(session => session.user_id === user.id) || []
        const hasLead = eventsData?.some(event => event.user_id === user.id) || false
        
        return {
          id: user.id,
          anonId: user.anon_id,
          firstSeenAt: user.first_seen_at,
          lastSeenAt: user.last_seen_at,
          sessions: userSessions.length,
          avgDuration: userSessions.length > 0 
            ? userSessions.reduce((sum, s) => sum + s.duration_seconds, 0) / userSessions.length 
            : 0,
          hasLead,
          firstReferrer: user.first_referrer,
          lastReferrer: user.last_referrer,
          firstUtmSource: user.first_utm_source,
          lastUtmSource: user.last_utm_source,
          deviceCategory: userSessions[0]?.device_category,
          browserName: userSessions[0]?.browser_name,
          osName: userSessions[0]?.os_name,
          geoCountry: userSessions[0]?.geo_country,
          geoCity: userSessions[0]?.geo_city,
          userSessions: userSessions.map(session => ({
            id: session.session_id,
            startedAt: session.started_at,
            endedAt: session.ended_at,
            duration: session.duration_seconds,
            pageviews: session.pageviews_count,
            events: session.events_count,
            landingPage: session.landing_page,
            deviceCategory: session.device_category,
            geoCountry: session.geo_country,
            geoCity: session.geo_city
          }))
        }
      }) || []

      // Get new users over time
      const { data: newUsersOverTime, error: newUsersOverTimeError } = await supabase
        .from('analytics.users')
        .select('first_seen_at')
        .gte('first_seen_at', startDate)
        .lte('first_seen_at', endDate)
        .order('first_seen_at')

      if (newUsersOverTimeError) throw newUsersOverTimeError

      // Process new users over time (group by day)
      const newUsersByDay = newUsersOverTime?.reduce((acc, user) => {
        const day = user.first_seen_at.split('T')[0]
        acc[day] = (acc[day] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const newUsersOverTimeFormatted = Object.entries(newUsersByDay).map(([day, new_users]) => ({
        day,
        new_users
      }))

      // Calculate new vs returning users
      const newUsers = usersWithSessions.filter(user => {
        const firstSeen = new Date(user.firstSeenAt)
        const lastSeen = new Date(user.lastSeenAt)
        return firstSeen.getTime() === lastSeen.getTime() // Same day = new user
      }).length

      const returningUsers = usersWithSessions.length - newUsers

      const newVsReturning = [
        { type: 'New Users', count: newUsers },
        { type: 'Returning Users', count: returningUsers }
      ]

      return {
        users: usersWithSessions,
        newUsersOverTime: newUsersOverTimeFormatted,
        newVsReturning
      }

    } catch (error) {
      console.error('Error fetching users data:', error)
      // Fallback to mock data
      return this.getMockUsersData(timeRange)
    }
  }

  private async getMockUsersData(timeRange: TimeRange): Promise<UsersData> {
    const { users } = this.testData
    const dateRange = this.getDateRange(timeRange)
    
    return {
      users: this.filterUsersByTimeRange(users, dateRange),
      newUsersOverTime: this.generateTimeSeriesData(dateRange, 'new_users').map(item => ({
        day: item.day,
        new_users: item.new_users as number
      })),
      newVsReturning: this.getNewVsReturningUsers(users)
    }
  }

  public async getSessionsData(timeRange: TimeRange): Promise<SessionsData> {
    const dateRange = this.getDateRange(timeRange)
    const startDate = dateRange.start.toISOString()
    const endDate = dateRange.end.toISOString()

    try {
      // Get sessions data
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('v_sessions_summary')
        .select('*')
        .gte('started_at', startDate)
        .lte('started_at', endDate)
        .order('started_at', { ascending: false })

      if (sessionsError) throw sessionsError

      const sessions: AnalyticsSession[] = sessionsData?.map(session => ({
        id: session.id,
        userId: session.user_id,
        startedAt: session.started_at,
        endedAt: session.ended_at,
        duration: session.duration || 0,
        pageviews: session.pageviews || 0,
        events: session.events || 0,
        landingPage: session.landing_page,
        deviceCategory: session.device_category || 'desktop',
        browserName: session.browser_name || 'Unknown',
        osName: session.os_name || 'Unknown',
        geoCountry: session.geo_country,
        geoCity: session.geo_city
      })) || []

      return {
        sessions,
        sessionsPerUser: this.getSessionsPerUserDistribution(sessions),
        avgSessionLength: this.calculateAverageSessionLength(sessions),
        avgPagesPerSession: this.calculateAveragePagesPerSession(sessions)
      }
    } catch (error) {
      console.error('Error fetching sessions data:', error)
      // Fallback to mock data if database fails
      return this.getMockSessionsData(timeRange)
    }
  }

  private async getMockSessionsData(timeRange: TimeRange): Promise<SessionsData> {
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
    const dateRange = this.getDateRange(timeRange)
    const startDate = dateRange.start.toISOString()
    const endDate = dateRange.end.toISOString()

    try {
      // Get events data
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .gte('occurred_at', startDate)
        .lte('occurred_at', endDate)
        .order('occurred_at', { ascending: false })

      if (eventsError) throw eventsError

      // Get event trends data from database
      const { data: eventTrendsData, error: eventTrendsError } = await supabase
        .from('events')
        .select('name, occurred_at')
        .gte('occurred_at', startDate)
        .lte('occurred_at', endDate)
        .order('occurred_at')

      if (eventTrendsError) throw eventTrendsError

      const events: AnalyticsEvent[] = eventsData?.map(event => ({
        id: event.id,
        userId: event.user_id,
        sessionId: event.session_id,
        name: event.name,
        label: event.name,
        properties: event.properties || {},
        occurredAt: event.occurred_at,
        lastOccurred: event.occurred_at,
        count: 1,
        uniqueUsers: 1,
        conversionRate: 0
      })) || []

      // Process real event trends data
      const eventTrends = this.processEventTrendsData(eventTrendsData || [], dateRange)

      return {
        events,
        eventTrends,
        topEvents: this.getTopEvents(events)
      }
    } catch (error) {
      console.error('Error fetching events data:', error)
      // Fallback to mock data if database fails
      return this.getMockEventsData(timeRange)
    }
  }

  private async getMockEventsData(timeRange: TimeRange): Promise<EventsData> {
    const { events } = this.testData
    const dateRange = this.getDateRange(timeRange)
    
    return {
      events: this.filterEventsByTimeRange(events, dateRange),
      eventTrends: this.generateEventTrendsData(dateRange),
      topEvents: this.getTopEvents(events)
    }
  }

  public async getReferrersData(timeRange: TimeRange): Promise<ReferrersData> {
    const dateRange = this.getDateRange(timeRange)
    const startDate = dateRange.start.toISOString()
    const endDate = dateRange.end.toISOString()

    try {
      // Get sessions data for referrer analysis
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('referrer, started_at, user_id, id')
        .gte('started_at', startDate)
        .lte('started_at', endDate)
        .not('referrer', 'is', null)

      if (sessionsError) throw sessionsError

      // Get events for conversion tracking
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('session_id, name')
        .gte('occurred_at', startDate)
        .lte('occurred_at', endDate)
        .eq('name', 'lead_submitted')

      if (eventsError) throw eventsError

      // Process referrer data
      const referrerMap = new Map<string, any>()
      
      sessionsData?.forEach(session => {
        if (!session.referrer) return
        
        const domain = new URL(session.referrer).hostname
        const existing = referrerMap.get(domain) || {
          domain,
          totalSessions: 0,
          totalUsers: new Set(),
          conversions: 0,
          totalDuration: 0,
          totalPageviews: 0,
          lastSeen: session.started_at
        }
        
        existing.totalSessions++
        existing.totalUsers.add(session.user_id)
        // Note: duration and pageviews are not available in sessions table
        // We'll need to calculate these from other sources or use defaults
        existing.totalDuration += 0 // Default duration
        existing.totalPageviews += 1 // Default to 1 pageview per session
        
        if (session.started_at > existing.lastSeen) {
          existing.lastSeen = session.started_at
        }
        
        referrerMap.set(domain, existing)
      })

      // Count conversions
      eventsData?.forEach(event => {
        const session = sessionsData?.find(s => s.id === event.session_id)
        if (session?.referrer) {
          const domain = new URL(session.referrer).hostname
          const referrer = referrerMap.get(domain)
          if (referrer) {
            referrer.conversions++
          }
        }
      })

      const referrers: Referrer[] = Array.from(referrerMap.values()).map(ref => {
        const totalUsers = ref.totalUsers.size
        const avgSessionDuration = ref.totalSessions > 0 ? ref.totalDuration / ref.totalSessions : 0
        const bounceRate = ref.totalSessions > 0 ? ((ref.totalSessions - ref.totalPageviews) / ref.totalSessions) * 100 : 0
        const pagesPerSession = ref.totalSessions > 0 ? ref.totalPageviews / ref.totalSessions : 0
        const totalSessions = sessionsData?.length || 0
        const trafficShare = totalSessions > 0 ? (ref.totalSessions / totalSessions) * 100 : 0

        return {
          domain: ref.domain,
          totalSessions: ref.totalSessions,
          totalUsers,
          conversions: ref.conversions,
          avgSessionDuration: Math.round(avgSessionDuration),
          bounceRate: Math.round(bounceRate * 10) / 10,
          pagesPerSession: Math.round(pagesPerSession * 10) / 10,
          lastSeen: ref.lastSeen,
          trafficShare: Math.round(trafficShare * 10) / 10
        }
      }).sort((a, b) => b.totalSessions - a.totalSessions)

      const totalReferrals = referrers.reduce((sum, ref) => sum + ref.totalSessions, 0)
      
      return {
        referrers,
        referralTrafficOverTime: this.processReferralTrafficOverTime(sessionsData || [], dateRange),
        trafficShare: referrers.map(ref => ({
          source: ref.domain,
          count: ref.totalSessions
        })),
        totalReferrals,
        referralTrafficPercentage: totalReferrals > 0 ? (totalReferrals / (sessionsData?.length || 1)) * 100 : 0,
        topReferrers: referrers.slice(0, 10).map(ref => ({
          domain: ref.domain,
          sessions: ref.totalSessions
        }))
      }
    } catch (error) {
      console.error('Error fetching referrers data:', error)
      // Fallback to mock data if database fails
      return this.getMockReferrersData(timeRange)
    }
  }

  private async getMockReferrersData(timeRange: TimeRange): Promise<ReferrersData> {
    const { referrers } = this.testData
    const dateRange = this.getDateRange(timeRange)
    const filteredReferrers = this.filterReferrersByTimeRange(referrers, dateRange)
    
    return {
      referrers: filteredReferrers,
      referralTrafficOverTime: this.generateReferralTrafficData(dateRange),
      trafficShare: this.getTrafficShare(this.testData.sessions),
      totalReferrals: this.calculateTotalReferrals(this.testData.sessions),
      referralTrafficPercentage: 65.8,
      topReferrers: this.getTopReferrers(filteredReferrers)
    }
  }

  private getTopReferrers(referrers: Referrer[]): Array<{ domain: string; sessions: number }> {
    return referrers
      .sort((a, b) => b.totalSessions - a.totalSessions)
      .slice(0, 3)
      .map(ref => ({ domain: ref.domain, sessions: ref.totalSessions }))
  }

  private processReferralTrafficOverTime(sessionsData: Array<{ started_at: string; referrer: string }>, dateRange: { start: Date; end: Date }): Array<{ day: string; referrals: number }> {
    // Group sessions by day
    const sessionsByDay = new Map<string, number>()
    
    sessionsData.forEach(session => {
      if (!session.referrer) return
      
      const day = session.started_at.split('T')[0]
      sessionsByDay.set(day, (sessionsByDay.get(day) || 0) + 1)
    })
    
    // Create array of all days in range with referral counts
    const days = []
    const current = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    
    while (current <= end) {
      const dayStr = current.toISOString().split('T')[0]
      days.push({
        day: dayStr,
        referrals: sessionsByDay.get(dayStr) || 0
      })
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  private generateReferralTrafficData(dateRange: { start: Date; end: Date }): Array<{ day: string; referrals: number }> {
    const days = []
    const current = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    
    while (current <= end) {
      days.push({
        day: current.toISOString().split('T')[0],
        referrals: Math.floor(Math.random() * 50) + 20
      })
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  public async getReferrersData_OLD(timeRange: TimeRange): Promise<ReferrersData> {
    const dateRange = this.getDateRange(timeRange)
    const startDate = dateRange.start.toISOString()
    const endDate = dateRange.end.toISOString()

    try {
      // Get sessions data for referrer analysis
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('analytics.sessions')
        .select('referrer, started_at, user_id, id')
        .gte('started_at', startDate)
        .lte('started_at', endDate)

      if (sessionsError) throw sessionsError

      // Get events for conversion tracking
      const { data: eventsData, error: eventsError } = await supabase
        .from('analytics.events')
        .select('session_id, name')
        .eq('name', 'lead_form_submitted')
        .gte('occurred_at', startDate)
        .lte('occurred_at', endDate)

      if (eventsError) throw eventsError

      // Get pageviews for bounce rate calculation
      const { data: pageviewsData, error: pageviewsError } = await supabase
        .from('analytics.pageviews')
        .select('session_id')
        .gte('occurred_at', startDate)
        .lte('occurred_at', endDate)

      if (pageviewsError) throw pageviewsError

      // Process referrer data
      const referrerStats = sessionsData?.reduce((acc, session) => {
        const referrer = session.referrer || 'direct'
        if (!acc[referrer]) {
          acc[referrer] = {
            referrer,
            totalSessions: 0,
            totalUsers: new Set(),
            conversions: 0,
            avgSessionDuration: 0,
            bounceRate: 0,
            pagesPerSession: 0,
            lastSeen: session.started_at
          }
        }
        
        acc[referrer].totalSessions++
        acc[referrer].totalUsers.add(session.user_id)
        acc[referrer].lastSeen = session.started_at > acc[referrer].lastSeen ? session.started_at : acc[referrer].lastSeen
        
        return acc
      }, {} as Record<string, any>) || {}

      // Calculate conversions
      const sessionConversions = eventsData?.reduce((acc, event) => {
        acc[event.session_id] = true
        return acc
      }, {} as Record<string, boolean>) || {}

      // Calculate pageviews per session
      const pageviewsPerSession = pageviewsData?.reduce((acc, pageview) => {
        acc[pageview.session_id] = (acc[pageview.session_id] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Process final referrer data
      const referrers = Object.values(referrerStats).map((ref: any) => {
        const sessions = sessionsData?.filter(s => (s.referrer || 'direct') === ref.referrer) || []
        const conversions = sessions.filter(s => sessionConversions[s.id]).length
        const totalPageviews = sessions.reduce((sum, s) => sum + (pageviewsPerSession[s.id] || 0), 0)
        const singlePageSessions = sessions.filter(s => (pageviewsPerSession[s.id] || 0) === 1).length
        
        return {
          domain: ref.referrer,
          totalSessions: ref.totalSessions,
          totalUsers: ref.totalUsers.size,
          conversions,
          avgSessionDuration: 0, // Would need session duration data
          bounceRate: ref.totalSessions > 0 ? (singlePageSessions / ref.totalSessions) * 100 : 0,
          pagesPerSession: ref.totalSessions > 0 ? totalPageviews / ref.totalSessions : 0,
          lastSeen: ref.lastSeen,
          trafficShare: 0 // Will be calculated below
        }
      }).sort((a, b) => b.totalSessions - a.totalSessions)

      // Calculate traffic share
      const totalSessions = sessionsData?.length || 0
      const referrersWithShare = referrers.map(ref => ({
        ...ref,
        trafficShare: totalSessions > 0 ? (ref.totalSessions / totalSessions) * 100 : 0
      }))

      // Get referral traffic over time
      const referralTrafficByDay = sessionsData?.reduce((acc, session) => {
        const day = session.started_at.split('T')[0]
        const referrer = session.referrer || 'direct'
        if (!acc[day]) acc[day] = {}
        acc[day][referrer] = (acc[day][referrer] || 0) + 1
        return acc
      }, {} as Record<string, Record<string, number>>) || {}

      const referralTrafficOverTime = Object.entries(referralTrafficByDay).map(([day, referrers]) => ({
        day,
        referrals: Object.values(referrers).reduce((sum, count) => sum + count, 0)
      }))

      // Get traffic share by source
      const trafficShare = referrersWithShare.map(ref => ({
        source: ref.domain,
        count: ref.totalSessions
      }))

      // Calculate totals
      const totalReferrals = referrersWithShare.reduce((sum, ref) => sum + ref.totalSessions, 0)
      const referralTrafficPercentage = totalSessions > 0 ? (totalReferrals / totalSessions) * 100 : 0

      return {
        referrers: referrersWithShare,
        referralTrafficOverTime,
        trafficShare,
        totalReferrals,
        referralTrafficPercentage,
        topReferrers: referrersWithShare.slice(0, 3).map(ref => ({
          domain: ref.domain,
          sessions: ref.totalSessions
        }))
      }

    } catch (error) {
      console.error('Error fetching referrers data:', error)
      // Fallback to mock data
      return this.getMockReferrersData(timeRange)
    }
  }


  public async getSessionDetail(sessionId: string): Promise<AnalyticsSession | null> {
    try {
      // Get session data
      const { data: sessionData, error: sessionError } = await supabase
        .from('analytics.v_sessions_summary')
        .select('*')
        .eq('session_id', sessionId)
        .single()

      if (sessionError) throw sessionError

      if (!sessionData) return null

      // Get pageviews for this session
      const { error: pageviewsError } = await supabase
        .from('analytics.pageviews')
        .select('*')
        .eq('session_id', sessionId)
        .order('occurred_at')

      if (pageviewsError) throw pageviewsError

      // Get events for this session
      const { error: eventsError } = await supabase
        .from('analytics.events')
        .select('*')
        .eq('session_id', sessionId)
        .order('occurred_at')

      if (eventsError) throw eventsError

      // Process session data
      const session: AnalyticsSession = {
        id: sessionData.session_id,
        userId: sessionData.user_id,
        startedAt: sessionData.started_at,
        endedAt: sessionData.ended_at,
        duration: sessionData.duration_seconds,
        pageviews: sessionData.pageviews_count,
        events: sessionData.events_count,
        landingPage: sessionData.landing_page,
        referrer: sessionData.referrer,
        deviceCategory: sessionData.device_category,
        browserName: sessionData.browser_name,
        osName: sessionData.os_name,
        geoCountry: sessionData.geo_country,
        geoCity: sessionData.geo_city,
        utmSource: sessionData.utm_source,
        utmMedium: sessionData.utm_medium,
        utmCampaign: sessionData.utm_campaign
      }

      return session

    } catch (error) {
      console.error('Error fetching session detail:', error)
      return null
    }
  }

  public async getUserDetail(userId: string): Promise<AnalyticsUser | null> {
    await this.delay(100)
    
    return this.testData.users.find(u => u.id === userId) || null
  }

  // ================================================
  // Exclusion Management Methods
  // ================================================

  public async excludeUser(
    userId?: string,
    sessionId?: string,
    ipAddress?: string,
    anonId?: string,
    reason: string = 'Manual exclusion',
    excludedBy: string = 'admin'
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('exclude_user', {
        p_user_id: userId || null,
        p_session_id: sessionId || null,
        p_ip_address: ipAddress || null,
        p_anon_id: anonId || null,
        p_reason: reason,
        p_excluded_by: excludedBy
      })

      if (error) throw error

      return { success: true, id: data }
    } catch (error) {
      console.error('Error excluding user:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  public async removeExclusion(
    userId?: string,
    sessionId?: string,
    ipAddress?: string,
    anonId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('remove_exclusion', {
        p_user_id: userId || null,
        p_session_id: sessionId || null,
        p_ip_address: ipAddress || null,
        p_anon_id: anonId || null
      })

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error removing exclusion:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  public async isUserExcluded(
    userId?: string,
    sessionId?: string,
    ipAddress?: string,
    anonId?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_user_excluded', {
        p_user_id: userId || null,
        p_session_id: sessionId || null,
        p_ip_address: ipAddress || null,
        p_anon_id: anonId || null
      })

      if (error) throw error

      return data || false
    } catch (error) {
      console.error('Error checking user exclusion:', error)
      return false
    }
  }

  public async getExcludedUsers(): Promise<Array<{
    id: string
    userId?: string
    sessionId?: string
    ipAddress?: string
    anonId?: string
    reason: string
    excludedBy: string
    excludedAt: string
  }>> {
    try {
      const { data, error } = await supabase
        .from('excluded_users')
        .select('*')
        .order('excluded_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching excluded users:', error)
      return []
    }
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

  private generateTimeSeriesData(dateRange: { start: Date; end: Date }, type: string): Array<{ day: string; [key: string]: number | string }> {
    const days: Array<{ day: string; [key: string]: number | string }> = []
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
      
      const dayData: { day: string; [key: string]: number | string } = { day: dayStr, [type]: value }
      days.push(dayData)
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  private processEventTrendsData(eventTrendsData: Array<{ name: string; occurred_at: string }>, dateRange: { start: Date; end: Date }): Array<{ day: string; [key: string]: number | string }> {
    // Group events by day and event type
    const eventsByDay: { [day: string]: { [eventName: string]: number } } = {}
    
    eventTrendsData.forEach(event => {
      const day = event.occurred_at.split('T')[0]
      if (!eventsByDay[day]) {
        eventsByDay[day] = {}
      }
      eventsByDay[day][event.name] = (eventsByDay[day][event.name] || 0) + 1
    })
    
    // Create array of all days in range with event counts
    const days = []
    const current = new Date(dateRange.start)
    
    while (current <= dateRange.end) {
      const dayStr = current.toISOString().split('T')[0]
      const dayEvents = eventsByDay[dayStr] || {}
      
      days.push({
        day: dayStr,
        lead_form_submitted: dayEvents.lead_form_submitted || 0,
        cta_click: dayEvents.cta_click || 0,
        video_play: dayEvents.video_play || 0,
        download_started: dayEvents.download_started || 0,
        lead_submitted: dayEvents.lead_submitted || 0,
        page_view: dayEvents.page_view || 0,
        session_start: dayEvents.session_start || 0,
        session_end: dayEvents.session_end || 0
      })
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
