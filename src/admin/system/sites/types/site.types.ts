/**
 * System Sites types
 * Based on database schema for system_sites table
 */

import type { Json } from '../../../../core/types/database.types';

export interface Site {
  id: string;
  name: string;
  slug: string;
  domain: string;
  default_locale: string;
  settings: Json | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSiteInput {
  name: string;
  slug: string;
  domain?: string;
  description?: string;
  settings?: Record<string, any>;
}

export interface UpdateSiteInput {
  name?: string;
  slug?: string;
  domain?: string;
  description?: string;
  settings?: Record<string, any>;
}

export interface SiteFilters {
  search?: string;
  domain?: string;
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
}

export interface SiteListResult {
  sites: Site[];
  total: number;
  hasMore: boolean;
}
