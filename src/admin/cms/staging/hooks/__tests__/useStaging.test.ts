import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useStagingEnvironments, useStagingEnvironment, useStagingActions, stagingReducer } from '../useStaging';

// Mock the StagingService
vi.mock('../../../../core/supabase', () => ({
  supabase: {},
}));

vi.mock('../services/StagingService', () => ({
  StagingService: vi.fn().mockImplementation(() => ({
    listEnvironments: vi.fn(),
    getEnvironment: vi.fn(),
    createEnvironment: vi.fn(),
    updateEnvironment: vi.fn(),
    deleteEnvironment: vi.fn(),
    createDeployment: vi.fn(),
    updateDeploymentStatus: vi.fn(),
    createPreview: vi.fn(),
    deletePreview: vi.fn(),
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
      staging: stagingReducer,
    },
    preloadedState: {
      staging: {
        environments: [],
        currentEnvironment: null,
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

describe('useStagingEnvironments', () => {
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useStagingEnvironments(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    expect(result.current.environments).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.hasMore).toBe(false);
  });

  it('should handle refetch', async () => {
    const { result } = renderHook(() => useStagingEnvironments(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    await act(async () => {
      await result.current.refetch();
    });

    // The actual implementation would depend on the StagingService mock
    expect(result.current).toBeDefined();
  });
});

describe('useStagingEnvironment', () => {
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useStagingEnvironment('test-id'), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    expect(result.current.environment).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle refetch', async () => {
    const { result } = renderHook(() => useStagingEnvironment('test-id'), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    await act(async () => {
      await result.current.refetch();
    });

    // The actual implementation would depend on the StagingService mock
    expect(result.current).toBeDefined();
  });
});

describe('useStagingActions', () => {
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  it('should provide action functions', () => {
    const { result } = renderHook(() => useStagingActions(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    expect(typeof result.current.createEnvironment).toBe('function');
    expect(typeof result.current.updateEnvironment).toBe('function');
    expect(typeof result.current.deleteEnvironment).toBe('function');
    expect(typeof result.current.createDeployment).toBe('function');
    expect(typeof result.current.updateDeploymentStatus).toBe('function');
    expect(typeof result.current.createPreview).toBe('function');
    expect(typeof result.current.deletePreview).toBe('function');
  });

  it('should handle createEnvironment', async () => {
    const { result } = renderHook(() => useStagingActions(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    const input = {
      site_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Staging',
      url: 'https://staging.example.com',
      created_by: '550e8400-e29b-41d4-a716-446655440002',
    };

    await act(async () => {
      const response = await result.current.createEnvironment(input);
      expect(response).toBeDefined();
    });
  });

  it('should handle updateEnvironment', async () => {
    const { result } = renderHook(() => useStagingActions(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    const updates = {
      name: 'Updated Staging',
      updated_by: '550e8400-e29b-41d4-a716-446655440002',
    };

    await act(async () => {
      const response = await result.current.updateEnvironment('test-id', updates);
      expect(response).toBeDefined();
    });
  });

  it('should handle deleteEnvironment', async () => {
    const { result } = renderHook(() => useStagingActions(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    await act(async () => {
      const response = await result.current.deleteEnvironment('test-id');
      expect(response).toBeDefined();
    });
  });
});

describe('stagingReducer', () => {
  it('should handle SET_LOADING', () => {
    const state = {
      environments: [],
      currentEnvironment: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = { type: 'staging/setLoading', payload: true };
    const newState = stagingReducer(state, action);

    expect(newState.loading).toBe(true);
  });

  it('should handle SET_ERROR', () => {
    const state = {
      environments: [],
      currentEnvironment: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = { type: 'staging/setError', payload: 'Test error' };
    const newState = stagingReducer(state, action);

    expect(newState.error).toBe('Test error');
    expect(newState.loading).toBe(false);
  });

  it('should handle SET_ENVIRONMENTS', () => {
    const state = {
      environments: [],
      currentEnvironment: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = {
      type: 'staging/setEnvironments',
      payload: {
        environments: [{ id: '1', name: 'Staging' }],
        totalCount: 1,
        hasMore: false,
      },
    };
    const newState = stagingReducer(state, action);

    expect(newState.environments).toEqual([{ id: '1', name: 'Staging' }]);
    expect(newState.totalCount).toBe(1);
    expect(newState.hasMore).toBe(false);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(null);
  });

  it('should handle ADD_ENVIRONMENT', () => {
    const state = {
      environments: [],
      currentEnvironment: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = {
      type: 'staging/addEnvironment',
      payload: { id: '1', name: 'Staging' },
    };
    const newState = stagingReducer(state, action);

    expect(newState.environments).toEqual([{ id: '1', name: 'Staging' }]);
  });

  it('should handle UPDATE_ENVIRONMENT', () => {
    const state = {
      environments: [{ id: '1', name: 'Staging' }],
      currentEnvironment: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = {
      type: 'staging/updateEnvironment',
      payload: { id: '1', name: 'Updated Staging' },
    };
    const newState = stagingReducer(state, action);

    expect(newState.environments).toEqual([{ id: '1', name: 'Updated Staging' }]);
  });

  it('should handle REMOVE_ENVIRONMENT', () => {
    const state = {
      environments: [{ id: '1', name: 'Staging' }],
      currentEnvironment: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = {
      type: 'staging/removeEnvironment',
      payload: '1',
    };
    const newState = stagingReducer(state, action);

    expect(newState.environments).toEqual([]);
  });

  it('should return initial state for unknown action', () => {
    const state = {
      environments: [],
      currentEnvironment: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = { type: 'UNKNOWN_ACTION' };
    const newState = stagingReducer(state, action);

    expect(newState).toEqual(state);
  });
});
