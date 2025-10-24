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
  lead_kind: 'volunteer' | 'vendor' | 'sponsor' | 'general';
  source?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface LeadSubmissionResult {
  success: boolean;
  leadId?: string;
  error?: string;
}
