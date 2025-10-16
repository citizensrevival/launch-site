// CMS React Hooks
// This file contains React hooks for CMS content management

import { useState, useEffect, useCallback } from 'react';
import type {
  Site, Page, PageVersion, Asset, AssetVersion,
  ResolvedPage, ResolvedBlock, ResolvedAsset, ResolvedMenu,
  UserPermissions, AuditLogEntry, ContentFilters, ContentSort,
  PaginatedResponse, AssetMeta
} from './types';
import {
  getSites, getSite, getPages, getPage,
  getPageVersions, createPage, updatePage, deletePage,
  publishPage, unpublishPage,
  getPublishedPage, getPublishedPageByKey, getPublishedBlockByKey,
  getPublishedAssetByKey, getPublishedMenuByKey, getUserPermissions,
  getAuditLog, hasPermission as checkPermission, getAssets, getAsset, uploadAsset,
  updateAsset, deleteAsset, getAssetVersions,
  publishAsset, unpublishAsset
} from './client';

// Site hooks
export function useSites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSites() {
      try {
        setLoading(true);
        const response = await getSites();
        if (response.error) {
          setError(response.error);
        } else {
          setSites(response.data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchSites();
  }, []);

  return { sites, loading, error };
}

export function useSite(siteId: string) {
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSite() {
      try {
        setLoading(true);
        const response = await getSite(siteId);
        if (response.error) {
          setError(response.error);
        } else {
          setSite(response.data || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (siteId) {
      fetchSite();
    }
  }, [siteId]);

  return { site, loading, error };
}

// Page hooks
export function usePages(
  siteId: string,
  filters?: ContentFilters,
  sort?: ContentSort,
  page = 1,
  pageSize = 20
) {
  const [pages, setPages] = useState<PaginatedResponse<Page> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPages() {
      try {
        setLoading(true);
        const response = await getPages(siteId, filters, sort, page, pageSize);
        if (response.error) {
          setError(response.error);
        } else {
          setPages(response.data || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (siteId) {
      fetchPages();
    }
  }, [siteId, filters, sort, page, pageSize]);

  return { pages, loading, error };
}

export function usePage(pageId: string) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      try {
        setLoading(true);
        const response = await getPage(pageId);
        if (response.error) {
          setError(response.error);
        } else {
          setPage(response.data || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (pageId) {
      fetchPage();
    }
  }, [pageId]);

  return { page, loading, error };
}

export function usePageVersions(pageId: string) {
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVersions() {
      try {
        setLoading(true);
        const response = await getPageVersions(pageId);
        if (response.error) {
          setError(response.error);
        } else {
          setVersions(response.data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (pageId) {
      fetchVersions();
    }
  }, [pageId]);

  return { versions, loading, error };
}

// Published content hooks
export function usePublishedPage(siteHandle: string, slug: string, locale = 'en-US') {
  const [page, setPage] = useState<ResolvedPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      try {
        setLoading(true);
        const response = await getPublishedPage(siteHandle, slug, locale);
        if (response.error) {
          setError(response.error);
        } else {
          setPage(response.data || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (siteHandle && slug) {
      fetchPage();
    }
  }, [siteHandle, slug, locale]);

  return { page, loading, error };
}

export function usePublishedPageByKey(systemKey: string, locale = 'en-US') {
  const [page, setPage] = useState<ResolvedPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      try {
        setLoading(true);
        const response = await getPublishedPageByKey(systemKey, locale);
        if (response.error) {
          setError(response.error);
        } else {
          setPage(response.data || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (systemKey) {
      fetchPage();
    }
  }, [systemKey, locale]);

  return { page, loading, error };
}

export function usePublishedBlock(systemKey: string, locale = 'en-US') {
  const [block, setBlock] = useState<ResolvedBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlock() {
      try {
        setLoading(true);
        const response = await getPublishedBlockByKey(systemKey, locale);
        if (response.error) {
          setError(response.error);
        } else {
          setBlock(response.data || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (systemKey) {
      fetchBlock();
    }
  }, [systemKey, locale]);

  return { block, loading, error };
}

export function usePublishedAsset(systemKey: string) {
  const [asset, setAsset] = useState<ResolvedAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAsset() {
      try {
        setLoading(true);
        const response = await getPublishedAssetByKey(systemKey);
        if (response.error) {
          setError(response.error);
        } else {
          setAsset(response.data || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (systemKey) {
      fetchAsset();
    }
  }, [systemKey]);

  return { asset, loading, error };
}

export function usePublishedMenu(systemKey: string, locale = 'en-US') {
  const [menu, setMenu] = useState<ResolvedMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true);
        const response = await getPublishedMenuByKey(systemKey, locale);
        if (response.error) {
          setError(response.error);
        } else {
          setMenu(response.data || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (systemKey) {
      fetchMenu();
    }
  }, [systemKey, locale]);

  return { menu, loading, error };
}

// Permission hooks
export function useUserPermissions(userId: string) {
  const [permissions, setPermissions] = useState<UserPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPermissions() {
      try {
        setLoading(true);
        const response = await getUserPermissions(userId);
        if (response.error) {
          setError(response.error);
        } else {
          setPermissions(response.data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchPermissions();
    }
  }, [userId]);

  return { permissions, loading, error };
}

export function usePermission(permission: string) {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkUserPermission() {
      try {
        setLoading(true);
        const result = await checkPermission(permission);
        setHasPermission(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    }

    checkUserPermission();
  }, [permission]);

  return { hasPermission, loading, error };
}

// Audit log hooks
export function useAuditLog(
  entityType?: string,
  entityId?: string,
  page = 1,
  pageSize = 50
) {
  const [auditLog, setAuditLog] = useState<PaginatedResponse<AuditLogEntry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAuditLog() {
      try {
        setLoading(true);
        const response = await getAuditLog(entityType, entityId, page, pageSize);
        if (response.error) {
          setError(response.error);
        } else {
          setAuditLog(response.data || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchAuditLog();
  }, [entityType, entityId, page, pageSize]);

  return { auditLog, loading, error };
}

// Content management hooks
export function usePageManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPageHandler = useCallback(async (pageData: Omit<Page, 'id' | 'created_at' | 'created_by'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createPage(pageData);
      if (response.error) {
        setError(response.error);
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePageHandler = useCallback(async (pageId: string, updates: Partial<Page>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updatePage(pageId, updates);
      if (response.error) {
        setError(response.error);
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePageHandler = useCallback(async (pageId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await deletePage(pageId);
      if (response.error) {
        setError(response.error);
        return false;
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const publishPageHandler = useCallback(async (pageId: string, version: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await publishPage(pageId, version);
      if (response.error) {
        setError(response.error);
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const unpublishPageHandler = useCallback(async (pageId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await unpublishPage(pageId);
      if (response.error) {
        setError(response.error);
        return false;
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createPage: createPageHandler,
    updatePage: updatePageHandler,
    deletePage: deletePageHandler,
    publishPage: publishPageHandler,
    unpublishPage: unpublishPageHandler,
    loading,
    error
  };
}

// Asset hooks
export function useAssets(
  siteId: string,
  filters?: ContentFilters,
  sort?: ContentSort,
  page = 1,
  pageSize = 20
) {
  const [assets, setAssets] = useState<PaginatedResponse<Asset> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAssets() {
      try {
        setLoading(true);
        const response = await getAssets(siteId, filters, sort, page, pageSize);
        if (response.error) {
          setError(response.error);
        } else {
          setAssets(response.data || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (siteId) {
      fetchAssets();
    }
  }, [siteId, filters, sort, page, pageSize]);

  return { assets, loading, error };
}

export function useAsset(assetId: string) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAsset() {
      try {
        setLoading(true);
        const response = await getAsset(assetId);
        if (response.error) {
          setError(response.error);
        } else {
          setAsset(response.data || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (assetId) {
      fetchAsset();
    }
  }, [assetId]);

  return { asset, loading, error };
}

export function useAssetVersions(assetId: string) {
  const [versions, setVersions] = useState<AssetVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVersions() {
      try {
        setLoading(true);
        const response = await getAssetVersions(assetId);
        if (response.error) {
          setError(response.error);
        } else {
          setVersions(response.data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (assetId) {
      fetchVersions();
    }
  }, [assetId]);

  return { versions, loading, error };
}

// Asset management hooks
export function useAssetManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAssetHandler = useCallback(async (
    siteId: string,
    file: File,
    meta?: Partial<AssetMeta>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await uploadAsset(siteId, file, meta);
      if (response.error) {
        setError(response.error);
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAssetHandler = useCallback(async (assetId: string, updates: Partial<Asset>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateAsset(assetId, updates);
      if (response.error) {
        setError(response.error);
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAssetHandler = useCallback(async (assetId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await deleteAsset(assetId);
      if (response.error) {
        setError(response.error);
        return false;
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const publishAssetHandler = useCallback(async (assetId: string, version: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await publishAsset(assetId, version);
      if (response.error) {
        setError(response.error);
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const unpublishAssetHandler = useCallback(async (assetId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await unpublishAsset(assetId);
      if (response.error) {
        setError(response.error);
        return false;
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    uploadAsset: uploadAssetHandler,
    updateAsset: updateAssetHandler,
    deleteAsset: deleteAssetHandler,
    publishAsset: publishAssetHandler,
    unpublishAsset: unpublishAssetHandler,
    loading,
    error
  };
}

// Preview mode hook
export function usePreviewMode() {
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setIsPreview(urlParams.get('preview') === 'true');
  }, []);

  return { isPreview, setIsPreview };
}
