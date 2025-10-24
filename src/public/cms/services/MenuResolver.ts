import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../core/types/database.types';
import { BaseService } from '../../../core/services/BaseService';
import type { ResolvedMenu, MenuResolutionRequest, MenuResolutionResponse, MenuResolutionError } from '../types/menu.types';

export class MenuResolver extends BaseService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase);
  }

  /**
   * Resolve a menu by ID with optional site and locale filtering.
   */
  public async resolveMenu(request: MenuResolutionRequest): Promise<MenuResolutionResponse> {
    try {
      const { menu_id, site_id, locale = 'en-US' } = request;

      // Get the published version of the menu
      const { data: menuPublish, error: publishError } = await this.supabase
        .from('cms_menu_publishes')
        .select(`
          version,
          menu_version!inner(
            id,
            menu_id,
            version,
            items,
            menu!inner(
              id,
              site_id,
              handle,
              label
            )
          )
        `)
        .eq('menu_id', menu_id)
        .single();

      if (publishError) {
        return this.handleMenuResolutionError('Menu not found or not published', 'MENU_NOT_FOUND');
      }

      if (!menuPublish) {
        return this.handleMenuResolutionError('Menu not found or not published', 'MENU_NOT_FOUND');
      }

      // Check site_id if provided
      if (site_id && menuPublish.menu_version.menu.site_id !== site_id) {
        return this.handleMenuResolutionError('Menu not found for this site', 'MENU_NOT_FOUND');
      }

      // Resolve menu items with visibility filtering
      const resolvedItems = await this.resolveMenuItems(
        menuPublish.menu_version.items,
        locale
      );

      const resolvedMenu: ResolvedMenu = {
        id: menuPublish.menu_version.menu.id,
        handle: menuPublish.menu_version.menu.handle,
        label: menuPublish.menu_version.menu.label,
        items: resolvedItems,
      };

      return this.success(resolvedMenu);
    } catch (error) {
      return this.handleMenuResolutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        'RESOLUTION_ERROR'
      );
    }
  }

  /**
   * Resolve a menu by handle with optional site filtering.
   */
  public async resolveMenuByHandle(handle: string, site_id?: string): Promise<MenuResolutionResponse> {
    try {
      // First get the menu by handle
      let menuQuery = this.supabase
        .from('cms_menus')
        .select('id, site_id, handle, label')
        .eq('handle', handle);

      if (site_id) {
        menuQuery = menuQuery.eq('site_id', site_id);
      }

      const { data: menu, error: menuError } = await menuQuery.single();

      if (menuError || !menu) {
        return this.handleMenuResolutionError('Menu not found', 'MENU_NOT_FOUND');
      }

      // Now resolve the menu using the ID
      return this.resolveMenu({
        menu_id: menu.id,
        site_id: menu.site_id,
      });
    } catch (error) {
      return this.handleMenuResolutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        'RESOLUTION_ERROR'
      );
    }
  }

  /**
   * Resolve a system menu by handle.
   */
  public async resolveSystemMenu(handle: string, site_id: string): Promise<MenuResolutionResponse> {
    try {
      // System menus are typically identified by special handles
      const systemHandles = ['header', 'footer', 'sidebar', 'breadcrumb'];
      
      if (!systemHandles.includes(handle)) {
        return this.handleMenuResolutionError('Not a system menu', 'INVALID_SYSTEM_MENU');
      }

      return this.resolveMenuByHandle(handle, site_id);
    } catch (error) {
      return this.handleMenuResolutionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        'RESOLUTION_ERROR'
      );
    }
  }

  /**
   * Resolve menu items with visibility filtering.
   */
  private async resolveMenuItems(items: any[], locale: string): Promise<any[]> {
    const resolvedItems: any[] = [];

    for (const item of items) {
      // Check visibility rules
      if (item.visibility) {
        const isVisible = await this.checkItemVisibility(item.visibility, locale);
        if (!isVisible) {
          continue;
        }
      }

      // Resolve children recursively
      let resolvedChildren: any[] = [];
      if (item.children && item.children.length > 0) {
        resolvedChildren = await this.resolveMenuItems(item.children, locale);
      }

      // Create resolved item
      const resolvedItem = {
        ...item,
        children: resolvedChildren.length > 0 ? resolvedChildren : undefined,
      };

      resolvedItems.push(resolvedItem);
    }

    return resolvedItems;
  }

  /**
   * Check if a menu item should be visible based on visibility rules.
   */
  private async checkItemVisibility(visibility: any, locale: string): Promise<boolean> {
    // Check device visibility (this would typically be determined by user agent)
    if (visibility.device) {
      // For now, assume desktop - this would be determined by user agent parsing
      const currentDevice = 'desktop';
      if (!visibility.device.includes(currentDevice)) {
        return false;
      }
    }

    // Check audience visibility (this would typically be determined by user authentication)
    if (visibility.audience) {
      // For now, assume anonymous user - this would be determined by authentication state
      const currentAudience = 'anon';
      if (!visibility.audience.includes(currentAudience)) {
        return false;
      }
    }

    // Check feature flags (this would typically be determined by feature flag service)
    if (visibility.featureFlags && visibility.featureFlags.length > 0) {
      // For now, assume all feature flags are enabled - this would be determined by feature flag service
      const enabledFeatures: string[] = [];
      const hasRequiredFeature = visibility.featureFlags.some((flag: string) => 
        enabledFeatures.includes(flag)
      );
      if (!hasRequiredFeature) {
        return false;
      }
    }

    // Check schedule visibility
    if (visibility.schedule) {
      const now = new Date();
      if (visibility.schedule.start) {
        const startDate = new Date(visibility.schedule.start);
        if (now < startDate) {
          return false;
        }
      }
      if (visibility.schedule.end) {
        const endDate = new Date(visibility.schedule.end);
        if (now > endDate) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Handle menu resolution errors with proper typing.
   */
  private handleMenuResolutionError(message: string, code?: string): MenuResolutionResponse {
    const error: MenuResolutionError = {
      error: message,
      code,
    };

    return {
      success: false,
      error: message,
    };
  }
}
