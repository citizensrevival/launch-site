import { supabase } from './supabase'
import {
  AnalyticsTracker,
  AnalyticsUser,
  AnalyticsSession,
  PageviewEvent,
  AnalyticsEvent,
  DeviceInfo,
  UTMParams
} from './analyticsTypes'

// ================================================
// Analytics Tracker Implementation
// ================================================

class AnalyticsTrackerImpl implements AnalyticsTracker {
  private user: AnalyticsUser | null = null
  private session: AnalyticsSession | null = null
  // private _sessionTimeout: number = 30 * 60 * 1000 // 30 minutes
  private heartbeatInterval: NodeJS.Timeout | null = null
  private pendingEvents: Array<PageviewEvent | AnalyticsEvent> = []
  // private _batchSize: number = 10
  private flushTimeout: NodeJS.Timeout | null = null

  constructor() {
    this.setupVisibilityChangeHandler()
    this.setupBeforeUnloadHandler()
  }

  async init(): Promise<void> {
    await this.identify()
    await this.startSession()
    this.startHeartbeat()
  }

  async identify(anonId?: string): Promise<void> {
    const storedAnonId = anonId || this.getStoredAnonId()
    
    if (!storedAnonId) {
      const newAnonId = this.generateAnonId()
      this.setStoredAnonId(newAnonId)
      this.user = {
        anonId: newAnonId,
        firstSeenAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        isReturning: false
      }
    } else {
      this.user = {
        anonId: storedAnonId,
        lastSeenAt: new Date().toISOString(),
        isReturning: true
      }
    }

    // Upsert user to backend
    try {
      const { data, error } = await supabase.functions.invoke('ingest-upsert-user', {
        body: {
          anonId: this.user.anonId,
          traits: {}
        }
      })
      
      if (error) {
        console.error('Failed to upsert user:', error)
        return
      }
      
      if (data?.userId) {
        // Store the userId (UUID) returned from the backend
        this.user = { ...this.user, userId: data.userId }
      }
    } catch (error) {
      console.error('Failed to upsert user:', error)
    }
  }

  async startSession(): Promise<void> {
    if (!this.user || !this.user.userId) {
      throw new Error('User must be identified and have a userId before starting session')
    }

    const sessionId = this.generateSessionId()
    const device = this.getDeviceInfo()
    const utm = this.getUTMParams()

    this.session = {
      sessionId,
      userId: this.user.userId, // Use the UUID userId from the backend
      startedAt: new Date().toISOString(),
      referrer: document.referrer || undefined,
      landingPage: window.location.href,
      landingPath: window.location.pathname,
      utm,
      device
    }

    // Start session on backend
    try {
      const { data, error } = await supabase.functions.invoke('ingest-start-session', {
        body: {
          anonId: this.user.userId, // Use the UUID userId as anonId for the session
          sessionId: this.session.sessionId,
          landingPage: this.session.landingPage,
          landingPath: this.session.landingPath,
          referrer: this.session.referrer,
          utm: this.session.utm,
          device: this.session.device
        }
      })

      if (error) {
        console.error('Failed to start session:', error)
        return
      }

      if (data?.sessionId) {
        this.session.sessionId = data.sessionId
      }
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }

  async endSession(): Promise<void> {
    if (!this.session) return

    // Flush pending events
    await this.flush()

    // End session on backend
    try {
      await supabase.functions.invoke('ingest-end-session', {
        body: {
          sessionId: this.session.sessionId
        }
      })
    } catch (error) {
      console.error('Failed to end session:', error)
    }

    this.session = null
    this.stopHeartbeat()
  }

  async trackPageview(event: PageviewEvent): Promise<void> {
    if (!this.session) {
      console.warn('No active session for pageview tracking')
      return
    }

    const pageviewData = {
      ...event,
      sessionId: this.session.sessionId,
      userId: this.session.userId,
      occurredAt: new Date().toISOString()
    }

    this.pendingEvents.push(pageviewData)
    this.scheduleFlush()
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.session) {
      console.warn('No active session for event tracking')
      return
    }

    const eventData = {
      ...event,
      sessionId: this.session.sessionId,
      userId: this.session.userId,
      occurredAt: new Date().toISOString()
    }

    this.pendingEvents.push(eventData)
    this.scheduleFlush()
  }

  async updateSessionContext(context: Partial<Pick<AnalyticsSession, 'geo' | 'device' | 'utm'>>): Promise<void> {
    if (!this.session) return

    this.session = { ...this.session, ...context }

    try {
      await supabase.functions.invoke('ingest-update-session-context', {
        body: {
          sessionId: this.session.sessionId,
          geo: context.geo,
          device: context.device,
          utm: context.utm
        }
      })
    } catch (error) {
      console.error('Failed to update session context:', error)
    }
  }

  getContext(): { user: AnalyticsUser | null; session: AnalyticsSession | null } {
    return {
      user: this.user,
      session: this.session
    }
  }

  async flush(): Promise<void> {
    if (this.pendingEvents.length === 0) return

    const events = [...this.pendingEvents]
    this.pendingEvents = []

    if (!this.session) return

    try {
      const pageviews = events.filter(e => 'url' in e) as PageviewEvent[]
      const customEvents = events.filter(e => 'name' in e) as AnalyticsEvent[]

      const { error } = await supabase.functions.invoke('ingest-batch', {
        body: {
          pageviews: pageviews.map(pv => ({
            sessionId: this.session!.sessionId,
            userId: this.session!.userId,
            url: pv.url,
            path: pv.path,
            title: pv.title,
            referrer: pv.referrer,
            properties: pv.properties,
            occurredAt: new Date().toISOString()
          })),
          events: customEvents.map(ev => ({
            sessionId: this.session!.sessionId,
            userId: this.session!.userId,
            name: ev.name,
            label: ev.label,
            valueNum: ev.valueNum,
            valueText: ev.valueText,
            properties: ev.properties,
            occurredAt: new Date().toISOString()
          }))
        }
      })

      if (error) {
        console.error('Failed to flush events:', error)
        // Re-add events to pending queue
        this.pendingEvents.unshift(...events)
      }
    } catch (error) {
      console.error('Failed to flush events:', error)
      // Re-add events to pending queue
      this.pendingEvents.unshift(...events)
    }
  }

  async reset(): Promise<void> {
    // Clear stored identifiers
    localStorage.removeItem('analytics_anon_id')
    sessionStorage.removeItem('analytics_session_id')
    
    // Clear current state
    this.user = null
    this.session = null
    
    // Clear pending events
    this.pendingEvents = []
    
    // Stop heartbeat
    this.stopHeartbeat()
  }

  // ================================================
  // Private Helper Methods
  // ================================================

  private generateAnonId(): string {
    return 'anon_' + crypto.randomUUID()
  }

  private generateSessionId(): string {
    return crypto.randomUUID()
  }

  private getStoredAnonId(): string | null {
    return localStorage.getItem('analytics_anon_id')
  }

  private setStoredAnonId(anonId: string): void {
    localStorage.setItem('analytics_anon_id', anonId)
  }

  private getDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(ua)
    
    let category: DeviceInfo['category'] = 'desktop'
    if (isTablet) category = 'tablet'
    else if (isMobile) category = 'mobile'

    return {
      category,
      browserName: this.getBrowserName(ua),
      browserVersion: this.getBrowserVersion(ua),
      osName: this.getOSName(ua),
      osVersion: this.getOSVersion(ua)
    }
  }

  private getBrowserName(ua: string): string {
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
    if (ua.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  private getBrowserVersion(ua: string): string | undefined {
    const match = ua.match(/(Chrome|Firefox|Safari|Edge)\/(\d+\.\d+)/)
    return match?.[2]
  }

  private getOSName(ua: string): string {
    if (ua.includes('Windows')) return 'Windows'
    if (ua.includes('Mac OS X')) return 'macOS'
    if (ua.includes('Linux')) return 'Linux'
    if (ua.includes('Android')) return 'Android'
    if (ua.includes('iOS')) return 'iOS'
    return 'Unknown'
  }

  private getOSVersion(ua: string): string | undefined {
    const match = ua.match(/(Windows NT|Mac OS X|Android) ([0-9._]+)/)
    return match?.[2]
  }

  private getUTMParams(): Partial<UTMParams> {
    const urlParams = new URLSearchParams(window.location.search)
    const utm: Partial<UTMParams> = {}
    
    const source = urlParams.get('utm_source')
    const medium = urlParams.get('utm_medium')
    const campaign = urlParams.get('utm_campaign')
    const term = urlParams.get('utm_term')
    const content = urlParams.get('utm_content')
    
    if (source) utm.source = source
    if (medium) utm.medium = medium
    if (campaign) utm.campaign = campaign
    if (term) utm.term = term
    if (content) utm.content = content
    
    return utm
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(async () => {
      if (this.session) {
        try {
          const { error } = await supabase.functions.invoke('ingest-heartbeat', {
            body: {
              sessionId: this.session.sessionId,
              userId: this.session.userId
            }
          })
          
          if (error) {
            console.error('Heartbeat failed:', error)
          }
        } catch (error) {
          console.error('Heartbeat failed:', error)
        }
      }
    }, 5 * 60 * 1000) // Every 5 minutes
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
    }
    
    this.flushTimeout = setTimeout(() => {
      this.flush()
    }, 1000) // Flush after 1 second of inactivity
  }

  private setupVisibilityChangeHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush()
      }
    })
  }

  private setupBeforeUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      this.flush()
      this.endSession()
    })
  }
}

// ================================================
// Export Singleton Instance
// ================================================

export const analyticsTracker = new AnalyticsTrackerImpl()
export default analyticsTracker
