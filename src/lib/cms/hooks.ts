// CMS React Hooks
// This file contains React hooks for CMS content management

import { useState, useEffect, useCallback } from 'react';
export { useSites } from './hooks/sites';
import type {
  Site, Page, PageVersion, Asset, AssetVersion, Block, BlockVersion,
  ResolvedPage, ResolvedBlock, ResolvedAsset, ResolvedMenu,
  UserPermissions, AuditLogEntry, ContentFilters, ContentSort,
  PaginatedResponse, AssetMeta
} from './types';
import {
  getSite, getPages, getPage,
  getPageVersions, createPage, updatePage, deletePage,
  createPageVersion, updatePageVersion,
  publishPage, unpublishPage,
  getBlocks, getBlock, createBlock, updateBlock, deleteBlock,
  getBlockVersions, createBlockVersion, updateBlockVersion,
  publishBlock, unpublishBlock, getBlockUsageCount,
  getPublishedPage, getPublishedPageByKey, getPublishedBlockByKey,
  getPublishedAssetByKey, getPublishedMenuByKey, getUserPermissions,
  getAuditLog, hasPermission as checkPermission, getAssets, getAsset, uploadAsset,
  updateAsset, deleteAsset, getAssetVersions,
  publishAsset, unpublishAsset, generateAssetVariants, getAssetVariants,
  saveEditedAsset, updateExistingAsset,
  type AssetVariant
} from './client';

// Site hooks

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

  const createPageHandler = useCallback(async (pageData: Omit<Page, 'id'>) => {
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

// Page version management hook
export function usePageVersionManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPageVersionHandler = useCallback(async (versionData: Omit<PageVersion, 'id' | 'created_at' | 'created_by'>) => {
    try {
      setLoading(true);
      setError(null);
      console.log('usePageVersionManagement: calling createPageVersion with:', versionData);
      const response = await createPageVersion(versionData);
      console.log('usePageVersionManagement: createPageVersion response:', response);
      if (response.error) {
        console.error('usePageVersionManagement: createPageVersion error:', response.error);
        setError(response.error);
        return null;
      }
      console.log('usePageVersionManagement: returning data:', response.data);
      return response.data;
    } catch (err) {
      console.error('usePageVersionManagement: catch block error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePageVersionHandler = useCallback(async (pageId: string, version: number, updates: Partial<PageVersion>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updatePageVersion(pageId, version, updates);
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

  return {
    createPageVersion: createPageVersionHandler,
    updatePageVersion: updatePageVersionHandler,
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

  const fetchAssets = useCallback(async () => {
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
  }, [siteId, filters, sort, page, pageSize]);

  useEffect(() => {
    if (siteId && siteId.trim() !== '') {
      fetchAssets();
    } else {
      // Reset state when no siteId
      setAssets(null);
      setLoading(false);
      setError(null);
    }
  }, [siteId, fetchAssets]);

  return { assets, loading, error, refresh: fetchAssets };
}

export function useAsset(assetId: string) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAsset = useCallback(async () => {
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
  }, [assetId]);

  useEffect(() => {
    if (assetId) {
      fetchAsset();
    }
  }, [assetId, fetchAsset]);

  return { asset, loading, error, refresh: fetchAsset };
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

export function useAssetVariants(assetId: string) {
  const [variants, setVariants] = useState<AssetVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVariants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAssetVariants(assetId);
      if (response.error) {
        setError(response.error);
      } else {
        setVariants(response.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    if (assetId) {
      fetchVariants();
    }
  }, [assetId, fetchVariants]);

  return { variants, loading, error, refresh: fetchVariants };
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
      
      // Skip bucket initialization - bucket should exist from seed script
      console.log('Skipping bucket initialization, proceeding with upload');
      
      const response = await uploadAsset(siteId, file, meta);
      if (response.error) {
        setError(response.error);
        return null;
      }
      
      // If asset is an image, trigger variant generation
      if (response.data && response.data.kind === 'image') {
        console.log('Triggering variant generation for image asset:', response.data.id);
        // Fire and forget - don't wait for variant generation to complete
        generateAssetVariants(response.data.id).catch((err) => {
          console.error('Failed to generate variants:', err);
          // Don't fail the upload if variant generation fails
        });
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

  const saveEditedAssetHandler = useCallback(async (
    originalAssetId: string,
    editedImageBlob: Blob,
    editOperation: import('../cms/types').AssetEditOperation,
    createNew: boolean
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Choose function based on whether to create new or update existing
      const response = createNew 
        ? await saveEditedAsset(originalAssetId, editedImageBlob, editOperation)
        : await updateExistingAsset(originalAssetId, editedImageBlob, editOperation);
      
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error, data: null };
      }
      return { success: true, error: null, data: response.data };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg, data: null };
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
    saveEditedAsset: saveEditedAssetHandler,
    loading,
    error
  };
}

// Block hooks
export function useBlocks(
  siteId: string,
  filters?: ContentFilters,
  sort?: ContentSort,
  page = 1,
  pageSize = 20
) {
  const [blocks, setBlocks] = useState<PaginatedResponse<Block> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlocks() {
      try {
        console.log('🔄 [useBlocks] Starting block fetch:', { siteId, filters, sort, page, pageSize });
        setLoading(true);
        setError(null);
        const response = await getBlocks(siteId, filters, sort, page, pageSize);
        if (response.error) {
          console.error('❌ [useBlocks] Error fetching blocks:', response.error);
          setError(response.error);
        } else {
          console.log('✅ [useBlocks] Successfully fetched blocks:', response.data);
          setBlocks(response.data || null);
        }
      } catch (err) {
        console.error('❌ [useBlocks] Exception in fetchBlocks:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    // Only fetch if we have a valid siteId
    if (siteId && siteId.trim() !== '') {
      fetchBlocks();
    } else {
      // Reset state when no siteId
      setBlocks(null);
      setLoading(false);
      setError(null);
    }
  }, [siteId, filters, sort, page, pageSize]);

  return { blocks, loading, error };
}

export function useBlock(blockId: string) {
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlock() {
      try {
        setLoading(true);
        const response = await getBlock(blockId);
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

    if (blockId) {
      fetchBlock();
    }
  }, [blockId]);

  return { block, loading, error };
}

export function useBlockVersions(blockId: string) {
  const [versions, setVersions] = useState<BlockVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVersions() {
      try {
        setLoading(true);
        const response = await getBlockVersions(blockId);
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

    if (blockId) {
      fetchVersions();
    }
  }, [blockId]);

  return { versions, loading, error };
}

export function useBlockUsageCount(blockId: string) {
  const [usageCount, setUsageCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsageCount() {
      try {
        setLoading(true);
        const response = await getBlockUsageCount(blockId);
        if (response.error) {
          setError(response.error);
        } else {
          setUsageCount(response.data || 0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (blockId) {
      fetchUsageCount();
    }
  }, [blockId]);

  return { usageCount, loading, error };
}

// Block management hooks
export function useBlockManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBlockHandler = useCallback(async (blockData: Omit<Block, 'id'>) => {
    try {
      console.log('🆕 [useBlockManagement] Starting block creation:', blockData);
      setLoading(true);
      setError(null);
      const response = await createBlock(blockData);
      if (response.error) {
        console.error('❌ [useBlockManagement] Error creating block:', response.error);
        setError(response.error);
        return null;
      }
      console.log('✅ [useBlockManagement] Successfully created block:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ [useBlockManagement] Exception in createBlock:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBlockHandler = useCallback(async (blockId: string, updates: Partial<Block>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateBlock(blockId, updates);
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

  const deleteBlockHandler = useCallback(async (blockId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await deleteBlock(blockId);
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

  const publishBlockHandler = useCallback(async (blockId: string, version: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await publishBlock(blockId, version);
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

  const unpublishBlockHandler = useCallback(async (blockId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await unpublishBlock(blockId);
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
    createBlock: createBlockHandler,
    updateBlock: updateBlockHandler,
    deleteBlock: deleteBlockHandler,
    publishBlock: publishBlockHandler,
    unpublishBlock: unpublishBlockHandler,
    loading,
    error
  };
}

// Block version management hook
export function useBlockVersionManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBlockVersionHandler = useCallback(async (versionData: Omit<BlockVersion, 'id' | 'created_at' | 'created_by'>) => {
    try {
      setLoading(true);
      setError(null);
      console.log('useBlockVersionManagement: calling createBlockVersion with:', versionData);
      const response = await createBlockVersion(versionData);
      console.log('useBlockVersionManagement: createBlockVersion response:', response);
      if (response.error) {
        console.error('useBlockVersionManagement: createBlockVersion error:', response.error);
        setError(response.error);
        return null;
      }
      console.log('useBlockVersionManagement: returning data:', response.data);
      return response.data;
    } catch (err) {
      console.error('useBlockVersionManagement: catch block error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBlockVersionHandler = useCallback(async (blockId: string, version: number, updates: Partial<BlockVersion>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateBlockVersion(blockId, version, updates);
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

  return {
    createBlockVersion: createBlockVersionHandler,
    updateBlockVersion: updateBlockVersionHandler,
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
