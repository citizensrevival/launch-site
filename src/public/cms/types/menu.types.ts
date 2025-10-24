/**
 * Public CMS Menu types
 * For menu resolution and public-facing menu operations
 */

export interface ResolvedMenu {
  id: string;
  handle: string;
  label: string;
  items: ResolvedMenuItem[];
}

export interface ResolvedMenuItem {
  id: string;
  type: 'page' | 'external' | 'anchor' | 'separator' | 'group';
  label: Record<string, string>; // i18n labels
  target?: string;
  rel?: string;
  children?: ResolvedMenuItem[];
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

export interface MenuResolutionRequest {
  menu_id: string;
  site_id?: string;
  locale?: string;
}

export type MenuResolutionResponse = {
  success: true;
  data: ResolvedMenu;
} | {
  success: false;
  error: string;
}

export interface MenuResolutionError {
  error: string;
  code?: string;
  details?: string;
}
