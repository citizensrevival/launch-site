/**
 * Edge function types for CMS Menu resolution
 * Extracted from supabase/functions/resolveMenu/index.ts
 */

// ================================================
// Request Types
// ================================================

export interface ResolveMenuRequest {
  menu_id: string;
  site_id?: string;
  locale?: string;
}

// ================================================
// Response Types
// ================================================

export interface ResolvedMenu {
  id: string;
  handle: string;
  label: string;
  items: ResolvedMenuItem[];
  published_at: string;
  published_by: string;
}

export interface ResolvedMenuItem {
  id: string;
  type: 'page' | 'external' | 'anchor' | 'separator' | 'group';
  label: Record<string, string>;
  target?: string;
  rel?: string;
  children?: ResolvedMenuItem[];
  visibility?: {
    device?: Array<'mobile' | 'desktop'>;
    audience?: Array<'anon' | 'user' | 'admin'>;
    featureFlags?: string[];
    schedule?: { start?: string; end?: string };
  };
  badge?: {
    text: Record<string, string>;
    color: string;
  };
  style_hints?: Record<string, any>;
}

// ================================================
// Error Types
// ================================================

export interface MenuResolutionError {
  error: string;
}
