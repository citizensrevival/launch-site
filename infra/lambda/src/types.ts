/**
 * The wire contract between the site and this function.
 *
 * Mirrors `CreateLeadInput` in src/public/leads/types/leads.types.ts. The two
 * are deliberately independent: the site owns its domain type, this function
 * owns what it accepts off the wire. Unknown fields are tolerated (see
 * `meta`), so adding a field to the site does not require a redeploy here.
 */
export type LeadKind = 'volunteer' | 'vendor' | 'sponsor' | 'general' | 'subscriber';

export const LEAD_KINDS: readonly LeadKind[] = [
  'volunteer',
  'vendor',
  'sponsor',
  'general',
  'subscriber',
];

export interface LeadPayload {
  lead_kind: LeadKind;
  email: string;
  business_name?: string;
  contact_name?: string;
  phone?: string;
  website?: string;
  social_links?: string[];
  source_path?: string;
  meta?: Record<string, unknown>;
  tags?: string[];
  /** Honeypot. Real users never fill this; a non-empty value means a bot. */
  company_website?: string;
}

/** Everything the function learns about a submission beyond the payload itself. */
export interface SubmissionContext {
  leadId: string;
  receivedAt: Date;
  requestId: string;
}

export class ValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/** A bot tripped the honeypot. Accepted at the edge, then dropped. */
export class HoneypotError extends Error {
  public constructor() {
    super('Honeypot field was filled');
    this.name = 'HoneypotError';
  }
}
