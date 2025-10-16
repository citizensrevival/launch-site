import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shell/store/hooks';
import { setSites, setSelectedSite, setLoading, setError } from '../../../shell/store/slices/siteSlice';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function useSites() {
  const dispatch = useAppDispatch();
  const { sites, selectedSite, loading, error } = useAppSelector((state) => state.site);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      console.log('useSites: Fetching sites...');
      fetchSites();
      setInitialized(true);
    }
  }, [initialized]);

  const fetchSites = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const { data, error } = await supabase
        .from('site')
        .select('id, handle, label, default_locale, slug')
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      console.log('useSites: Fetched sites:', data);
      dispatch(setSites(data || []));
    } catch (err) {
      console.error('Error fetching sites:', err);
      dispatch(setError(err instanceof Error ? err.message : 'Failed to fetch sites'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const selectSite = (site: any) => {
    dispatch(setSelectedSite(site));
  };

  return {
    sites,
    selectedSite,
    loading,
    error,
    selectSite,
    refetch: fetchSites,
  };
}
