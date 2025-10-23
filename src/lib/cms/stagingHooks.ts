// Staging System React Hooks
// This file contains React hooks for the staging system

import { useState, useEffect, useCallback } from 'react';
import { 
  SiteStaging, 
  StagingDependency
} from './types';
import {
  createStaging,
  stageEntity,
  stageSite,
  publishStagedContent,
  rollbackStaging,
  getStagingDependencies,
  getSiteStagingSessions,
  getStagingSession,
  deleteStagingSession,
  getStagedContentPreview
} from './stagingClient';

// Hook for managing staging sessions
export function useStagingSessions(siteId: string) {
  const [sessions, setSessions] = useState<SiteStaging[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const response = await getSiteStagingSessions(siteId);
    
    if (response.error) {
      setError(response.error);
    } else {
      setSessions(response.data || []);
    }
    
    setLoading(false);
  }, [siteId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const createNewStaging = useCallback(async (name: string, description?: string) => {
    setLoading(true);
    setError(null);
    
    const response = await createStaging({
      siteId,
      name,
      description
    });
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return null;
    }
    
    // Refresh sessions
    await fetchSessions();
    setLoading(false);
    return response.data;
  }, [siteId, fetchSessions]);

  const deleteSession = useCallback(async (stagingId: string) => {
    setLoading(true);
    setError(null);
    
    const response = await deleteStagingSession(stagingId);
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return false;
    }
    
    // Refresh sessions
    await fetchSessions();
    setLoading(false);
    return true;
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    createNewStaging,
    deleteSession,
    refresh: fetchSessions
  };
}

// Hook for managing individual staging session
export function useStagingSession(stagingId: string) {
  const [session, setSession] = useState<SiteStaging | null>(null);
  const [dependencies, setDependencies] = useState<StagingDependency[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    if (!stagingId) return;
    
    setLoading(true);
    setError(null);
    
    const [sessionResponse, dependenciesResponse, previewResponse] = await Promise.all([
      getStagingSession(stagingId),
      getStagingDependencies(stagingId),
      getStagedContentPreview(stagingId)
    ]);
    
    if (sessionResponse.error) {
      setError(sessionResponse.error);
    } else {
      setSession(sessionResponse.data);
    }
    
    if (dependenciesResponse.error) {
      setError(dependenciesResponse.error);
    } else {
      setDependencies(dependenciesResponse.data || []);
    }
    
    if (previewResponse.error) {
      setError(previewResponse.error);
    } else {
      setPreview(previewResponse.data);
    }
    
    setLoading(false);
  }, [stagingId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const stageEntityToSession = useCallback(async (
    entityType: 'page' | 'block' | 'menu' | 'asset',
    entityId: string,
    version: number
  ) => {
    setLoading(true);
    setError(null);
    
    const response = await stageEntity({
      entityType,
      entityId,
      version,
      stagingId
    });
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return false;
    }
    
    // Refresh session data
    await fetchSession();
    setLoading(false);
    return true;
  }, [stagingId, fetchSession]);

  const publishStaged = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const response = await publishStagedContent(stagingId);
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return false;
    }
    
    setLoading(false);
    return true;
  }, [stagingId]);

  const rollbackStaged = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const response = await rollbackStaging(stagingId);
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return false;
    }
    
    // Refresh session data
    await fetchSession();
    setLoading(false);
    return true;
  }, [stagingId, fetchSession]);

  return {
    session,
    dependencies,
    preview,
    loading,
    error,
    stageEntity: stageEntityToSession,
    publishStaged,
    rollbackStaged,
    refresh: fetchSession
  };
}

// Hook for site-wide staging
export function useSiteStaging(siteId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const stageEntireSite = useCallback(async (name: string, description?: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    const response = await stageSite({
      siteId,
      name,
      description
    });
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return null;
    }
    
    setResult({
      success: true,
      staging_id: response.data?.id,
      staged_entities: 0 // Will be updated when we get the actual count
    });
    
    setLoading(false);
    return response.data;
  }, [siteId]);

  return {
    loading,
    error,
    result,
    stageEntireSite
  };
}

// Hook for staging management
export function useStagingManagement(siteId: string) {
  const [activeStaging, setActiveStaging] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStagingSession = useCallback(async (name: string, description?: string) => {
    setLoading(true);
    setError(null);
    
    const response = await createStaging({
      siteId,
      name,
      description
    });
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return null;
    }
    
    setActiveStaging(response.data?.id || null);
    setLoading(false);
    return response.data;
  }, [siteId]);

  const stageEntityLocal = useCallback(async (
    entityType: 'page' | 'block' | 'menu' | 'asset',
    entityId: string,
    version: number
  ) => {
    if (!activeStaging) {
      setError('No active staging session');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    const response = await stageEntity({
      entityType,
      entityId,
      version,
      stagingId: activeStaging
    });
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return false;
    }
    
    setLoading(false);
    return true;
  }, [activeStaging]);

  const publishAllStaged = useCallback(async () => {
    if (!activeStaging) {
      setError('No active staging session');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    const response = await publishStagedContent(activeStaging);
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return false;
    }
    
    setActiveStaging(null);
    setLoading(false);
    return true;
  }, [activeStaging]);

  const rollbackAllStaged = useCallback(async () => {
    if (!activeStaging) {
      setError('No active staging session');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    const response = await rollbackStaging(activeStaging);
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return false;
    }
    
    setActiveStaging(null);
    setLoading(false);
    return true;
  }, [activeStaging]);

  return {
    activeStaging,
    loading,
    error,
    createStagingSession,
    stageEntity: stageEntityLocal,
    publishAllStaged,
    rollbackAllStaged,
    setActiveStaging
  };
}
