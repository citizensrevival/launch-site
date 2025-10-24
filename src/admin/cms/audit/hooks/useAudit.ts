import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '../../../../core/supabase';
import { AuditService } from '../services/AuditService';
import type {
  AuditLog,
  CreateAuditLogInput,
  AuditFilters,
  AuditSortOptions,
  AuditListResponse,
  AuditStats,
} from '../types/audit.types';

// Redux state types
interface AuditState {
  logs: AuditLog[];
  currentLog: AuditLog | null;
  stats: AuditStats | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
}

interface RootState {
  audit: AuditState;
}

// Redux actions
const SET_LOADING = 'audit/setLoading';
const SET_ERROR = 'audit/setError';
const SET_LOGS = 'audit/setLogs';
const SET_CURRENT_LOG = 'audit/setCurrentLog';
const SET_STATS = 'audit/setStats';
const ADD_LOG = 'audit/addLog';
const REMOVE_LOG = 'audit/removeLog';

// Redux action creators
const setLoading = (loading: boolean) => ({ type: SET_LOADING, payload: loading });
const setError = (error: string | null) => ({ type: SET_ERROR, payload: error });
const setLogs = (data: AuditListResponse) => ({ type: SET_LOGS, payload: data });
const setCurrentLog = (log: AuditLog | null) => ({ type: SET_CURRENT_LOG, payload: log });
const setStats = (stats: AuditStats) => ({ type: SET_STATS, payload: stats });
const addLog = (log: AuditLog) => ({ type: ADD_LOG, payload: log });
// const removeLog = (id: string) => ({ type: REMOVE_LOG, payload: id }); // TODO: Implement proper audit log functionality

// Redux reducer
const initialState: AuditState = {
  logs: [],
  currentLog: null,
  stats: null,
  loading: false,
  error: null,
  totalCount: 0,
  hasMore: false,
};

export const auditReducer = (state = initialState, action: any): AuditState => {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, loading: action.payload };
    case SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case SET_LOGS:
      return {
        ...state,
        logs: action.payload.logs,
        totalCount: action.payload.totalCount,
        hasMore: action.payload.hasMore,
        loading: false,
        error: null,
      };
    case SET_CURRENT_LOG:
      return { ...state, currentLog: action.payload };
    case SET_STATS:
      return { ...state, stats: action.payload, loading: false, error: null };
    case ADD_LOG:
      return { ...state, logs: [action.payload, ...state.logs] };
    case REMOVE_LOG:
      return {
        ...state,
        logs: state.logs.filter(l => l.id !== action.payload),
        currentLog: state.currentLog?.id === action.payload ? null : state.currentLog,
      };
    default:
      return state;
  }
};

// Service instance
const auditService = new AuditService(supabase);

// Custom hooks
export const useAuditLogs = (filters?: AuditFilters, sort?: AuditSortOptions, page = 1, limit = 20) => {
  const dispatch = useDispatch();
  const { logs, loading, error, totalCount, hasMore } = useSelector((state: RootState) => state.audit);

  const fetchLogs = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await auditService.listAuditLogs(filters, sort, page, limit);

    if (result.success) {
      dispatch(setLogs(result.data));
    } else {
      dispatch(setError(result.error));
    }
  }, [dispatch, filters, sort, page, limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    totalCount,
    hasMore,
    refetch: fetchLogs,
  };
};

export const useAuditLog = (id: string) => {
  const dispatch = useDispatch();
  const { currentLog, loading, error } = useSelector((state: RootState) => state.audit);

  const fetchLog = useCallback(async () => {
    if (!id) return;

    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await auditService.getAuditLog(id);

    if (result.success) {
      dispatch(setCurrentLog(result.data));
    } else {
      dispatch(setError(result.error));
    }
  }, [dispatch, id]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  return {
    log: currentLog,
    loading,
    error,
    refetch: fetchLog,
  };
};

export const useAuditStats = (siteId?: string, dateFrom?: string, dateTo?: string) => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state: RootState) => state.audit);

  const fetchStats = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await auditService.getAuditStats(siteId);

    if (result.success) {
      dispatch(setStats(result.data));
    } else {
      dispatch(setError(result.error));
    }
  }, [dispatch, siteId, dateFrom, dateTo]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

export const useAuditActions = () => {
  const dispatch = useDispatch();

  const createAuditLog = useCallback(async (input: CreateAuditLogInput) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await auditService.createAuditLog(input);

    if (result.success) {
      dispatch(addLog(result.data));
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const getEntityAuditHistory = useCallback(async (_entityType: string, _entityId: string) => {
    // Stub implementation - TODO: Implement proper audit log functionality
    return { success: false, error: 'Audit log functionality not implemented' };
  }, []);

  const getUserAuditHistory = useCallback(async (_userId: string, _siteId?: string) => {
    // Stub implementation - TODO: Implement proper audit log functionality
    return { success: false, error: 'Audit log functionality not implemented' };
  }, []);

  const deleteAuditLog = useCallback(async (_id: string) => {
    // Stub implementation - TODO: Implement proper audit log functionality
    return { success: false, error: 'Audit log functionality not implemented' };
  }, []);

  const cleanupOldLogs = useCallback(async (_olderThanDays: number) => {
    // Stub implementation - TODO: Implement proper audit log functionality
    return { success: false, error: 'Audit log functionality not implemented' };
  }, []);

  return {
    createAuditLog,
    getEntityAuditHistory,
    getUserAuditHistory,
    deleteAuditLog,
    cleanupOldLogs,
  };
};
