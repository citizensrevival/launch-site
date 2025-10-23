import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shell/store/hooks';
import { setSites, setSelectedSite, setLoading, setError } from '../../../shell/store/slices/siteSlice';
import { supabase } from '../../../shell/lib/supabase';

export function useSites() {
  const dispatch = useAppDispatch();
  const { sites, selectedSite, loading, error } = useAppSelector((state) => state.site);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      fetchSites();
      setInitialized(true);
    }
  }, [initialized]);

  const fetchSites = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const { data, error } = await supabase
        .from('system_sites')
        .select('id, name as handle, name as label, default_locale, slug')
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

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
