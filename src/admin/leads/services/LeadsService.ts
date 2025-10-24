import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../core/types/database.types';
import { BaseService } from '../../../core/services/BaseService';
import { LeadFiltersSchema, CreateLeadInputSchema, UpdateLeadInputSchema } from '../schemas/leads.schemas';
import type { Lead, CreateLeadInput, UpdateLeadInput, LeadFilters, LeadListResult, LeadStats } from '../types/leads.types';

export class LeadsService extends BaseService {
  /**
   * Get all leads with optional filtering and pagination
   */
  public async getLeads(
    filters: LeadFilters = {},
    limit = 50,
    offset = 0
  ): Promise<{ success: true; data: LeadListResult } | { success: false; error: string }> {
    try {
      // Validate filters
      const validatedFilters = LeadFiltersSchema.parse(filters);

      let query = this.supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (validatedFilters.search) {
        query = query.or(`email.ilike.%${validatedFilters.search}%,first_name.ilike.%${validatedFilters.search}%,last_name.ilike.%${validatedFilters.search}%,company.ilike.%${validatedFilters.search}%`);
      }

      if (validatedFilters.lead_kind) {
        query = query.eq('lead_kind', validatedFilters.lead_kind);
      }

      if (validatedFilters.status) {
        query = query.eq('status', validatedFilters.status);
      }

      if (validatedFilters.source) {
        query = query.eq('source', validatedFilters.source);
      }

      if (validatedFilters.created_after) {
        query = query.gte('created_at', validatedFilters.created_after);
      }

      if (validatedFilters.created_before) {
        query = query.lte('created_at', validatedFilters.created_before);
      }

      if (validatedFilters.updated_after) {
        query = query.gte('updated_at', validatedFilters.updated_after);
      }

      if (validatedFilters.updated_before) {
        query = query.lte('updated_at', validatedFilters.updated_before);
      }

      const { data, error, count } = await query;

      if (error) {
        return this.handleError(error, 'getLeads');
      }

      const result: LeadListResult = {
        leads: data || [],
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      };

      return this.success(result);
    } catch (error) {
      return this.handleError(error, 'getLeads');
    }
  }

  /**
   * Get a lead by ID
   */
  public async getLeadById(id: string): Promise<{ success: true; data: Lead } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('leads')
        .select('*')
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

  /**
   * Create a new lead
   */
  public async createLead(
    input: CreateLeadInput,
    userId?: string
  ): Promise<{ success: true; data: Lead } | { success: false; error: string }> {
    try {
      // Validate input
      const validatedInput = CreateLeadInputSchema.parse(input);

      // Check if email already exists
      const { data: existingLead } = await this.supabase
        .from('leads')
        .select('id')
        .eq('email', validatedInput.email)
        .single();

      if (existingLead) {
        return { success: false, error: 'Lead with this email already exists' };
      }

      const { data, error } = await this.supabase
        .from('leads')
        .insert({
          ...validatedInput,
          created_by: userId,
          updated_by: userId,
        })
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'createLead');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'createLead');
    }
  }

  /**
   * Update a lead
   */
  public async updateLead(
    id: string,
    input: UpdateLeadInput,
    userId?: string
  ): Promise<{ success: true; data: Lead } | { success: false; error: string }> {
    try {
      // Validate input
      const validatedInput = UpdateLeadInputSchema.parse(input);

      // If email is being updated, check if it already exists
      if (validatedInput.email) {
        const { data: existingLead } = await this.supabase
          .from('leads')
          .select('id')
          .eq('email', validatedInput.email)
          .neq('id', id)
          .single();

        if (existingLead) {
          return { success: false, error: 'Lead with this email already exists' };
        }
      }

      const { data, error } = await this.supabase
        .from('leads')
        .update({
          ...validatedInput,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'updateLead');
      }

      if (!data) {
        return { success: false, error: 'Lead not found' };
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'updateLead');
    }
  }

  /**
   * Delete a lead
   */
  public async deleteLead(id: string): Promise<{ success: true; data: { id: string } } | { success: false; error: string }> {
    try {
      const { error } = await this.supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) {
        return this.handleError(error, 'deleteLead');
      }

      return this.success({ id });
    } catch (error) {
      return this.handleError(error, 'deleteLead');
    }
  }

  /**
   * Get lead statistics
   */
  public async getLeadStats(): Promise<{ success: true; data: LeadStats } | { success: false; error: string }> {
    try {
      // Get total count
      const { count: total, error: totalError } = await this.supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        return this.handleError(totalError, 'getLeadStats');
      }

      // Get counts by kind
      const { data: kindData, error: kindError } = await this.supabase
        .from('leads')
        .select('lead_kind')
        .not('lead_kind', 'is', null);

      if (kindError) {
        return this.handleError(kindError, 'getLeadStats');
      }

      const byKind = kindData?.reduce((acc, lead) => {
        acc[lead.lead_kind] = (acc[lead.lead_kind] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get counts by status
      const { data: statusData, error: statusError } = await this.supabase
        .from('leads')
        .select('status')
        .not('status', 'is', null);

      if (statusError) {
        return this.handleError(statusError, 'getLeadStats');
      }

      const byStatus = statusData?.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get counts by source
      const { data: sourceData, error: sourceError } = await this.supabase
        .from('leads')
        .select('source')
        .not('source', 'is', null);

      if (sourceError) {
        return this.handleError(sourceError, 'getLeadStats');
      }

      const bySource = sourceData?.reduce((acc, lead) => {
        if (lead.source) {
          acc[lead.source] = (acc[lead.source] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      // Get recent count (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recent, error: recentError } = await this.supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentError) {
        return this.handleError(recentError, 'getLeadStats');
      }

      const stats: LeadStats = {
        total: total || 0,
        byKind,
        byStatus,
        bySource,
        recent: recent || 0,
      };

      return this.success(stats);
    } catch (error) {
      return this.handleError(error, 'getLeadStats');
    }
  }

  /**
   * Export leads to CSV
   */
  public async exportLeadsToCSV(filters: LeadFilters = {}): Promise<{ success: true; data: string } | { success: false; error: string }> {
    try {
      // Get all leads matching filters
      const result = await this.getLeads(filters, 10000, 0); // Large limit for export
      
      if (!result.success) {
        return result;
      }

      // Convert to CSV
      const headers = [
        'ID',
        'Email',
        'First Name',
        'Last Name',
        'Phone',
        'Company',
        'Lead Kind',
        'Status',
        'Source',
        'Notes',
        'Created At',
        'Updated At',
      ];

      const csvRows = [
        headers.join(','),
        ...result.data.leads.map(lead => [
          lead.id,
          lead.email,
          lead.first_name || '',
          lead.last_name || '',
          lead.phone || '',
          lead.company || '',
          lead.lead_kind,
          lead.status,
          lead.source || '',
          lead.notes || '',
          lead.created_at,
          lead.updated_at,
        ].map(field => `"${field}"`).join(',')),
      ];

      return this.success(csvRows.join('\n'));
    } catch (error) {
      return this.handleError(error, 'exportLeadsToCSV');
    }
  }
}
