import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '../../../../core/supabase';
import { PageService } from '../services/PageService';
import type {
  Page,
  CreatePageInput,
  UpdatePageInput,
  CreatePageVersionInput,
  UpdatePageVersionInput,
  PageFilters,
  PageSortOptions,
  PageListResponse,
} from '../types/page.types';

// Redux state types
interface PagesState {
  pages: Page[];
  currentPage: Page | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
}

interface RootState {
  pages: PagesState;
}

// Redux actions
const SET_LOADING = 'pages/setLoading';
const SET_ERROR = 'pages/setError';
const SET_PAGES = 'pages/setPages';
const SET_CURRENT_PAGE = 'pages/setCurrentPage';
const ADD_PAGE = 'pages/addPage';
const UPDATE_PAGE = 'pages/updatePage';
const REMOVE_PAGE = 'pages/removePage';

// Redux action creators
const setLoading = (loading: boolean) => ({ type: SET_LOADING, payload: loading });
const setError = (error: string | null) => ({ type: SET_ERROR, payload: error });
const setPages = (data: PageListResponse) => ({ type: SET_PAGES, payload: data });
const setCurrentPage = (page: Page | null) => ({ type: SET_CURRENT_PAGE, payload: page });
const addPage = (page: Page) => ({ type: ADD_PAGE, payload: page });
const updatePage = (page: Page) => ({ type: UPDATE_PAGE, payload: page });
const removePage = (id: string) => ({ type: REMOVE_PAGE, payload: id });

// Redux reducer
const initialState: PagesState = {
  pages: [],
  currentPage: null,
  loading: false,
  error: null,
  totalCount: 0,
  hasMore: false,
};

export const pagesReducer = (state = initialState, action: any): PagesState => {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, loading: action.payload };
    case SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case SET_PAGES:
      return {
        ...state,
        pages: action.payload.pages,
        totalCount: action.payload.totalCount,
        hasMore: action.payload.hasMore,
        loading: false,
        error: null,
      };
    case SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    case ADD_PAGE:
      return { ...state, pages: [...state.pages, action.payload] };
    case UPDATE_PAGE:
      return {
        ...state,
        pages: state.pages.map(p => p.id === action.payload.id ? action.payload : p),
        currentPage: state.currentPage?.id === action.payload.id ? action.payload : state.currentPage,
      };
    case REMOVE_PAGE:
      return {
        ...state,
        pages: state.pages.filter(p => p.id !== action.payload),
        currentPage: state.currentPage?.id === action.payload ? null : state.currentPage,
      };
    default:
      return state;
  }
};

// Service instance
const pageService = new PageService(supabase);

// Custom hooks
export const usePages = (filters?: PageFilters, sort?: PageSortOptions, page = 1, limit = 20) => {
  const dispatch = useDispatch();
  const { pages, loading, error, totalCount, hasMore } = useSelector((state: RootState) => state.pages);

  const fetchPages = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await pageService.listPages(filters, sort, page, limit);

    if (result.success) {
      dispatch(setPages(result.data));
    } else {
      dispatch(setError(result.error));
    }
  }, [dispatch, filters, sort, page, limit]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return {
    pages,
    loading,
    error,
    totalCount,
    hasMore,
    refetch: fetchPages,
  };
};

export const usePage = (id: string) => {
  const dispatch = useDispatch();
  const { currentPage, loading, error } = useSelector((state: RootState) => state.pages);

  const fetchPage = useCallback(async () => {
    if (!id) return;

    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await pageService.getPage(id);

    if (result.success) {
      dispatch(setCurrentPage(result.data));
    } else {
      dispatch(setError(result.error));
    }
  }, [dispatch, id]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return {
    page: currentPage,
    loading,
    error,
    refetch: fetchPage,
  };
};

export const usePageActions = () => {
  const dispatch = useDispatch();

  const createPage = useCallback(async (input: CreatePageInput) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await pageService.createPage(input);

    if (result.success) {
      dispatch(addPage(result.data));
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const updatePage = useCallback(async (id: string, updates: UpdatePageInput) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await pageService.updatePage(id, updates);

    if (result.success) {
      dispatch(updatePage(result.data));
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const deletePage = useCallback(async (id: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await pageService.deletePage(id);

    if (result.success) {
      dispatch(removePage(id));
      return { success: true };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const createPageVersion = useCallback(async (input: CreatePageVersionInput) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await pageService.createPageVersion(input);

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const updatePageVersion = useCallback(async (pageId: string, version: number, updates: UpdatePageVersionInput) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await pageService.updatePageVersion(pageId, version, updates);

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const publishPage = useCallback(async (pageId: string, locale: string, version: number, publishedBy: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await pageService.publishPage(pageId, locale, version, publishedBy);

    if (result.success) {
      return { success: true };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  return {
    createPage,
    updatePage,
    deletePage,
    createPageVersion,
    updatePageVersion,
    publishPage,
  };
};

// Export the createPageVersion function directly for components that need it
export const usePageVersionActions = () => {
  const dispatch = useDispatch();

  const createPageVersion = useCallback(async (input: CreatePageVersionInput) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await pageService.createPageVersion(input);

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  return {
    createPageVersion,
  };
};

// Page version management hooks
export const usePageVersions = (pageId: string) => {
  const dispatch = useDispatch();
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    if (!pageId) return;

    setLoading(true);
    setError(null);

    const result = await pageService.listPageVersions(pageId);

    if (result.success) {
      setVersions(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [pageId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  return {
    versions,
    loading,
    error,
    refetch: fetchVersions,
  };
};

export const usePageVersionManagement = () => {
  const dispatch = useDispatch();

  const createVersion = useCallback(async (input: CreatePageVersionInput) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await pageService.createPageVersion(input);

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const updateVersion = useCallback(async (pageId: string, version: number, updates: UpdatePageVersionInput) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await pageService.updatePageVersion(pageId, version, updates);

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  const publishVersion = useCallback(async (pageId: string, locale: string, version: number, publishedBy: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await pageService.publishPage(pageId, locale, version, publishedBy);

    if (result.success) {
      return { success: true };
    } else {
      dispatch(setError(result.error));
      return { success: false, error: result.error };
    }
  }, [dispatch]);

  return {
    createVersion,
    updateVersion,
    publishVersion,
  };
};
