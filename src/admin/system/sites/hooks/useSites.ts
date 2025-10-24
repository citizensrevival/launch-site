import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../../core/supabase';
import { SiteService } from '../services/SiteService';
import type { SiteFilters } from '../types/site.types';

const siteService = new SiteService(supabase);

export function useSites(filters: SiteFilters = {}, limit = 50, offset = 0) {
  const query = useQuery({
    queryKey: ['sites', filters, limit, offset],
    queryFn: () => siteService.getSites(filters, limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Return the expected structure for AdminLayout
  return {
    ...query,
    sites: query.data?.success ? query.data.data.sites : [],
    selectedSite: null, // TODO: Implement site selection state
    selectSite: (siteId: string) => {
      // TODO: Implement site selection logic
      console.log('Selecting site:', siteId);
    },
  };
}

export function useSite(id: string) {
  return useQuery({
    queryKey: ['site', id],
    queryFn: () => siteService.getSiteById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSiteBySlug(slug: string) {
  return useQuery({
    queryKey: ['site-by-slug', slug],
    queryFn: () => siteService.getSiteBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, userId }: { input: any; userId: string }) => 
      siteService.createSite(input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input, userId }: { id: string; input: any; userId: string }) => 
      siteService.updateSite(id, input, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['site', variables.id] });
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => siteService.deleteSite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
}

export function useSlugAvailability(slug: string, excludeId?: string) {
  return useQuery({
    queryKey: ['slug-availability', slug, excludeId],
    queryFn: () => siteService.isSlugAvailable(slug, excludeId),
    enabled: !!slug,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
