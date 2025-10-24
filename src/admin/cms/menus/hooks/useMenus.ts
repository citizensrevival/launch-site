import { useState, useEffect, useCallback } from 'react';
import { MenuService } from '../services/MenuService';
import { supabase } from '../../../../core/supabase';
import type { Menu, CreateMenuInput, UpdateMenuInput, MenuFilters, MenuSortOptions, MenuListResponse, MenuVersion, CreateMenuVersionInput, UpdateMenuVersionInput } from '../types/menu.types';

const menuService = new MenuService(supabase);

/**
 * Hook for managing a list of menus with filtering, sorting, and pagination.
 */
export function useMenus(
  filters: MenuFilters = {},
  sortBy: MenuSortOptions = { field: 'created_at', direction: 'desc' },
  limit: number = 50
) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);

  const fetchMenus = useCallback(async (resetOffset = false) => {
    setLoading(true);
    setError(null);

    const currentOffset = resetOffset ? 0 : offset;
    const result = await menuService.listMenus(filters, sortBy, limit, currentOffset);

    if (result.success) {
      if (resetOffset) {
        setMenus(result.data.menus);
        setOffset(limit);
      } else {
        setMenus(prev => [...prev, ...result.data.menus]);
        setOffset(prev => prev + limit);
      }
      setHasMore(result.data.hasMore);
      setTotalCount(result.data.totalCount);
    } else {
      setError(result.error);
    }

    setLoading(false);
  }, [filters, sortBy, limit, offset]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchMenus(false);
    }
  }, [loading, hasMore, fetchMenus]);

  const refresh = useCallback(() => {
    setOffset(0);
    fetchMenus(true);
  }, [fetchMenus]);

  useEffect(() => {
    fetchMenus(true);
  }, [filters, sortBy, limit]);

  return {
    menus,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh,
  };
}

/**
 * Hook for managing a single menu.
 */
export function useMenu(menuId: string) {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    if (!menuId) return;

    setLoading(true);
    setError(null);

    const result = await menuService.getMenu(menuId);

    if (result.success) {
      setMenu(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  }, [menuId]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return {
    menu,
    loading,
    error,
    refresh: fetchMenu,
  };
}

/**
 * Hook for menu management actions (create, update, delete).
 */
export function useMenuActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMenu = useCallback(async (input: CreateMenuInput) => {
    setLoading(true);
    setError(null);

    const result = await menuService.createMenu(input);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  const updateMenu = useCallback(async (id: string, updates: UpdateMenuInput) => {
    setLoading(true);
    setError(null);

    const result = await menuService.updateMenu(id, updates);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  const deleteMenu = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    const result = await menuService.deleteMenu(id);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  return {
    loading,
    error,
    createMenu,
    updateMenu,
    deleteMenu,
  };
}

/**
 * Hook for managing menu versions.
 */
export function useMenuVersions(menuId: string) {
  const [versions, setVersions] = useState<MenuVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    if (!menuId) return;

    setLoading(true);
    setError(null);

    const result = await menuService.getMenuVersions(menuId);

    if (result.success) {
      setVersions(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  }, [menuId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  return {
    versions,
    loading,
    error,
    refresh: fetchVersions,
  };
}

/**
 * Hook for menu version management actions.
 */
export function useMenuVersionActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMenuVersion = useCallback(async (input: CreateMenuVersionInput) => {
    setLoading(true);
    setError(null);

    const result = await menuService.createMenuVersion(input);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  const updateMenuVersion = useCallback(async (menuId: string, version: number, updates: UpdateMenuVersionInput) => {
    setLoading(true);
    setError(null);

    const result = await menuService.updateMenuVersion(menuId, version, updates);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  const publishMenu = useCallback(async (menuId: string, version: number, publishedBy: string) => {
    setLoading(true);
    setError(null);

    const result = await menuService.publishMenu(menuId, version, publishedBy);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  return {
    loading,
    error,
    createMenuVersion,
    updateMenuVersion,
    publishMenu,
  };
}

/**
 * Hook for getting the published version of a menu.
 */
export function usePublishedMenu(menuId: string) {
  const [publishedMenu, setPublishedMenu] = useState<MenuVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublishedMenu = useCallback(async () => {
    if (!menuId) return;

    setLoading(true);
    setError(null);

    const result = await menuService.getPublishedMenu(menuId);

    if (result.success) {
      setPublishedMenu(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  }, [menuId]);

  useEffect(() => {
    fetchPublishedMenu();
  }, [fetchPublishedMenu]);

  return {
    publishedMenu,
    loading,
    error,
    refresh: fetchPublishedMenu,
  };
}

/**
 * Hook for menu version management (legacy compatibility).
 */
export function useMenuVersionManagement() {
  const { createMenuVersion, loading, error } = useMenuVersionActions();
  
  return {
    createMenuVersion,
    loading,
    error,
  };
}

/**
 * Hook for menu management (legacy compatibility).
 */
export function useMenuManagement() {
  const { publishMenu, loading, error } = useMenuVersionActions();
  
  return {
    publishMenu,
    loading,
    error,
  };
}
