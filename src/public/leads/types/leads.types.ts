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
  /**
   * Anti-spam honeypot, populated by HoneypotField. Real users leave it empty;
   * a non-empty value means a bot and the server drops the submission.
   */
  company_website?: string;
}

export interface LeadSubmissionResult {
  success: boolean;
  leadId?: string;
  error?: string;
}

/**
 * Where a submitted lead goes. SesLeadsProvider posts to the Lambda that emails
 * submissions; FakeLeadsProvider discards them. `leads/provider.ts` picks one.
 */
export interface LeadsProvider {
  submitLead(input: CreateLeadInput): Promise<LeadSubmissionResult>;
}
