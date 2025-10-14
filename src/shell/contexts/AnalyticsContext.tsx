import React, { createContext, useContext, useEffect, useState } from 'react'
import { analyticsTracker } from '../lib/analyticsTracker'
import { AnalyticsUser, AnalyticsSession } from '../lib/analyticsTypes'
import { useAuth } from './AuthContext'
import { analyticsService } from '../lib/AnalyticsService'

interface AnalyticsContextType {
  user: AnalyticsUser | null
  session: AnalyticsSession | null
  isInitialized: boolean
  isExcluded: boolean
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
  const [isExcluded, setIsExcluded] = useState(false)
  const { user: authUser } = useAuth()

  // Check if current path should be excluded from tracking
  const shouldExcludePath = (path: string) => {
    return path.startsWith('/manage')
  }

  // Check if user should be excluded from analytics
  const checkUserExclusion = async () => {
    if (!authUser) return false

    try {
      console.log('Checking user exclusion for user:', authUser.id)
      
      // Get the analytics context to get the anonId
      const context = analyticsTracker.getContext()
      const anonId = context.user?.anonId
      
      if (!anonId) {
        console.log('No anonId found, cannot exclude user')
        return false
      }
      
      console.log('Using anonId for exclusion:', anonId)
      
      // Check if user is already excluded by anonId
      const excluded = await analyticsService.isUserExcluded(
        undefined,
        undefined,
        undefined,
        anonId
      )

      console.log('User already excluded:', excluded)

      if (excluded) {
        return true
      }

      // Auto-exclude all logged-in users by anonId
      console.log('Excluding user by anonId:', anonId)
      const result = await analyticsService.excludeUser(
        undefined,
        undefined,
        undefined,
        anonId,
        'Auto-excluded logged-in user',
        'system'
      )
      
      console.log('Exclusion result:', result)
      
      if (!result.success) {
        console.error('Failed to exclude user:', result.error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error checking user exclusion:', error)
      return false
    }
  }

  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        // Check if user should be excluded
        const userExcluded = await checkUserExclusion()
        setIsExcluded(userExcluded)

        // If user is excluded, don't initialize analytics
        if (userExcluded) {
          setIsInitialized(true)
          return
        }

        // Check if current path should be excluded
        if (shouldExcludePath(window.location.pathname)) {
          setIsExcluded(true)
          setIsInitialized(true)
          return
        }

        await analyticsTracker.init()
        const context = analyticsTracker.getContext()
        setUser(context.user)
        setSession(context.session)
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize analytics:', error)
        setIsInitialized(true) // Still mark as initialized to prevent blocking
      }
    }

    initializeAnalytics()
  }, [authUser])

  // Handle route changes to check for /manage paths
  useEffect(() => {
    const handleRouteChange = () => {
      const currentPath = window.location.pathname
      if (shouldExcludePath(currentPath)) {
        setIsExcluded(true)
      } else if (isExcluded && !shouldExcludePath(currentPath)) {
        // Re-enable tracking if user navigates away from /manage
        setIsExcluded(false)
      }
    }

    // Listen for navigation changes
    window.addEventListener('popstate', handleRouteChange)
    
    // Check current path on mount
    handleRouteChange()

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [isExcluded])

  const trackPageview = async (url: string, path: string, title?: string) => {
    // Don't track if user is excluded or on excluded paths
    if (isExcluded || shouldExcludePath(path)) {
      return
    }

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
    // Don't track if user is excluded
    if (isExcluded) {
      return
    }

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
    isExcluded,
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
