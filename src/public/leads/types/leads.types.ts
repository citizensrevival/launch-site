/**
 * Public Leads types
 * For public lead submission
 */

export type LeadType = 'volunteer' | 'vendor' | 'sponsor' | 'general' | 'subscriber';

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

/**
 * Where a submitted lead goes. The site has no backend right now, so the only
 * implementation is FakeLeadsProvider. Swap the implementation in
 * `leads/provider.ts` when a real destination exists -- nothing else should
 * need to change.
 */
export interface LeadsProvider {
  submitLead(input: CreateLeadInput): Promise<LeadSubmissionResult>;
}
