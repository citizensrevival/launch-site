/**
 * Public Leads types
 * For public lead submission
 */

export type LeadType = 'volunteer' | 'vendor' | 'sponsor' | 'general' | 'subscriber';

/**
 * Mirrors the arguments of the `upsert_lead` Postgres function.
 * Field names must stay aligned with the RPC parameters (`p_<field>`).
 */
export interface CreateLeadInput {
  lead_kind: LeadType;
  email: string;
  business_name?: string;
  contact_name?: string;
  phone?: string;
  website?: string;
  social_links?: string[];
  source_path?: string;
  meta?: Record<string, unknown>;
  tags?: string[];
}

export interface LeadSubmissionResult {
  success: boolean;
  leadId?: string;
  error?: string;
}
