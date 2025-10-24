import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

/**
 * Base service class that all feature services extend
 * Provides common functionality and enforces constructor injection pattern
 */
export abstract class BaseService {
  protected readonly supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  /**
   * Common error handling for service methods
   */
  protected handleError(error: unknown, context: string): { success: false; error: string } {
    console.error(`Error in ${context}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }

  /**
   * Common success response wrapper
   */
  protected success<T>(data: T): { success: true; data: T } {
    return { success: true, data };
  }
}
