/**
 * Admin Leads types
 * Based on database schema for leads table
 */

export interface Lead {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  lead_kind: 'volunteer' | 'vendor' | 'sponsor' | 'general';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
  source?: string;
  notes?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateLeadInput {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  lead_kind: 'volunteer' | 'vendor' | 'sponsor' | 'general';
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
  source?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface UpdateLeadInput {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  lead_kind?: 'volunteer' | 'vendor' | 'sponsor' | 'general';
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
  source?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface LeadFilters {
  search?: string;
  lead_kind?: 'volunteer' | 'vendor' | 'sponsor' | 'general';
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
  source?: string;
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
}

export interface LeadListResult {
  leads: Lead[];
  total: number;
  hasMore: boolean;
}

export interface LeadStats {
  total: number;
  byKind: Record<string, number>;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  recent: number; // leads created in last 7 days
}
