import React, { createContext, useContext, useEffect, useState } from 'react'
import { analyticsTracker } from '../lib/analyticsTracker'
import { AnalyticsUser, AnalyticsSession } from '../lib/analyticsTypes'

interface AnalyticsContextType {
  user: AnalyticsUser | null
  session: AnalyticsSession | null
  isInitialized: boolean
  trackPageview: (url: string, path: string, title?: string) => Promise<void>
  trackEvent: (name: string, label?: string, properties?: Record<string, any>) => Promise<void>
  reset: () => Promise<void>
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AnalyticsUser | null>(null)
  const [session, setSession] = useState<AnalyticsSession | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        await analyticsTracker.init()
        const context = analyticsTracker.getContext()
        setUser(context.user)
        setSession(context.session)
        setIsInitialized(true)
        
        // Track initial pageview
        await trackPageview(
          window.location.href,
          window.location.pathname,
          document.title
        )
      } catch (error) {
        console.error('Failed to initialize analytics:', error)
        setIsInitialized(true) // Still mark as initialized to prevent blocking
      }
    }

    initializeAnalytics()
  }, [])

  const trackPageview = async (url: string, path: string, title?: string) => {
    try {
      await analyticsTracker.trackPageview({
        url,
        path,
        title,
        referrer: document.referrer || undefined
      })
    } catch (error) {
      console.error('Failed to track pageview:', error)
    }
  }

  const trackEvent = async (name: string, label?: string, properties?: Record<string, any>) => {
    try {
      await analyticsTracker.trackEvent({
        name,
        label,
        properties
      })
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }

  const reset = async () => {
    try {
      await analyticsTracker.reset()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Failed to reset analytics:', error)
    }
  }

  const value: AnalyticsContextType = {
    user,
    session,
    isInitialized,
    trackPageview,
    trackEvent,
    reset
  }

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}
