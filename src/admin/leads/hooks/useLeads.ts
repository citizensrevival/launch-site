import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../core/supabase';
import { LeadsService } from '../services/LeadsService';
import type { LeadFilters } from '../types/leads.types';

const leadsService = new LeadsService(supabase);

export function useLeads(filters: LeadFilters = {}, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['leads', filters, limit, offset],
    queryFn: () => leadsService.getLeads(filters, limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsService.getLeadById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: ['lead-stats'],
    queryFn: () => leadsService.getLeadStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, userId }: { input: any; userId?: string }) => 
      leadsService.createLead(input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input, userId }: { id: string; input: any; userId?: string }) => 
      leadsService.updateLead(id, input, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadsService.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
    },
  });
}

export function useExportLeads() {
  return useMutation({
    mutationFn: (filters: LeadFilters = {}) => leadsService.exportLeadsToCSV(filters),
  });
}
