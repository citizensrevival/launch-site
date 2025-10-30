/**
 * Public Leads types
 * For public lead submission
 */

export interface CreateLeadInput {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  business_name?: string;
  contact_name?: string;
  website?: string;
  social_links?: string[];
  lead_kind: 'volunteer' | 'vendor' | 'sponsor' | 'general' | 'subscriber';
  source?: string;
  source_path?: string;
  notes?: string;
  metadata?: Record<string, any>;
  meta?: Record<string, any>;
  tags?: string[];
}

export interface LeadSubmissionResult {
  success: boolean;
  leadId?: string;
  error?: string;
}

export type LeadType = 'volunteer' | 'vendor' | 'sponsor' | 'general' | 'subscriber';
