import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAnalytics } from '../contexts/AnalyticsContext'

/**
 * Hook to automatically track pageviews on route changes
 * Should be used in the main App component
 */
export const useAnalyticsPageview = () => {
  const location = useLocation()
  const { trackPageview, isInitialized } = useAnalytics()

  useEffect(() => {
    if (!isInitialized) return

    // Track pageview on route change
    trackPageview(
      window.location.href,
      location.pathname,
      document.title
    )
  }, [location.pathname, trackPageview, isInitialized])
}
