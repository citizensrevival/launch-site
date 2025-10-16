import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from './types';

/**
 * Supabase client factory with dependency injection
 */
export class SupabaseClientFactory {
  private static instance: SupabaseClient | null = null;

  /**
   * Creates a Supabase client with the provided configuration
   */
  static createClient(config: SupabaseConfig): SupabaseClient {
    return createClient(config.url, config.anonKey);
  }

  /**
   * Creates a Supabase client with service role key for admin operations
   */
  static createAdminClient(config: SupabaseConfig): SupabaseClient {
    if (!config.anonKey) {
      throw new Error('Service role key is required for admin operations');
    }
    return createClient(config.url, config.anonKey);
  }

  /**
   * Gets or creates a singleton instance of the Supabase client
   */
  static getInstance(config: SupabaseConfig): SupabaseClient {
    if (!this.instance) {
      this.instance = this.createClient(config);
    }
    return this.instance;
  }

  /**
   * Resets the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    this.instance = null;
  }
}

/**
 * Configuration provider interface for dependency injection
 */
export interface ConfigProvider {
  getSupabaseConfig(): SupabaseConfig;
}

/**
 * Environment-based configuration provider
 */
export class EnvironmentConfigProvider implements ConfigProvider {
  getSupabaseConfig(): SupabaseConfig {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log('[EnvironmentConfigProvider] Loading Supabase config:', {
      url,
      anonKeyPresent: !!anonKey,
      anonKeyPrefix: anonKey ? anonKey.substring(0, 20) + '...' : 'NOT SET'
    });

    if (!url) {
      throw new Error(
        'VITE_SUPABASE_URL environment variable is required. ' +
        'Please set it in your .env.local file or environment variables.'
      );
    }

    if (!anonKey) {
      throw new Error(
        'VITE_SUPABASE_ANON_KEY environment variable is required. ' +
        'Please set it in your .env.local file or environment variables.'
      );
    }

    return {
      url,
      anonKey,
      serviceRoleKey: undefined, // Service role key should never be used in client-side apps
    };
  }
}

/**
 * Custom configuration provider for testing or specific use cases
 */
export class CustomConfigProvider implements ConfigProvider {
  constructor(private config: SupabaseConfig) {}

  getSupabaseConfig(): SupabaseConfig {
    return this.config;
  }
}

// Create a default client instance
const configProvider = new EnvironmentConfigProvider();
const config = configProvider.getSupabaseConfig();
export const supabase = SupabaseClientFactory.createClient(config);
