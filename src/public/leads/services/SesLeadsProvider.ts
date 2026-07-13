import type {
  CreateLeadInput,
  LeadSubmissionResult,
  LeadsProvider,
} from '../types/leads.types';

/** A slow endpoint should surface as an error, not a spinner that never stops. */
const REQUEST_TIMEOUT_MS = 15_000;

interface EndpointResponse {
  success?: boolean;
  leadId?: string;
  error?: string;
}

/**
 * Sends leads to the AWS Lambda behind `endpoint`, which emails them via SES.
 *
 * The endpoint is public and unauthenticated -- it is CORS-locked to the site's
 * origin and rate limited on the server. Nothing secret passes through here.
 */
export class SesLeadsProvider implements LeadsProvider {
  public constructor(private readonly endpoint: string) {}

  public async submitLead(input: CreateLeadInput): Promise<LeadSubmissionResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal,
      });

      const body = (await response.json().catch(() => ({}))) as EndpointResponse;

      if (!response.ok || !body.success) {
        return {
          success: false,
          error: body.error ?? 'We could not submit your details. Please try again.',
        };
      }

      return { success: true, leadId: body.leadId };
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === 'AbortError';

      return {
        success: false,
        error: timedOut
          ? 'That took too long. Please check your connection and try again.'
          : 'We could not reach the server. Please try again.',
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
