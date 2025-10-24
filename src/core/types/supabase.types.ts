import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

/**
 * Typed Supabase client interface
 */
export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Common result types for service methods
 */
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ServiceError {
  success: false;
  error: string;
}

export interface ServiceSuccess<T> {
  success: true;
  data: T;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * Sort parameters
 */
export interface SortParams {
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Common filter parameters
 */
export interface BaseFilterParams {
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
}
