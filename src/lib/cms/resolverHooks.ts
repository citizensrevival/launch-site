// Resolution React Hooks
// This file contains React hooks for content resolution

import { useState, useEffect, useCallback } from 'react';
import { 
  resolvePage, 
  resolveMenu, 
  resolvePageBySlug, 
  resolveMenuByHandle,
  getPublishedPages,
  getPublishedMenus,
  ResolvedPage,
  ResolvedMenu
} from './resolver';
import { ApiResponse } from './types';
import { supabase } from '../../shell/lib/supabase';

// Hook for resolving a page by ID
export function useResolvePage(pageId: string, locale: string = 'en-US') {
  const [page, setPage] = useState<ResolvedPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async () => {
    if (!pageId) return;

    setLoading(true);
    setError(null);

    const response = await resolvePage(pageId, locale);

    if (response.error) {
      setError(response.error);
    } else {
      setPage(response.data);
    }

    setLoading(false);
  }, [pageId, locale]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return {
    page,
    loading,
    error,
    refresh: fetchPage
  };
}

// Hook for resolving a page by slug
export function useResolvePageBySlug(slug: string, siteId: string, locale: string = 'en-US') {
  const [page, setPage] = useState<ResolvedPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async () => {
    if (!slug || !siteId) return;

    setLoading(true);
    setError(null);

    const response = await resolvePageBySlug(slug, siteId, locale);

    if (response.error) {
      setError(response.error);
    } else {
      setPage(response.data);
    }

    setLoading(false);
  }, [slug, siteId, locale]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return {
    page,
    loading,
    error,
    refresh: fetchPage
  };
}

// Hook for resolving a menu by ID
export function useResolveMenu(menuId: string, locale: string = 'en-US') {
  const [menu, setMenu] = useState<ResolvedMenu | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    if (!menuId) return;

    setLoading(true);
    setError(null);

    const response = await resolveMenu(menuId, locale);

    if (response.error) {
      setError(response.error);
    } else {
      setMenu(response.data);
    }

    setLoading(false);
  }, [menuId, locale]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return {
    menu,
    loading,
    error,
    refresh: fetchMenu
  };
}

// Hook for resolving a menu by handle
export function useResolveMenuByHandle(handle: string, siteId: string, locale: string = 'en-US') {
  const [menu, setMenu] = useState<ResolvedMenu | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    if (!handle || !siteId) return;

    setLoading(true);
    setError(null);

    const response = await resolveMenuByHandle(handle, siteId, locale);

    if (response.error) {
      setError(response.error);
    } else {
      setMenu(response.data);
    }

    setLoading(false);
  }, [handle, siteId, locale]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return {
    menu,
    loading,
    error,
    refresh: fetchMenu
  };
}

// Hook for getting all published pages
export function usePublishedPages(siteId: string) {
  const [pages, setPages] = useState<Array<{
    id: string;
    slug: string;
    title: Record<string, string>;
    published_at: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    if (!siteId) return;

    setLoading(true);
    setError(null);

    const response = await getPublishedPages(siteId);

    if (response.error) {
      setError(response.error);
    } else {
      setPages(response.data || []);
    }

    setLoading(false);
  }, [siteId]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return {
    pages,
    loading,
    error,
    refresh: fetchPages
  };
}

// Hook for getting all published menus
export function usePublishedMenus(siteId: string) {
  const [menus, setMenus] = useState<Array<{
    id: string;
    handle: string;
    label: string;
    published_at: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenus = useCallback(async () => {
    if (!siteId) return;

    setLoading(true);
    setError(null);

    const response = await getPublishedMenus(siteId);

    if (response.error) {
      setError(response.error);
    } else {
      setMenus(response.data || []);
    }

    setLoading(false);
  }, [siteId]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  return {
    menus,
    loading,
    error,
    refresh: fetchMenus
  };
}

// Hook for content preview (resolves content without publishing requirements)
export function useContentPreview(contentType: 'page' | 'block' | 'menu', contentId: string) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    if (!contentId) return;

    setLoading(true);
    setError(null);

    try {
      let response: ApiResponse<any>;

      if (contentType === 'page') {
        // For pages, get the latest version (not necessarily published)
        const { data, error } = await supabase
          .from('page_version')
          .select(`
            version,
            title,
            layout_variant,
            seo,
            nav_hints,
            slots,
            created_at,
            created_by
          `)
          .eq('page_id', contentId)
          .order('version', { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          setError('Content not found');
          setLoading(false);
          return;
        }

        response = { data, error: null };
      } else if (contentType === 'block') {
        // For blocks, get the latest version
        const { data, error } = await supabase
          .from('block_version')
          .select(`
            version,
            layout_variant,
            content,
            assets,
            created_at,
            created_by
          `)
          .eq('block_id', contentId)
          .order('version', { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          setError('Content not found');
          setLoading(false);
          return;
        }

        response = { data, error: null };
      } else if (contentType === 'menu') {
        // For menus, get the latest version
        const { data, error } = await supabase
          .from('menu_version')
          .select(`
            version,
            items,
            created_at,
            created_by
          `)
          .eq('menu_id', contentId)
          .order('version', { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          setError('Content not found');
          setLoading(false);
          return;
        }

        response = { data, error: null };
      } else {
        setError('Invalid content type');
        setLoading(false);
        return;
      }

      if (response.error) {
        setError(response.error);
      } else {
        setContent(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }

    setLoading(false);
  }, [contentType, contentId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    content,
    loading,
    error,
    refresh: fetchContent
  };
}
