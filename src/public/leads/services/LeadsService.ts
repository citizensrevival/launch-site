import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../core/types/database.types';
import { supabase } from '../../../core/supabase';
import { CreateLeadInput, LeadSubmissionResult } from '../types/leads.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class LeadsService {
  constructor(private readonly client: SupabaseClient<Database>) {}

  /**
   * Submit a lead (newsletter subscriber, sponsor, vendor or volunteer).
   *
   * Goes through the `upsert_lead` function rather than writing the table
   * directly: anon holds EXECUTE on the function and no table-level DML, so a
   * repeat signup upserts on (email, lead_kind) without exposing the table.
   */
  public async submitLead(input: CreateLeadInput): Promise<LeadSubmissionResult> {
    if (!EMAIL_PATTERN.test(input.email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const { data, error } = await this.client.rpc('upsert_lead', {
      p_lead_kind: input.lead_kind,
      p_email: input.email,
      p_business_name: input.business_name,
      p_contact_name: input.contact_name,
      p_phone: input.phone,
      p_website: input.website,
      p_social_links: input.social_links,
      p_source_path: input.source_path,
      p_meta: input.meta as Database['public']['Functions']['upsert_lead']['Args']['p_meta'],
      p_tags: input.tags,
    });

    if (error) {
      console.error('upsert_lead failed:', error);
      return { success: false, error: 'Failed to submit. Please try again.' };
    }

    return { success: true, leadId: data };
  }
}

export const leadsService = new LeadsService(supabase);
