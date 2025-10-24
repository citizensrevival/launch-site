/**
 * CMS Menus types
 * Based on database schema for menu, menu_version, menu_publish tables
 */

import type { Json } from '../../../../core/types/database.types';

export interface Menu {
  id: string;
  site_id: string | null;
  handle: string;
  label: string;
  created_at: string;
  updated_at: string;
  is_system: boolean | null;
  system_key: string | null;
}

export interface MenuVersion {
  id: string;
  menu_id: string | null;
  version: number;
  items: Json | null;
  created_at: string;
  created_by: string | null;
}

export interface MenuItem {
  id: string;
  type: 'page' | 'external' | 'anchor' | 'separator' | 'group';
  label: Record<string, string>; // i18n labels
  target?: string;
  rel?: string;
  children?: MenuItem[];
  visibility?: {
    device?: Array<'mobile' | 'desktop'>;
    audience?: Array<'anon' | 'user' | 'admin'>;
    featureFlags?: string[];
    schedule?: {
      start?: string;
      end?: string;
    };
  };
  badge?: {
    text: Record<string, string>;
    color: string;
  };
  style_hints?: Record<string, any>;
}

export interface MenuPublish {
  menu_id: string;
  version: number;
  published_at: string;
  published_by: string;
}

export interface CreateMenuInput {
  site_id: string;
  handle: string;
  label: string;
  created_by: string;
}

export interface UpdateMenuInput {
  handle?: string;
  label?: string;
}

export interface CreateMenuVersionInput {
  menu_id: string;
  items: MenuItem[];
  created_by: string;
}

export interface UpdateMenuVersionInput {
  items?: MenuItem[];
}

export interface MenuFilters {
  handle?: string;
  label?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface MenuSortOptions {
  field: 'created_at' | 'updated_at' | 'handle' | 'label';
  direction: 'asc' | 'desc';
}

export interface MenuListResponse {
  menus: Menu[];
  totalCount: number;
  hasMore: boolean;
}

export interface MenuResponse extends Menu {}

export interface MenuUsage {
  menu_id: string;
  usage_count: number;
}
