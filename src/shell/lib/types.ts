/**
 * TypeScript types for the leads table schema
 */

export type LeadType = 'subscriber' | 'vendor' | 'sponsor' | 'volunteer';

export interface Lead {
  id: string;
  lead_kind: LeadType;
  business_name: string | null;
  contact_name: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  social_links: string[] | null;
  source_path: string | null;
  tags: string[] | null;
  meta: Record<string, any> | null;
  created_at: string;
}

export interface CreateLeadInput {
  lead_kind: LeadType;
  business_name?: string;
  contact_name?: string;
  email: string;
  phone?: string;
  website?: string;
  social_links?: string[];
  source_path?: string;
  tags?: string[];
  meta?: Record<string, any>;
}

export interface UpdateLeadInput {
  lead_kind?: LeadType;
  business_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  social_links?: string[];
  tags?: string[];
  meta?: Record<string, any>;
}

export interface LeadFilters {
  lead_kind?: LeadType;
  business_name?: string;
  contact_name?: string;
  email?: string;
  tags?: string[];
  created_after?: string;
  created_before?: string;
}

export interface LeadSearchOptions {
  filters?: LeadFilters;
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'email' | 'business_name';
  orderDirection?: 'asc' | 'desc';
}

export interface LeadSearchResult {
  leads: Lead[];
  total: number;
  hasMore: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface DatabaseError {
  message: string;
  code?: string;
  details?: string;
}
