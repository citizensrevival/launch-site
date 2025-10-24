import { useState, useEffect, useCallback } from 'react';
import { AssetService } from '../services/AssetService';
import { supabase } from '../../../../core/supabase';
import type {
  Asset,
  AssetInput,
  AssetUpdate,
  AssetFilters,
  AssetSortOptions,
} from '../types/asset.types';

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const assetService = new AssetService(supabase);

  const fetchAssets = useCallback(async (
    filters: AssetFilters = {},
    sort: AssetSortOptions = { field: 'created_at', direction: 'desc' },
    limit = 20,
    offset = 0
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await assetService.listAssets(filters, sort, limit, offset);
      
      if (response.success) {
        setAssets(response.data.assets);
        setTotalCount(response.data.totalCount);
        setHasMore(response.data.hasMore);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  }, [assetService]);

  const loadMoreAssets = useCallback(async (
    filters: AssetFilters = {},
    sort: AssetSortOptions = { field: 'created_at', direction: 'desc' },
    limit = 20
  ) => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const response = await assetService.listAssets(filters, sort, limit, assets.length);
      
      if (response.success) {
        setAssets(prev => [...prev, ...response.data.assets]);
        setTotalCount(response.data.totalCount);
        setHasMore(response.data.hasMore);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more assets');
    } finally {
      setLoading(false);
    }
  }, [assetService, loading, hasMore, assets.length]);

  const refreshAssets = useCallback(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    loading,
    error,
    totalCount,
    hasMore,
    fetchAssets,
    loadMoreAssets,
    refreshAssets,
  };
};

export const useAsset = (assetId: string) => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assetService = new AssetService(supabase);

  const fetchAsset = useCallback(async () => {
    if (!assetId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await assetService.getAsset(assetId);
      
      if (response.success) {
        setAsset(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch asset');
    } finally {
      setLoading(false);
    }
  }, [assetService, assetId]);

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

  return {
    asset,
    loading,
    error,
    refetch: fetchAsset,
  };
};

export const useAssetActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assetService = new AssetService(supabase);

  const createAsset = useCallback(async (input: AssetInput) => {
    setLoading(true);
    setError(null);

    try {
      const response = await assetService.createAsset(input);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create asset';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [assetService]);

  const updateAsset = useCallback(async (assetId: string, updates: AssetUpdate) => {
    setLoading(true);
    setError(null);

    try {
      const response = await assetService.updateAsset(assetId, updates);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update asset';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [assetService]);

  const deleteAsset = useCallback(async (assetId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await assetService.deleteAsset(assetId);
      
      if (response.success) {
        return true;
      } else {
        setError(response.error);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete asset';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [assetService]);

  const uploadAsset = useCallback(async (file: File, metadata: Partial<AssetInput>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await assetService.uploadAsset(file, metadata);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload asset';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [assetService]);

  const generateVariants = useCallback(async (assetId: string, variants: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const response = await assetService.generateVariants(assetId, variants);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate variants';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [assetService]);

  const getAssetUrl = useCallback((asset: Asset, variant?: string) => {
    return assetService.getAssetUrl(asset, variant);
  }, [assetService]);

  const getAssetThumbnail = useCallback((asset: Asset, size = 150) => {
    return assetService.getAssetThumbnail(asset, size);
  }, [assetService]);

  return {
    loading,
    error,
    createAsset,
    updateAsset,
    deleteAsset,
    uploadAsset,
    generateVariants,
    getAssetUrl,
    getAssetThumbnail,
  };
};