import { useState, useEffect, useCallback } from 'react';
import { BlockService } from '../services/BlockService';
import { supabase } from '../../../../core/supabase';
import type { Block, CreateBlockInput, UpdateBlockInput, BlockFilters, BlockSortOptions } from '../types/block.types';

const blockService = new BlockService(supabase);

/**
 * Hook for managing a list of blocks with filtering, sorting, and pagination.
 */
export function useBlocks(
  filters: BlockFilters = {},
  sortBy: BlockSortOptions = { field: 'created_at', direction: 'desc' },
  limit: number = 50
) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);

  const fetchBlocks = useCallback(async (resetOffset = false) => {
    setLoading(true);
    setError(null);

    const currentOffset = resetOffset ? 0 : offset;
    const result = await blockService.listBlocks(filters, sortBy, limit, currentOffset);

    if (result.success) {
      if (resetOffset) {
        setBlocks(result.data.blocks);
        setOffset(limit);
      } else {
        setBlocks(prev => [...prev, ...result.data.blocks]);
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
      fetchBlocks(false);
    }
  }, [loading, hasMore, fetchBlocks]);

  const refresh = useCallback(() => {
    setOffset(0);
    fetchBlocks(true);
  }, [fetchBlocks]);

  useEffect(() => {
    fetchBlocks(true);
  }, [filters, sortBy, limit]);

  return {
    blocks,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh,
  };
}

/**
 * Hook for managing a single block.
 */
export function useBlock(blockId: string) {
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlock = useCallback(async () => {
    if (!blockId) return;

    setLoading(true);
    setError(null);

    const result = await blockService.getBlock(blockId);

    if (result.success) {
      setBlock(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  }, [blockId]);

  useEffect(() => {
    fetchBlock();
  }, [fetchBlock]);

  return {
    block,
    loading,
    error,
    refresh: fetchBlock,
  };
}

/**
 * Hook for block management actions (create, update, delete).
 */
export function useBlockActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBlock = useCallback(async (input: CreateBlockInput) => {
    setLoading(true);
    setError(null);

    const result = await blockService.createBlock(input);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  const updateBlock = useCallback(async (id: string, updates: UpdateBlockInput) => {
    setLoading(true);
    setError(null);

    const result = await blockService.updateBlock(id, updates);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  const deleteBlock = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    const result = await blockService.deleteBlock(id);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  const getBlockUsage = useCallback(async (blockId: string) => {
    setLoading(true);
    setError(null);

    const result = await blockService.getBlockUsage(blockId);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  const isBlockInUse = useCallback(async (blockId: string) => {
    setLoading(true);
    setError(null);

    const result = await blockService.isBlockInUse(blockId);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  return {
    loading,
    error,
    createBlock,
    updateBlock,
    deleteBlock,
    getBlockUsage,
    isBlockInUse,
  };
}

/**
 * Hook for managing block versions.
 */
export function useBlockVersions(blockId: string) {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    if (!blockId) return;

    setLoading(true);
    setError(null);

    // TODO: Implement block versions service
    // For now, return empty array
    setVersions([]);
    setLoading(false);
  }, [blockId]);

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
 * Hook for block version management.
 */
export function useBlockVersionManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBlockVersion = useCallback(async (versionData: any) => {
    setLoading(true);
    setError(null);

    // TODO: Implement block version creation
    // For now, return mock data
    const mockVersion = {
      id: 'mock-version-id',
      ...versionData,
      created_at: new Date().toISOString(),
    };

    setLoading(false);
    return mockVersion;
  }, []);

  return {
    loading,
    error,
    createBlockVersion,
  };
}

/**
 * Hook for block management.
 */
export function useBlockManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publishBlock = useCallback(async (_blockId: string, _version: number) => {
    setLoading(true);
    setError(null);

    // TODO: Implement block publishing
    // For now, return success
    setLoading(false);
    return true;
  }, []);

  return {
    loading,
    error,
    publishBlock,
  };
}

/**
 * Hook for block usage count.
 */
export function useBlockUsageCount(blockId: string) {
  const [usageCount, setUsageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageCount = useCallback(async () => {
    if (!blockId) return;

    setLoading(true);
    setError(null);

    const result = await blockService.getBlockUsage(blockId);

    if (result.success) {
      setUsageCount(result.data.usage_count);
    } else {
      setError(result.error);
    }

    setLoading(false);
  }, [blockId]);

  useEffect(() => {
    fetchUsageCount();
  }, [fetchUsageCount]);

  return {
    usageCount,
    loading,
    error,
    refresh: fetchUsageCount,
  };
}
