import { BaseService } from '../../../core/services/BaseService';
import type { CreateLeadInput, LeadSubmissionResult } from '../types/leads.types';
import { EnvironmentConfigProvider } from '../../../core/supabase';

export class LeadsService extends BaseService {
  /**
   * Submit a new lead
   */
  public async submitLead(input: CreateLeadInput): Promise<LeadSubmissionResult> {
    try {
      // Validate required fields
      if (!input.email || !input.lead_kind) {
        return {
          success: false,
          error: 'Email and lead kind are required',
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        return {
          success: false,
          error: 'Invalid email format',
        };
      }

      // Check if email already exists
      const { data: existingLead } = await this.supabase
        .from('leads_submissions')
        .select('id')
        .eq('email', input.email)
        .single();

      if (existingLead) {
        return {
          success: false,
          error: 'A lead with this email already exists',
        };
      }

      // Create the lead using the upsert_lead RPC function
      const { data, error } = await this.supabase.rpc('upsert_lead', {
        p_email: input.email,
        p_first_name: input.first_name || undefined,
        p_last_name: input.last_name || undefined,
        p_phone: input.phone || undefined,
        p_company: input.company || undefined,
        p_lead_kind: input.lead_kind,
        p_source: input.source || undefined,
        p_notes: input.notes || undefined,
        p_metadata: input.metadata || {},
      });

      if (error) {
        console.error('Error creating lead:', error);
        return {
          success: false,
          error: 'Failed to submit lead. Please try again.',
        };
      }

      return {
        success: true,
        leadId: data,
      };
    } catch (error) {
      console.error('Error in submitLead:', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    }
  }

  /**
   * Check if an email already exists
   */
  public async emailExists(email: string): Promise<{ success: true; data: { exists: boolean } } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('leads_submissions')
        .select('id')
        .eq('email', email)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows found, email doesn't exist
        return this.success({ exists: false });
      }

      if (error) {
        return this.handleError(error, 'emailExists');
      }

      // Email exists
      return this.success({ exists: true });
    } catch (error) {
      return this.handleError(error, 'emailExists');
    }
  }

  /**
   * Get a lead by ID (for confirmation pages)
   */
  public async getLeadById(id: string): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('leads_submissions')
        .select('id, email, first_name, last_name, lead_kind, status, created_at')
        .eq('id', id)
        .single();

      if (error) {
        return this.handleError(error, 'getLeadById');
      }

      if (!data) {
        return { success: false, error: 'Lead not found' };
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'getLeadById');
    }
  }
}

/**
 * Public-facing leads service for client-side use
 * Provides a simplified interface for lead creation
 */
export class LeadsPublic {
  private leadsService: LeadsService;

  constructor(configProvider: EnvironmentConfigProvider) {
    this.leadsService = new LeadsService(configProvider);
  }

  /**
   * Create a new lead with simplified interface
   */
  public async createLead(input: CreateLeadInput): Promise<LeadSubmissionResult> {
    // Map the public interface to the internal service interface
    const mappedInput = {
      email: input.email,
      first_name: input.first_name || input.contact_name?.split(' ')[0],
      last_name: input.last_name || input.contact_name?.split(' ').slice(1).join(' '),
      phone: input.phone,
      company: input.company || input.business_name,
      lead_kind: input.lead_kind,
      source: input.source || input.source_path,
      notes: input.notes,
      metadata: {
        ...input.metadata,
        ...input.meta,
        website: input.website,
        social_links: input.social_links,
        tags: input.tags,
        source_path: input.source_path
      }
    };

    return await this.leadsService.submitLead(mappedInput);
  }
}
