import { BaseService } from "../../../core/services/BaseService";
import { supabase } from "../../../core/supabase";
import type {
  AnalyticsContext,
  StartSessionInput,
  TrackEventInput,
  TrackPageviewInput,
  UpdateSessionContextInput,
} from "../types/analytics.types";

export class AnalyticsTracker extends BaseService {
  private context: AnalyticsContext = {
    user: null,
    session: null,
  };

  /**
   * Initialize the analytics tracker
   */
  public async init(): Promise<void> {
    try {
      // Generate or retrieve anonymous ID
      const anonId = this.getOrCreateAnonId();

      // Create or get user
      const userResult = await this.upsertUser(anonId);
      if (!userResult.success) {
        throw new Error(userResult.error);
      }

      this.context.user = {
        anonId,
        userId: userResult.data.userId,
        traits: {},
      };

      // Start session if not already started
      if (!this.context.session) {
        await this.startSession({
          landingPage: window.location.href,
          landingPath: window.location.pathname,
          referrer: document.referrer || null,
        });
      }
    } catch (error) {
      console.error("Failed to initialize analytics:", error);
      throw error;
    }
  }

  /**
   * Get the current analytics context
   */
  public getContext(): AnalyticsContext {
    return this.context;
  }

  /**
   * Start a new session
   */
  public async startSession(
    input: StartSessionInput,
  ): Promise<
    { success: true; data: { sessionId: string; userId: string } } | {
      success: false;
      error: string;
    }
  > {
    try {
      if (!this.context.user) {
        return { success: false, error: "User not initialized" };
      }

      const sessionId = this.generateSessionId();

      // Call the start-session edge function
      const response = await fetch("/api/functions/v1/ingest-start-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anonId: this.context.user.anonId,
          sessionId,
          landingPage: input.landingPage,
          landingPath: input.landingPath,
          referrer: input.referrer,
          utm: input.utm,
          device: input.device,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.context.session = {
        id: sessionId,
        userId: this.context.user.userId!,
        landingPage: input.landingPage,
        landingPath: input.landingPath,
        referrer: input.referrer,
        utm: input.utm,
        device: input.device,
        startedAt: new Date().toISOString(),
      };

      return this.success({ sessionId, userId: this.context.user.userId! });
    } catch (error) {
      return this.handleError(error, "startSession");
    }
  }

  /**
   * End the current session
   */
  public async endSession(): Promise<
    { success: true } | { success: false; error: string }
  > {
    try {
      if (!this.context.session) {
        return { success: false, error: "No active session" };
      }

      // Call the end-session edge function
      const response = await fetch("/api/functions/v1/ingest-end-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: this.context.session.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.context.session.endedAt = new Date().toISOString();
      this.context.session = null;

      return this.success({});
    } catch (error) {
      return this.handleError(error, "endSession");
    }
  }

  /**
   * Track a pageview
   */
  public async trackPageview(
    input: TrackPageviewInput,
  ): Promise<
    { success: true; data: { id: number } } | { success: false; error: string }
  > {
    try {
      if (!this.context.session || !this.context.user) {
        return { success: false, error: "Session or user not initialized" };
      }

      // Call the pageview edge function
      const response = await fetch("/api/functions/v1/ingest-pageview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: this.context.session.id,
          userId: this.context.user.userId!,
          url: input.url,
          path: input.path,
          title: input.title,
          referrer: input.referrer,
          properties: input.properties,
          occurredAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return this.success({ id: result.id });
    } catch (error) {
      return this.handleError(error, "trackPageview");
    }
  }

  /**
   * Track an event
   */
  public async trackEvent(
    input: TrackEventInput,
  ): Promise<
    { success: true; data: { id: number } } | { success: false; error: string }
  > {
    try {
      if (!this.context.session || !this.context.user) {
        return { success: false, error: "Session or user not initialized" };
      }

      // Call the event edge function
      const response = await fetch("/api/functions/v1/ingest-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: this.context.session.id,
          userId: this.context.user.userId!,
          name: input.name,
          label: input.label,
          valueNum: input.valueNum,
          valueText: input.valueText,
          properties: input.properties,
          occurredAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return this.success({ id: result.id });
    } catch (error) {
      return this.handleError(error, "trackEvent");
    }
  }

  /**
   * Update session context
   */
  public async updateSessionContext(
    input: UpdateSessionContextInput,
  ): Promise<{ success: true } | { success: false; error: string }> {
    try {
      if (!this.context.session) {
        return { success: false, error: "No active session" };
      }

      // Call the update-session-context edge function
      const response = await fetch(
        "/api/functions/v1/ingest-update-session-context",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: this.context.session.id,
            geo: input.geo,
            device: input.device,
            utm: input.utm,
            properties: input.properties,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Update local context
      if (input.geo) {
        this.context.session.geo = input.geo;
      }
      if (input.device) {
        this.context.session.device = input.device;
      }
      if (input.utm) {
        this.context.session.utm = input.utm;
      }
      if (input.properties) {
        this.context.session.properties = {
          ...this.context.session.properties,
          ...input.properties,
        };
      }

      return this.success({});
    } catch (error) {
      return this.handleError(error, "updateSessionContext");
    }
  }

  /**
   * Send heartbeat
   */
  public async sendHeartbeat(): Promise<
    { success: true; data: { serverTime: string } } | {
      success: false;
      error: string;
    }
  > {
    try {
      if (!this.context.session || !this.context.user) {
        return { success: false, error: "Session or user not initialized" };
      }

      // Call the heartbeat edge function
      const response = await fetch("/api/functions/v1/ingest-heartbeat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: this.context.session.id,
          userId: this.context.user.userId!,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return this.success({ serverTime: result.serverTime });
    } catch (error) {
      return this.handleError(error, "sendHeartbeat");
    }
  }

  /**
   * Reset analytics context
   */
  public async reset(): Promise<void> {
    this.context = {
      user: null,
      session: null,
    };

    // Clear stored anonymous ID
    localStorage.removeItem("analytics_anon_id");
  }

  /**
   * Check if user is excluded from analytics
   */
  public async isUserExcluded(
    userId?: string,
    email?: string,
    anonId?: string,
  ): Promise<boolean> {
    try {
      const response = await fetch(
        "/api/functions/v1/ingest-is-user-excluded",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            email,
            anonId,
          }),
        },
      );

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.excluded || false;
    } catch (error) {
      console.error("Failed to check user exclusion:", error);
      return false;
    }
  }

  /**
   * Exclude user from analytics
   */
  public async excludeUser(
    userId?: string,
    email?: string,
    anonId?: string,
    reason?: string,
    source?: string,
  ): Promise<{ success: true } | { success: false; error: string }> {
    try {
      const response = await fetch("/api/functions/v1/ingest-exclude-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          email,
          anonId,
          reason,
          source,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return this.success({});
    } catch (error) {
      return this.handleError(error, "excludeUser");
    }
  }

  /**
   * Remove user exclusion
   */
  public async removeExclusion(
    userId?: string,
    email?: string,
    anonId?: string,
  ): Promise<{ success: true } | { success: false; error: string }> {
    try {
      const response = await fetch(
        "/api/functions/v1/ingest-remove-exclusion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            email,
            anonId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return this.success({});
    } catch (error) {
      return this.handleError(error, "removeExclusion");
    }
  }

  // Private helper methods

  private getOrCreateAnonId(): string {
    let anonId = localStorage.getItem("analytics_anon_id");
    if (!anonId) {
      anonId = this.generateAnonId();
      localStorage.setItem("analytics_anon_id", anonId);
    }
    return anonId;
  }

  private generateAnonId(): string {
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async upsertUser(
    anonId: string,
  ): Promise<
    { success: true; data: { userId: string } } | {
      success: false;
      error: string;
    }
  > {
    try {
      const response = await fetch("/api/functions/v1/ingest-upsert-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anonId,
          traits: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return this.success({ userId: result.userId });
    } catch (error) {
      return this.handleError(error, "upsertUser");
    }
  }
}

// Export singleton instance
export const analyticsTracker = new AnalyticsTracker(supabase);
