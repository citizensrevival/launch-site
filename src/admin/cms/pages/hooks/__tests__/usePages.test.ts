import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { usePages, usePage, usePageActions, pagesReducer } from '../usePages';

// Mock the PageService
vi.mock('../../../../core/supabase', () => ({
  supabase: {},
}));

vi.mock('../services/PageService', () => ({
  PageService: vi.fn().mockImplementation(() => ({
    listPages: vi.fn(),
    getPage: vi.fn(),
    createPage: vi.fn(),
    updatePage: vi.fn(),
    deletePage: vi.fn(),
    createPageVersion: vi.fn(),
    updatePageVersion: vi.fn(),
    publishPage: vi.fn(),
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
      pages: pagesReducer,
    },
    preloadedState: {
      pages: {
        pages: [],
        currentPage: null,
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

describe('usePages', () => {
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => usePages(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    expect(result.current.pages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.hasMore).toBe(false);
  });

  it('should handle refetch', async () => {
    const { result } = renderHook(() => usePages(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    await act(async () => {
      await result.current.refetch();
    });

    // The actual implementation would depend on the PageService mock
    expect(result.current).toBeDefined();
  });
});

describe('usePage', () => {
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => usePage('test-id'), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    expect(result.current.page).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle refetch', async () => {
    const { result } = renderHook(() => usePage('test-id'), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    await act(async () => {
      await result.current.refetch();
    });

    // The actual implementation would depend on the PageService mock
    expect(result.current).toBeDefined();
  });
});

describe('usePageActions', () => {
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  it('should provide action functions', () => {
    const { result } = renderHook(() => usePageActions(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    expect(typeof result.current.createPage).toBe('function');
    expect(typeof result.current.updatePage).toBe('function');
    expect(typeof result.current.deletePage).toBe('function');
    expect(typeof result.current.createPageVersion).toBe('function');
    expect(typeof result.current.updatePageVersion).toBe('function');
    expect(typeof result.current.publishPage).toBe('function');
  });

  it('should handle createPage', async () => {
    const { result } = renderHook(() => usePageActions(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    const input = {
      site_id: '550e8400-e29b-41d4-a716-446655440001',
      slug: 'test-page',
      created_by: '550e8400-e29b-41d4-a716-446655440002',
    };

    await act(async () => {
      const response = await result.current.createPage(input);
      expect(response).toBeDefined();
    });
  });

  it('should handle updatePage', async () => {
    const { result } = renderHook(() => usePageActions(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    const updates = {
      slug: 'updated-test-page',
    };

    await act(async () => {
      const response = await result.current.updatePage('test-id', updates);
      expect(response).toBeDefined();
    });
  });

  it('should handle deletePage', async () => {
    const { result } = renderHook(() => usePageActions(), {
      wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
    });

    await act(async () => {
      const response = await result.current.deletePage('test-id');
      expect(response).toBeDefined();
    });
  });
});

describe('pagesReducer', () => {
  it('should handle SET_LOADING', () => {
    const state = {
      pages: [],
      currentPage: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = { type: 'pages/setLoading', payload: true };
    const newState = pagesReducer(state, action);

    expect(newState.loading).toBe(true);
  });

  it('should handle SET_ERROR', () => {
    const state = {
      pages: [],
      currentPage: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = { type: 'pages/setError', payload: 'Test error' };
    const newState = pagesReducer(state, action);

    expect(newState.error).toBe('Test error');
    expect(newState.loading).toBe(false);
  });

  it('should handle SET_PAGES', () => {
    const state = {
      pages: [],
      currentPage: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = {
      type: 'pages/setPages',
      payload: {
        pages: [{ id: '1', slug: 'test' }],
        totalCount: 1,
        hasMore: false,
      },
    };
    const newState = pagesReducer(state, action);

    expect(newState.pages).toEqual([{ id: '1', slug: 'test' }]);
    expect(newState.totalCount).toBe(1);
    expect(newState.hasMore).toBe(false);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(null);
  });

  it('should handle ADD_PAGE', () => {
    const state = {
      pages: [],
      currentPage: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = {
      type: 'pages/addPage',
      payload: { id: '1', slug: 'test' },
    };
    const newState = pagesReducer(state, action);

    expect(newState.pages).toEqual([{ id: '1', slug: 'test' }]);
  });

  it('should handle UPDATE_PAGE', () => {
    const state = {
      pages: [{ id: '1', slug: 'test' }],
      currentPage: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = {
      type: 'pages/updatePage',
      payload: { id: '1', slug: 'updated-test' },
    };
    const newState = pagesReducer(state, action);

    expect(newState.pages).toEqual([{ id: '1', slug: 'updated-test' }]);
  });

  it('should handle REMOVE_PAGE', () => {
    const state = {
      pages: [{ id: '1', slug: 'test' }],
      currentPage: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = {
      type: 'pages/removePage',
      payload: '1',
    };
    const newState = pagesReducer(state, action);

    expect(newState.pages).toEqual([]);
  });

  it('should return initial state for unknown action', () => {
    const state = {
      pages: [],
      currentPage: null,
      loading: false,
      error: null,
      totalCount: 0,
      hasMore: false,
    };

    const action = { type: 'UNKNOWN_ACTION' };
    const newState = pagesReducer(state, action);

    expect(newState).toEqual(state);
  });
});
