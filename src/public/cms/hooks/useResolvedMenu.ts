import { useState, useEffect, useCallback } from 'react';
import { MenuResolver } from '../services/MenuResolver';
import { supabase } from '../../../core/supabase';
import type { ResolvedMenu, MenuResolutionRequest } from '../types/menu.types';

const menuResolver = new MenuResolver(supabase);

/**
 * Hook for resolving a menu by ID.
 */
export function useResolvedMenu(request: MenuResolutionRequest) {
  const [menu, setMenu] = useState<ResolvedMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    if (!request.menu_id) return;

    setLoading(true);
    setError(null);

    const result = await menuResolver.resolveMenu(request);

    if (result.success) {
      setMenu(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  }, [request.menu_id, request.site_id, request.locale]);

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
 * Hook for resolving a menu by handle.
 */
export function useResolvedMenuByHandle(handle: string, site_id?: string) {
  const [menu, setMenu] = useState<ResolvedMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    if (!handle) return;

    setLoading(true);
    setError(null);

    const result = await menuResolver.resolveMenuByHandle(handle, site_id);

    if (result.success) {
      setMenu(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  }, [handle, site_id]);

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
 * Hook for resolving a system menu.
 */
export function useResolvedSystemMenu(handle: string, site_id: string) {
  const [menu, setMenu] = useState<ResolvedMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    if (!handle || !site_id) return;

    setLoading(true);
    setError(null);

    const result = await menuResolver.resolveSystemMenu(handle, site_id);

    if (result.success) {
      setMenu(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  }, [handle, site_id]);

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
