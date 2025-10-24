import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '../../../core/supabase';
import { PageResolver } from '../services/PageResolver';
import type {
  ResolvedPage,
  ResolvePageRequest,
} from '../types/page.types';

// Redux state types
interface ResolvedPageState {
  page: ResolvedPage | null;
  loading: boolean;
  error: string | null;
}

interface RootState {
  resolvedPage: ResolvedPageState;
}

// Redux actions
const SET_LOADING = 'resolvedPage/setLoading';
const SET_ERROR = 'resolvedPage/setError';
const SET_PAGE = 'resolvedPage/setPage';

// Redux action creators
const setLoading = (loading: boolean) => ({ type: SET_LOADING, payload: loading });
const setError = (error: string | null) => ({ type: SET_ERROR, payload: error });
const setPage = (page: ResolvedPage | null) => ({ type: SET_PAGE, payload: page });

// Redux reducer
const initialState: ResolvedPageState = {
  page: null,
  loading: false,
  error: null,
};

export const resolvedPageReducer = (state = initialState, action: any): ResolvedPageState => {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, loading: action.payload };
    case SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case SET_PAGE:
      return { ...state, page: action.payload, loading: false, error: null };
    default:
      return state;
  }
};

// Service instance
const pageResolver = new PageResolver(supabase);

// Custom hooks
export const useResolvedPage = (request: ResolvePageRequest) => {
  const dispatch = useDispatch();
  const { page, loading, error } = useSelector((state: RootState) => state.resolvedPage);

  const fetchPage = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await pageResolver.resolvePage(request);

    if (result.success) {
      dispatch(setPage(result.data));
    } else {
      dispatch(setError(result.error));
    }
  }, [dispatch, request]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return {
    page,
    loading,
    error,
    refetch: fetchPage,
  };
};

export const useResolvedPageBySlug = (slug: string, siteId?: string, locale = 'en-US') => {
  const dispatch = useDispatch();
  const { page, loading, error } = useSelector((state: RootState) => state.resolvedPage);

  const fetchPage = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await pageResolver.resolvePageBySlug(slug, siteId, locale);

    if (result.success) {
      dispatch(setPage(result.data));
    } else {
      dispatch(setError(result.error));
    }
  }, [dispatch, slug, siteId, locale]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return {
    page,
    loading,
    error,
    refetch: fetchPage,
  };
};

export const useResolvedSystemPage = (systemKey: string, siteId?: string, locale = 'en-US') => {
  const dispatch = useDispatch();
  const { page, loading, error } = useSelector((state: RootState) => state.resolvedPage);

  const fetchPage = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const result = await pageResolver.resolveSystemPage(systemKey, siteId, locale);

    if (result.success) {
      dispatch(setPage(result.data));
    } else {
      dispatch(setError(result.error));
    }
  }, [dispatch, systemKey, siteId, locale]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return {
    page,
    loading,
    error,
    refetch: fetchPage,
  };
};
