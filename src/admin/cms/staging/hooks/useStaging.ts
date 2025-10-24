import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '../../../../core/supabase';
import { StagingService } from '../services/StagingService';
import type {
  StagingEnvironment,
  CreateStagingEnvironmentInput,
  UpdateStagingEnvironmentInput,
  StagingFilters,
  StagingSortOptions,
  StagingListResponse,
} from '../types/staging.types';

// Redux state types
interface StagingState {
  environments: StagingEnvironment[];
  currentEnvironment: StagingEnvironment | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
}

interface RootState {
  staging: StagingState;
}

// Redux actions
const SET_LOADING = 'staging/setLoading';
const SET_ERROR = 'staging/setError';
const SET_ENVIRONMENTS = 'staging/setEnvironments';
const SET_CURRENT_ENVIRONMENT = 'staging/setCurrentEnvironment';
const ADD_ENVIRONMENT = 'staging/addEnvironment';
const UPDATE_ENVIRONMENT = 'staging/updateEnvironment';
const REMOVE_ENVIRONMENT = 'staging/removeEnvironment';

// Redux action creators
const setLoading = (loading: boolean) => ({ type: SET_LOADING, payload: loading });
const setError = (error: string | null) => ({ type: SET_ERROR, payload: error });
const setEnvironments = (data: StagingListResponse) => ({ type: SET_ENVIRONMENTS, payload: data });
const setCurrentEnvironment = (environment: StagingEnvironment | null) => ({ type: SET_CURRENT_ENVIRONMENT, payload: environment });
const addEnvironment = (environment: StagingEnvironment) => ({ type: ADD_ENVIRONMENT, payload: environment });
const updateEnvironment = (environment: StagingEnvironment) => ({ type: UPDATE_ENVIRONMENT, payload: environment });
const removeEnvironment = (id: string) => ({ type: REMOVE_ENVIRONMENT, payload: id });

// Redux reducer
const initialState: StagingState = {
  environments: [],
  currentEnvironment: null,
  loading: false,
  error: null,
  totalCount: 0,
  hasMore: false,
};

export const stagingReducer = (state = initialState, action: any): StagingState => {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, loading: action.payload };
    case SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case SET_ENVIRONMENTS:
      return {
        ...state,
        environments: action.payload.environments,
        totalCount: action.payload.totalCount,
        hasMore: action.payload.hasMore,
        loading: false,
        error: null,
      };
    case SET_CURRENT_ENVIRONMENT:
      return { ...state, currentEnvironment: action.payload };
    case ADD_ENVIRONMENT:
      return { ...state, environments: [...state.environments, action.payload] };
    case UPDATE_ENVIRONMENT:
      return {
        ...state,
        environments: state.environments.map(e => e.id === action.payload.id ? action.payload : e),
        currentEnvironment: state.currentEnvironment?.id === action.payload.id ? action.payload : state.currentEnvironment,
      };
    case REMOVE_ENVIRONMENT:
      return {
        ...state,
        environments: state.environments.filter(e => e.id !== action.payload),
        currentEnvironment: state.currentEnvironment?.id === action.payload ? null : state.currentEnvironment,
      };
    default:
      return state;
  }
};

// Service instance
const stagingService = new StagingService(supabase);

// Custom hooks
export const useStagingEnvironments = (filters?: StagingFilters, sort?: StagingSortOptions, page = 1, limit = 20) => {
  const dispatch = useDispatch();
  const { environments, loading, error, totalCount, hasMore } = useSelector((state: RootState) => state.staging);

  const fetchEnvironments = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await stagingService.listEnvironments(filters, sort, page, limit);

    if (result.success) {
      dispatch(setEnvironments(result.data));
    } else {
      dispatch(setError(result.error));
    }
  }, [dispatch, filters, sort, page, limit]);

  useEffect(() => {
    fetchEnvironments();
  }, [fetchEnvironments]);

  return {
    environments,
    loading,
    error,
    totalCount,
    hasMore,
    refetch: fetchEnvironments,
  };
};

export const useStagingEnvironment = (id: string) => {
  const dispatch = useDispatch();
  const { currentEnvironment, loading, error } = useSelector((state: RootState) => state.staging);

  const fetchEnvironment = useCallback(async () => {
    if (!id) return;

    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await stagingService.getEnvironment(id);

    if (result.success) {
      dispatch(setCurrentEnvironment(result.data));
    } else {
      dispatch(setError(result.error));
    }
  }, [dispatch, id]);

  useEffect(() => {
    fetchEnvironment();
  }, [fetchEnvironment]);

  return {
    environment: currentEnvironment,
    loading,
    error,
    refetch: fetchEnvironment,
  };
};

export const useStagingActions = () => {
  const dispatch = useDispatch();

  const createEnvironment = useCallback(async (input: CreateStagingEnvironmentInput) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await stagingService.createEnvironment(input);

    if (result.success) {
      dispatch(addEnvironment(result.data));
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const updateEnvironment = useCallback(async (id: string, updates: UpdateStagingEnvironmentInput) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await stagingService.updateEnvironment(id, updates);

    if (result.success) {
      dispatch(updateEnvironment(result.data));
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const deleteEnvironment = useCallback(async (id: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await stagingService.deleteEnvironment(id);

    if (result.success) {
      dispatch(removeEnvironment(id));
      return { success: true };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const createDeployment = useCallback(async (environmentId: string, changes: any[], deployedBy: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await stagingService.createDeployment(environmentId, changes, deployedBy);

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const updateDeploymentStatus = useCallback(async (id: string, status: string, updatedBy: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await stagingService.updateDeploymentStatus(id, status, updatedBy);

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const createPreview = useCallback(async (deploymentId: string, createdBy: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await stagingService.createPreview(deploymentId, createdBy);

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const deletePreview = useCallback(async (id: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await stagingService.deletePreview(id);

    if (result.success) {
      return { success: true };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  return {
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    createDeployment,
    updateDeploymentStatus,
    createPreview,
    deletePreview,
  };
};

export const useStagingManagement = () => {
  const dispatch = useDispatch();
  const { environments, loading, error } = useSelector((state: RootState) => state.staging);

  const createStagingSession = useCallback(async (siteId: string, name: string, description?: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const input: CreateStagingEnvironmentInput = {
      site_id: siteId,
      name,
      description,
      url: `https://staging-${name}.example.com`,
      created_by: 'current-user', // TODO: Get from auth context
    };

    const result = await stagingService.createEnvironment(input);

    if (result.success) {
      dispatch(addEnvironment(result.data));
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const stageEntity = useCallback(async (entityType: 'page' | 'block' | 'menu' | 'asset', entityId: string, version: number) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // TODO: Implement staging logic
    const changes = [{
      type: entityType,
      entity_id: entityId,
      action: 'stage',
      changes: { version },
      created_by: 'current-user',
    }];

    const result = await stagingService.createDeployment('current-environment', changes, 'current-user');

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const publishStaged = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // TODO: Implement publish logic
    const result = await stagingService.updateDeploymentStatus('current-deployment', 'deployed', 'current-user');

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const rollbackStaged = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // TODO: Implement rollback logic
    const result = await stagingService.updateDeploymentStatus('current-deployment', 'cancelled', 'current-user');

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const publishAllStaged = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // TODO: Implement publish all logic
    const result = await stagingService.updateDeploymentStatus('current-deployment', 'deployed', 'current-user');

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const rollbackAllStaged = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // TODO: Implement rollback all logic
    const result = await stagingService.updateDeploymentStatus('current-deployment', 'cancelled', 'current-user');

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  return {
    activeStaging: environments[0] || null,
    loading,
    error,
    createStagingSession,
    stageEntity,
    publishStaged,
    rollbackStaged,
    publishAllStaged,
    rollbackAllStaged,
  };
};
