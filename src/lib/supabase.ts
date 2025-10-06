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
    if (!config.serviceRoleKey) {
      throw new Error('Service role key is required for admin operations');
    }
    return createClient(config.url, config.serviceRoleKey);
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
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    // Temporary debug logging
    console.log('=== Supabase Environment Variables Debug ===');
    console.log('All import.meta.env:', import.meta.env);
    console.log('VITE_SUPABASE_URL:', url);
    console.log('VITE_SUPABASE_ANON_KEY:', anonKey ? `${anonKey.substring(0, 20)}...` : 'NOT SET');
    console.log('VITE_SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? `${serviceRoleKey.substring(0, 20)}...` : 'NOT SET');
    console.log('URL length:', url?.length);
    console.log('Anon key length:', anonKey?.length);
    console.log('Service role key length:', serviceRoleKey?.length);
    console.log('=== End Debug ===');

    if (!url || !anonKey) {
      console.error('Missing required Supabase configuration:', { url, anonKey });
      throw new Error('Missing required Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    }

    return {
      url,
      anonKey,
      serviceRoleKey,
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
