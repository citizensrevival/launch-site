import { useEffect, useCallback } from 'react';
import { analyticsTracker } from '../services/AnalyticsTracker';
import type { TrackPageviewInput, TrackEventInput } from '../types/analytics.types';

/**
 * Hook for analytics tracking
 */
export function useAnalytics() {
  const trackPageview = useCallback(async (input: TrackPageviewInput) => {
    try {
      await analyticsTracker.trackPageview(input);
    } catch (error) {
      console.error('Failed to track pageview:', error);
    }
  }, []);

  const trackEvent = useCallback(async (input: TrackEventInput) => {
    try {
      await analyticsTracker.trackEvent(input);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, []);

  const startSession = useCallback(async () => {
    try {
      await analyticsTracker.startSession({
        landingPage: window.location.href,
        landingPath: window.location.pathname,
        referrer: document.referrer || null,
      });
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  }, []);

  const endSession = useCallback(async () => {
    try {
      await analyticsTracker.endSession();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, []);

  const sendHeartbeat = useCallback(async () => {
    try {
      await analyticsTracker.sendHeartbeat();
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }
  }, []);

  const reset = useCallback(async () => {
    try {
      await analyticsTracker.reset();
    } catch (error) {
      console.error('Failed to reset analytics:', error);
    }
  }, []);

  return {
    trackPageview,
    trackEvent,
    startSession,
    endSession,
    sendHeartbeat,
    reset,
  };
}

/**
 * Hook for automatic pageview tracking
 */
export function useAnalyticsPageview() {
  const { trackPageview } = useAnalytics();

  useEffect(() => {
    const trackCurrentPage = () => {
      trackPageview({
        url: window.location.href,
        path: window.location.pathname,
        title: document.title,
        referrer: document.referrer || undefined,
      });
    };

    // Track initial pageview
    trackCurrentPage();

    // Track page changes (for SPA navigation)
    const handlePopState = () => {
      trackCurrentPage();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [trackPageview]);
}

/**
 * Hook for session management
 */
export function useAnalyticsSession() {
  const { startSession, endSession, sendHeartbeat } = useAnalytics();

  useEffect(() => {
    // Start session on mount
    startSession();

    // Set up heartbeat interval (every 30 seconds)
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat();
    }, 30000);

    // End session on unmount
    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endSession();
    };
  }, [startSession, endSession, sendHeartbeat]);
}
