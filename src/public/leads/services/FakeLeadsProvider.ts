import type {
  CreateLeadInput,
  LeadSubmissionResult,
  LeadsProvider,
} from '../types/leads.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Placeholder lead destination. Accepts a submission, keeps it in memory for
 * the life of the page, and reports success -- nothing leaves the browser.
 *
 * This exists so the signup forms stay wired and testable while the site has no
 * backend. Submissions do NOT survive a refresh and nobody is notified.
 */
export class FakeLeadsProvider implements LeadsProvider {
  private readonly submissions: CreateLeadInput[] = [];

  public async submitLead(input: CreateLeadInput): Promise<LeadSubmissionResult> {
    const email = input.email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const lead: CreateLeadInput = { ...input, email };
    this.submissions.push(lead);

    console.info('[FakeLeadsProvider] lead captured (not persisted):', lead);

    return { success: true, leadId: crypto.randomUUID() };
  }

  /** Everything captured so far this page load. */
  public getSubmissions(): readonly CreateLeadInput[] {
    return this.submissions;
  }
}
