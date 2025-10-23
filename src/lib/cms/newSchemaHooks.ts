// New Schema React Hooks
// This file contains React hooks for the properly named schema

import { useState, useEffect, useCallback } from 'react';
import { 
  createAnalyticsUser,
  createAnalyticsSession,
  trackPageView,
  trackEvent,
  createLeadSubmission,
  getLeadSubmissions,
  getUserPermissions,
  setUserPermissions,
  logAuditAction,
  createCmsPage,
  getCmsPages,
  createCmsPageVersion,
  publishCmsPage,
  createCmsBlock,
  getCmsBlocks,
  createCmsBlockVersion,
  publishCmsBlock,
  createCmsMenu,
  getCmsMenus,
  createCmsMenuVersion,
  publishCmsMenu,
  createCmsAsset,
  getCmsAssets,
  createCmsAssetVersion,
  publishCmsAsset,
  createCmsAssetVariant,
  createCmsAssetUsage
} from './newSchemaClient';

// Analytics hooks
export function useAnalyticsUser(userId: string) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(async (properties: Record<string, any> = {}) => {
    setLoading(true);
    setError(null);

    const response = await createAnalyticsUser(userId, properties);

    if (response.error) {
      setError(response.error.message);
    } else {
      setUser(response.data);
    }

    setLoading(false);
  }, [userId]);

  return {
    user,
    loading,
    error,
    createUser
  };
}

export function useAnalyticsSession(userId: string, sessionId: string) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (properties: Record<string, any> = {}) => {
    setLoading(true);
    setError(null);

    const response = await createAnalyticsSession(userId, sessionId, properties);

    if (response.error) {
      setError(response.error.message);
    } else {
      setSession(response.data);
    }

    setLoading(false);
  }, [userId, sessionId]);

  const trackPage = useCallback(async (pagePath: string, pageTitle?: string, properties: Record<string, any> = {}) => {
    const response = await trackPageView(sessionId, userId, pagePath, pageTitle, properties);
    return response;
  }, [sessionId, userId]);

  const trackEventAction = useCallback(async (eventName: string, eventCategory?: string, eventValue?: number, properties: Record<string, any> = {}) => {
    const response = await trackEvent(sessionId, userId, eventName, eventCategory, eventValue, properties);
    return response;
  }, [sessionId, userId]);

  return {
    session,
    loading,
    error,
    createSession,
    trackPage,
    trackEvent: trackEventAction
  };
}

// Leads hooks
export function useLeadSubmissions(formName?: string, limit: number = 100) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await getLeadSubmissions(formName, limit);

    if (response.error) {
      setError(response.error.message);
    } else {
      setSubmissions(response.data || []);
    }

    setLoading(false);
  }, [formName, limit]);

  const createSubmission = useCallback(async (formName: string, formData: Record<string, any>, utmData?: Record<string, string>) => {
    const response = await createLeadSubmission(formName, formData, utmData);
    if (!response.error) {
      fetchSubmissions(); // Refresh the list
    }
    return response;
  }, [fetchSubmissions]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return {
    submissions,
    loading,
    error,
    createSubmission,
    refresh: fetchSubmissions
  };
}

// System hooks
export function useUserPermissions(userId: string) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await getUserPermissions(userId);

    if (response.error) {
      setError(response.error.message);
    } else {
      setPermissions(response.data?.permissions || []);
    }

    setLoading(false);
  }, [userId]);

  const updatePermissions = useCallback(async (newPermissions: string[]) => {
    setLoading(true);
    setError(null);

    const response = await setUserPermissions(userId, newPermissions);

    if (response.error) {
      setError(response.error.message);
    } else {
      setPermissions(newPermissions);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    updatePermissions,
    refresh: fetchPermissions
  };
}

export function useAuditLog(_userId?: string, _entityType?: string, _limit: number = 100) {
  const [logs] = useState<any[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const logAction = useCallback(async (action: string, entityType: string, entityId: string, oldValues?: Record<string, any>, newValues?: Record<string, any>) => {
    const response = await logAuditAction(_userId || '', action, entityType, entityId, oldValues, newValues);
    return response;
  }, [_userId]);

  return {
    logs,
    loading,
    error,
    logAction
  };
}

// CMS Pages hooks
export function useCmsPages(siteId: string) {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await getCmsPages(siteId);

    if (response.error) {
      setError(response.error.message);
    } else {
      setPages(response.data || []);
    }

    setLoading(false);
  }, [siteId]);

  const createPage = useCallback(async (slug: string, systemKey?: string, isSystem: boolean = false) => {
    const response = await createCmsPage(siteId, slug, systemKey, isSystem);
    if (!response.error) {
      fetchPages(); // Refresh the list
    }
    return response;
  }, [siteId, fetchPages]);

  const createPageVersion = useCallback(async (pageId: string, title: Record<string, string>, layoutVariant?: string, seo?: Record<string, any>, navHints?: Record<string, any>, slots?: any[]) => {
    const response = await createCmsPageVersion(pageId, title, layoutVariant, seo, navHints, slots);
    return response;
  }, []);

  const publishPage = useCallback(async (pageId: string, version: number) => {
    const response = await publishCmsPage(pageId, version);
    return response;
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return {
    pages,
    loading,
    error,
    createPage,
    createPageVersion,
    publishPage,
    refresh: fetchPages
  };
}

// CMS Blocks hooks
export function useCmsBlocks(siteId: string) {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await getCmsBlocks(siteId);

    if (response.error) {
      setError(response.error.message);
    } else {
      setBlocks(response.data || []);
    }

    setLoading(false);
  }, [siteId]);

  const createBlock = useCallback(async (type: string, tag?: string, systemKey?: string, isSystem: boolean = false) => {
    const response = await createCmsBlock(siteId, type, tag, systemKey, isSystem);
    if (!response.error) {
      fetchBlocks(); // Refresh the list
    }
    return response;
  }, [siteId, fetchBlocks]);

  const createBlockVersion = useCallback(async (blockId: string, layoutVariant?: string, content?: Record<string, any>, assets?: any[]) => {
    const response = await createCmsBlockVersion(blockId, layoutVariant, content, assets);
    return response;
  }, []);

  const publishBlock = useCallback(async (blockId: string, version: number) => {
    const response = await publishCmsBlock(blockId, version);
    return response;
  }, []);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  return {
    blocks,
    loading,
    error,
    createBlock,
    createBlockVersion,
    publishBlock,
    refresh: fetchBlocks
  };
}

// CMS Menus hooks
export function useCmsMenus(siteId: string) {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await getCmsMenus(siteId);

    if (response.error) {
      setError(response.error.message);
    } else {
      setMenus(response.data || []);
    }

    setLoading(false);
  }, [siteId]);

  const createMenu = useCallback(async (handle: string, label: string, systemKey?: string, isSystem: boolean = false) => {
    const response = await createCmsMenu(siteId, handle, label, systemKey, isSystem);
    if (!response.error) {
      fetchMenus(); // Refresh the list
    }
    return response;
  }, [siteId, fetchMenus]);

  const createMenuVersion = useCallback(async (menuId: string, items: any[]) => {
    const response = await createCmsMenuVersion(menuId, items);
    return response;
  }, []);

  const publishMenu = useCallback(async (menuId: string, version: number) => {
    const response = await publishCmsMenu(menuId, version);
    return response;
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  return {
    menus,
    loading,
    error,
    createMenu,
    createMenuVersion,
    publishMenu,
    refresh: fetchMenus
  };
}

// CMS Assets hooks
export function useCmsAssets(siteId: string) {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await getCmsAssets(siteId);

    if (response.error) {
      setError(response.error.message);
    } else {
      setAssets(response.data || []);
    }

    setLoading(false);
  }, [siteId]);

  const createAsset = useCallback(async (kind: string, storageKey: string, width?: number, height?: number, durationMs?: number) => {
    const response = await createCmsAsset(siteId, kind, storageKey, width, height, durationMs);
    if (!response.error) {
      fetchAssets(); // Refresh the list
    }
    return response;
  }, [siteId, fetchAssets]);

  const createAssetVersion = useCallback(async (assetId: string, meta?: Record<string, any>, editOperation?: Record<string, any>) => {
    const response = await createCmsAssetVersion(assetId, meta, editOperation);
    return response;
  }, []);

  const publishAsset = useCallback(async (assetId: string, version: number) => {
    const response = await publishCmsAsset(assetId, version);
    return response;
  }, []);

  const createAssetVariant = useCallback(async (assetId: string, variantName: string, storageKey: string, width?: number, height?: number, fileSize?: number) => {
    const response = await createCmsAssetVariant(assetId, variantName, storageKey, width, height, fileSize);
    return response;
  }, []);

  const createAssetUsage = useCallback(async (assetId: string, entityType: string, entityId: string, role?: string) => {
    const response = await createCmsAssetUsage(assetId, entityType, entityId, role);
    return response;
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    loading,
    error,
    createAsset,
    createAssetVersion,
    publishAsset,
    createAssetVariant,
    createAssetUsage,
    refresh: fetchAssets
  };
}
