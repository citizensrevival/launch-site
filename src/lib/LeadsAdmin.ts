import { SupabaseClient } from '@supabase/supabase-js';
import { Lead, LeadSearchOptions, LeadSearchResult, UpdateLeadInput, DatabaseError, LeadType } from './types';
import { ConfigProvider, SupabaseClientFactory } from './supabase';

/**
 * Admin leads service for managing leads
 * This class handles searching, filtering, updating, and exporting leads
 * Requires admin authentication
 */
export class LeadsAdmin {
  private supabase: SupabaseClient;

  constructor(configProvider: ConfigProvider) {
    const config = configProvider.getSupabaseConfig();
    // Use admin client if service role key is available; otherwise fall back to regular client
    this.supabase = config.serviceRoleKey
      ? SupabaseClientFactory.createAdminClient(config)
      : SupabaseClientFactory.createClient(config);
  }

  /**
   * Searches and filters leads with pagination
   */
  async searchLeads(options: LeadSearchOptions = {}): Promise<{ success: boolean; data?: LeadSearchResult; error?: DatabaseError }> {
    try {
      const {
        filters = {},
        limit = 50,
        offset = 0,
        orderBy = 'created_at',
        orderDirection = 'desc',
      } = options;

      let query = this.supabase
        .from('leads')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.lead_kind) {
        query = query.eq('lead_kind', filters.lead_kind);
      }

      if (filters.business_name) {
        query = query.ilike('business_name', `%${filters.business_name}%`);
      }

      if (filters.contact_name) {
        query = query.ilike('contact_name', `%${filters.contact_name}%`);
      }

      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters.created_after) {
        query = query.gte('created_at', filters.created_after);
      }

      if (filters.created_before) {
        query = query.lte('created_at', filters.created_before);
      }

      // Apply ordering
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      const total = count || 0;
      const hasMore = offset + limit < total;

      return {
        success: true,
        data: {
          leads: (data as Lead[]) || [],
          total,
          hasMore,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Returns total count of leads
   */
  async countTotalLeads(): Promise<{ success: boolean; data?: number; error?: DatabaseError }> {
    try {
      const { count, error } = await this.supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      return {
        success: true,
        data: count || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Returns count of leads by a specific kind
   */
  async countByLeadKind(kind: LeadType): Promise<{ success: boolean; data?: number; error?: DatabaseError }> {
    try {
      const { count, error } = await this.supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('lead_kind', kind);

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      return {
        success: true,
        data: count || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Convenience method to get all dashboard counts
   */
  async getDashboardCounts(): Promise<{
    success: boolean;
    data?: { total: number; vendors: number; sponsors: number; volunteers: number; subscribers: number };
    error?: DatabaseError;
  }> {
    try {
      const [totalRes, vendorsRes, sponsorsRes, volunteersRes, subscribersRes] = await Promise.all([
        this.countTotalLeads(),
        this.countByLeadKind('vendor'),
        this.countByLeadKind('sponsor'),
        this.countByLeadKind('volunteer'),
        this.countByLeadKind('subscriber'),
      ]);

      if (!totalRes.success) return { success: false, error: totalRes.error };
      if (!vendorsRes.success) return { success: false, error: vendorsRes.error };
      if (!sponsorsRes.success) return { success: false, error: sponsorsRes.error };
      if (!volunteersRes.success) return { success: false, error: volunteersRes.error };
      if (!subscribersRes.success) return { success: false, error: subscribersRes.error };

      return {
        success: true,
        data: {
          total: totalRes.data || 0,
          vendors: vendorsRes.data || 0,
          sponsors: sponsorsRes.data || 0,
          volunteers: volunteersRes.data || 0,
          subscribers: subscribersRes.data || 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Gets a lead by ID
   */
  async getLeadById(id: string): Promise<{ success: boolean; data?: Lead; error?: DatabaseError }> {
    try {
      const { data, error } = await this.supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      return {
        success: true,
        data: data as Lead,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Updates a lead
   */
  async updateLead(id: string, updates: UpdateLeadInput): Promise<{ success: boolean; data?: Lead; error?: DatabaseError }> {
    try {
      const { data, error } = await this.supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      return {
        success: true,
        data: data as Lead,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Deletes a lead
   */
  async deleteLead(id: string): Promise<{ success: boolean; error?: DatabaseError }> {
    try {
      const { error } = await this.supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Exports leads to CSV format
   */
  async exportLeadsToCSV(options: LeadSearchOptions = {}): Promise<{ success: boolean; data?: string; error?: DatabaseError }> {
    try {
      // Get all leads (no pagination for export)
      const searchResult = await this.searchLeads({
        ...options,
        limit: 10000, // Large limit for export
        offset: 0,
      });

      if (!searchResult.success || !searchResult.data) {
        return {
          success: false,
          error: searchResult.error,
        };
      }

      const { leads } = searchResult.data;

      // Create CSV headers
      const headers = [
        'ID',
        'Lead Kind',
        'Business Name',
        'Contact Name',
        'Email',
        'Phone',
        'Website',
        'Social Links',
        'Source Path',
        'Tags',
        'Meta',
        'Created At',
      ];

      // Create CSV rows
      const rows = leads.map(lead => [
        lead.id,
        lead.lead_kind,
        lead.business_name || '',
        lead.contact_name || '',
        lead.email,
        lead.phone || '',
        lead.website || '',
        lead.social_links ? lead.social_links.join('; ') : '',
        lead.source_path || '',
        lead.tags ? lead.tags.join('; ') : '',
        lead.meta ? JSON.stringify(lead.meta) : '',
        lead.created_at,
      ]);

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      return {
        success: true,
        data: csvContent,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Gets lead statistics
   */
  async getLeadStats(): Promise<{ success: boolean; data?: any; error?: DatabaseError }> {
    try {
      // Get total count
      const { count: totalCount, error: totalError } = await this.supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        return {
          success: false,
          error: {
            message: totalError.message,
            code: totalError.code,
          },
        };
      }

      // Get count by lead kind
      const { data: kindData, error: kindError } = await this.supabase
        .from('leads')
        .select('lead_kind, count', { count: 'exact' });

      if (kindError) {
        return {
          success: false,
          error: {
            message: kindError.message,
            code: kindError.code,
          },
        };
      }

      // Get recent leads (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentCount, error: recentError } = await this.supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (recentError) {
        return {
          success: false,
          error: {
            message: recentError.message,
            code: recentError.code,
          },
        };
      }

      return {
        success: true,
        data: {
          total: totalCount || 0,
          recent: recentCount || 0,
          byKind: kindData || [],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }
}
