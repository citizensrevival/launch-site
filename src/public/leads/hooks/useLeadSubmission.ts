import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../core/supabase';
import { LeadsService } from '../services/LeadsService';
import type { CreateLeadInput } from '../types/leads.types';

const leadsService = new LeadsService(supabase);

export function useLeadSubmission() {
  return useMutation({
    mutationFn: (input: CreateLeadInput) => leadsService.submitLead(input),
  });
}

export function useEmailCheck() {
  return useMutation({
    mutationFn: (email: string) => leadsService.emailExists(email),
  });
}

export function useLeadById() {
  return useMutation({
    mutationFn: (id: string) => leadsService.getLeadById(id),
  });
}
