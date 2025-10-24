import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAuditLogs, useAuditLog, useAuditStats, useAuditActions, auditReducer } from '../useAudit';

// Mock the AuditService
vi.mock('../../../../core/supabase', () => ({
  supabase: {},
}));

vi.mock('../services/AuditService', () => ({
  AuditService: vi.fn().mockImplementation(() => ({
    listAuditLogs: vi.fn(),
    getAuditLog: vi.fn(),
    createAuditLog: vi.fn(),
    getAuditStats: vi.fn(),
    getEntityAuditHistory: vi.fn(),
    getUserAuditHistory: vi.fn(),
    deleteAuditLog: vi.fn(),
    cleanupOldLogs: vi.fn(),
  })),
}));

// Mock document and window for browser environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      audit: auditReducer,
    },
    preloadedState: {
      audit: {
        logs: [],
        currentLog: null,
        stats: null,
        loading: false,
        error: null,
        totalCount: 0,
        hasMore: false,
        ...initialState,
      },
    },
  });
};

// Test wrapper component
const TestWrapper = ({ children, store }: { children: React.ReactNode; store: any }) => (
  <Provider store={store}>{children}</Provider>
);

describe('useAuditLogs', () => {
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useAuditLogs(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    expect(result.current.logs).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.hasMore).toBe(false);
  });

  it('should handle refetch', async () => {
    const { result } = renderHook(() => useAuditLogs(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    await act(async () => {
      await result.current.refetch();
    });

    // The actual implementation would depend on the AuditService mock
    expect(result.current).toBeDefined();
  });
});

describe('useAuditLog', () => {
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useAuditLog('test-id'), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    expect(result.current.log).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle refetch', async () => {
    const { result } = renderHook(() => useAuditLog('test-id'), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    await act(async () => {
      await result.current.refetch();
    });

    // The actual implementation would depend on the AuditService mock
    expect(result.current).toBeDefined();
  });
});

describe('useAuditStats', () => {
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useAuditStats(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    expect(result.current.stats).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle refetch', async () => {
    const { result } = renderHook(() => useAuditStats(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    await act(async () => {
      await result.current.refetch();
    });

    // The actual implementation would depend on the AuditService mock
    expect(result.current).toBeDefined();
  });
});

describe('useAuditActions', () => {
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  it('should provide action functions', () => {
    const { result } = renderHook(() => useAuditActions(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    expect(typeof result.current.createAuditLog).toBe('function');
    expect(typeof result.current.getEntityAuditHistory).toBe('function');
    expect(typeof result.current.getUserAuditHistory).toBe('function');
    expect(typeof result.current.deleteAuditLog).toBe('function');
    expect(typeof result.current.cleanupOldLogs).toBe('function');
  });

  it('should handle createAuditLog', async () => {
    const { result } = renderHook(() => useAuditActions(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    const input = {
      site_id: '550e8400-e29b-41d4-a716-446655440001',
      entity_type: 'page' as const,
      entity_id: '550e8400-e29b-41d4-a716-446655440002',
      action: 'create' as const,
      changes: { title: 'New Page' },
      created_by: '550e8400-e29b-41d4-a716-446655440003',
    };

    await act(async () => {
      const response = await result.current.createAuditLog(input);
      expect(response).toBeDefined();
    });
  });

  it('should handle getEntityAuditHistory', async () => {
    const { result } = renderHook(() => useAuditActions(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    await act(async () => {
      const response = await result.current.getEntityAuditHistory('page', 'test-id');
      expect(response).toBeDefined();
    });
  });

  it('should handle getUserAuditHistory', async () => {
    const { result } = renderHook(() => useAuditActions(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    await act(async () => {
      const response = await result.current.getUserAuditHistory('test-user-id');
      expect(response).toBeDefined();
    });
  });

  it('should handle deleteAuditLog', async () => {
    const { result } = renderHook(() => useAuditActions(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    await act(async () => {
      const response = await result.current.deleteAuditLog('test-id');
      expect(response).toBeDefined();
    });
  });

  it('should handle cleanupOldLogs', async () => {
    const { result } = renderHook(() => useAuditActions(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    await act(async () => {
      const response = await result.current.cleanupOldLogs(30);
      expect(response).toBeDefined();
    });
  });
});

describe('auditReducer', () => {
  it('should handle SET_LOADING', () => {
    const state = {
      logs: [],
      currentLog: null,
      stats: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = { type: 'audit/setLoading', payload: true };
    const newState = auditReducer(state, action);

    expect(newState.loading).toBe(true);
  });

  it('should handle SET_ERROR', () => {
    const state = {
      logs: [],
      currentLog: null,
      stats: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = { type: 'audit/setError', payload: 'Test error' };
    const newState = auditReducer(state, action);

    expect(newState.error).toBe('Test error');
    expect(newState.loading).toBe(false);
  });

  it('should handle SET_LOGS', () => {
    const state = {
      logs: [],
      currentLog: null,
      stats: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = {
      type: 'audit/setLogs',
      payload: {
        logs: [{ id: '1', action: 'create' }],
        totalCount: 1,
        hasMore: false,
      },
    };
    const newState = auditReducer(state, action);

    expect(newState.logs).toEqual([{ id: '1', action: 'create' }]);
    expect(newState.totalCount).toBe(1);
    expect(newState.hasMore).toBe(false);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(null);
  });

  it('should handle SET_STATS', () => {
    const state = {
      logs: [],
      currentLog: null,
      stats: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = {
      type: 'audit/setStats',
      payload: {
        total_actions: 100,
        actions_by_type: { create: 50 },
        actions_by_user: { user1: 50 },
        recent_activity: [],
      },
    };
    const newState = auditReducer(state, action);

    expect(newState.stats).toEqual({
      total_actions: 100,
      actions_by_type: { create: 50 },
      actions_by_user: { user1: 50 },
      recent_activity: [],
    });
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(null);
  });

  it('should handle ADD_LOG', () => {
    const state = {
      logs: [],
      currentLog: null,
      stats: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = {
      type: 'audit/addLog',
      payload: { id: '1', action: 'create' },
    };
    const newState = auditReducer(state, action);

    expect(newState.logs).toEqual([{ id: '1', action: 'create' }]);
  });

  it('should handle REMOVE_LOG', () => {
    const state = {
      logs: [{ id: '1', action: 'create' }],
      currentLog: null,
      stats: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = {
      type: 'audit/removeLog',
      payload: '1',
    };
    const newState = auditReducer(state, action);

    expect(newState.logs).toEqual([]);
  });

  it('should return initial state for unknown action', () => {
    const state = {
      logs: [],
      currentLog: null,
      stats: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = { type: 'UNKNOWN_ACTION' };
    const newState = auditReducer(state, action);

    expect(newState).toEqual(state);
  });
});
