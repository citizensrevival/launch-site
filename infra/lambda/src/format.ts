import type { LeadPayload, SubmissionContext } from './types';

export interface EmailBody {
  subject: string;
  html: string;
  text: string;
}

/** Route table from src/App.tsx. Unknown paths fall back to the raw path. */
const PAGE_LABELS: Record<string, string> = {
  '/': 'Home page',
  '/sponsors': 'Sponsors page',
  '/vendors': 'Vendors page',
  '/volunteers': 'Volunteers page',
  '/brought-to-you-by': 'Brought To You By page',
  '/privacy': 'Privacy Policy page',
  '/terms': 'Terms & Conditions page',
};

const LEAD_KIND_LABELS: Record<string, string> = {
  volunteer: 'Volunteer',
  vendor: 'Vendor',
  sponsor: 'Sponsor',
  general: 'General enquiry',
  subscriber: 'Email subscriber',
};

/** Meta keys already surfaced as their own line; not repeated under Details. */
const REDUNDANT_META_KEYS = ['submitted_via', 'timestamp', 'subscribed_at'];

const TIME_ZONE = 'America/New_York';

export interface SourceDescription {
  /** Which page the visitor was on when they submitted. */
  page: string;
  /** Which form they used. */
  form: string;
}

/**
 * Where the submission came from.
 *
 * The Get Involved dialog is mounted app-wide, so the page and the form are
 * two different questions -- a vendor can sign up from the home page.
 */
export function describeSource(lead: LeadPayload): SourceDescription {
  const path = lead.source_path ?? '/';
  const page = PAGE_LABELS[path] ?? `Unknown page (${path})`;
  const form =
    lead.lead_kind === 'subscriber' ? 'Email signup form' : 'Get Involved dialog';

  return { page, form };
}

export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: TIME_ZONE,
  }).format(date);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function humanizeKey(key: string): string {
  const spaced = key.replace(/[_-]+/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

interface Field {
  label: string;
  value: string;
}

/** The submission as an ordered list of present fields. Empty fields are dropped. */
function toFields(lead: LeadPayload, context: SubmissionContext): Field[] {
  const source = describeSource(lead);
  const fields: Field[] = [
    { label: 'Type', value: LEAD_KIND_LABELS[lead.lead_kind] ?? lead.lead_kind },
    { label: 'Submitted from', value: `${source.page} - ${source.form}` },
    { label: 'Submitted at', value: formatTimestamp(context.receivedAt) },
  ];

  const optional: Array<[string, string | undefined]> = [
    ['Name', lead.contact_name],
    ['Business', lead.business_name],
    ['Email', lead.email],
    ['Phone', lead.phone],
    ['Website', lead.website],
    ['Social links', lead.social_links?.join('\n              ')],
    ['Tags', lead.tags?.join(', ')],
  ];

  for (const [label, value] of optional) {
    if (value) {
      fields.push({ label, value });
    }
  }

  for (const [key, value] of Object.entries(lead.meta ?? {})) {
    if (REDUNDANT_META_KEYS.includes(key) || value === undefined || value === null) {
      continue;
    }
    fields.push({
      label: humanizeKey(key),
      value: typeof value === 'string' ? value : JSON.stringify(value),
    });
  }

  fields.push({ label: 'Lead ID', value: context.leadId });

  return fields;
}

/** The block the recipient can select and paste into a spreadsheet or CRM. */
function toPlainTextBlock(fields: Field[]): string {
  const width = Math.max(...fields.map((field) => field.label.length));
  return fields
    .map((field) => `${field.label.padEnd(width)} : ${field.value}`)
    .join('\n');
}

/**
 * The full-detail email. Goes to whoever actually works the leads.
 *
 * Reply-To is set to the submitter, so replying in the mail client reaches the
 * person rather than this mailbox.
 */
export function buildLeadEmail(lead: LeadPayload, context: SubmissionContext): EmailBody {
  const source = describeSource(lead);
  const kindLabel = LEAD_KIND_LABELS[lead.lead_kind] ?? lead.lead_kind;
  const who = lead.business_name ?? lead.contact_name ?? lead.email;
  const subject = `[Citizens Revival] ${kindLabel}: ${who} (${source.page})`;
  const plainBlock = toPlainTextBlock(toFields(lead, context));

  const rows = toFields(lead, context)
    .map(
      (field) => `
        <tr>
          <td style="padding:6px 16px 6px 0;vertical-align:top;color:#6b7280;white-space:nowrap;">${escapeHtml(field.label)}</td>
          <td style="padding:6px 0;vertical-align:top;color:#111827;"><strong>${escapeHtml(field.value).replace(/\n\s+/g, '<br>')}</strong></td>
        </tr>`,
    )
    .join('');

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;padding:24px;">
      <h1 style="font-size:20px;color:#111827;margin:0 0 4px;">New ${escapeHtml(kindLabel.toLowerCase())} submission</h1>
      <p style="color:#6b7280;margin:0 0 24px;font-size:14px;">
        From the <strong>${escapeHtml(source.page)}</strong> via the <strong>${escapeHtml(source.form)}</strong>.
      </p>

      <table style="border-collapse:collapse;font-size:14px;width:100%;">${rows}
      </table>

      <h2 style="font-size:14px;color:#6b7280;margin:32px 0 8px;font-weight:600;">Copy &amp; paste</h2>
      <pre style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;font-size:13px;line-height:1.6;overflow-x:auto;white-space:pre;color:#111827;">${escapeHtml(plainBlock)}</pre>

      <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
        Reply to this email to respond directly to ${escapeHtml(lead.email)}.
      </p>
    </div>`;

  const text = `New ${kindLabel.toLowerCase()} submission
From the ${source.page} via the ${source.form}.

${plainBlock}

Reply to this email to respond directly to ${lead.email}.`;

  return { subject, html, text };
}

export interface AdminReport {
  leadKind: string;
  page: string;
  form: string;
  sourcePath: string;
  receivedAt: Date;
  leadId: string;
  requestId: string;
  messageId: string;
  durationMs: number;
  region: string;
}

/**
 * The technical summary. Deliberately carries no submitter PII -- it exists to
 * prove the pipeline ran, not to duplicate the lead into a second inbox.
 */
export function buildAdminEmail(report: AdminReport): EmailBody {
  const rows: Field[] = [
    { label: 'Lead kind', value: report.leadKind },
    { label: 'Page', value: report.page },
    { label: 'Form', value: report.form },
    { label: 'Source path', value: report.sourcePath },
    { label: 'Received at', value: report.receivedAt.toISOString() },
    { label: 'Lead ID', value: report.leadId },
    { label: 'Request ID', value: report.requestId },
    { label: 'SES message ID', value: report.messageId },
    { label: 'Send duration', value: `${report.durationMs} ms` },
    { label: 'Region', value: report.region },
  ];

  const subject = `[Citizens Revival] Lead delivered: ${report.leadKind} from ${report.page}`;
  const block = toPlainTextBlock(rows);

  const html = `
    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;max-width:640px;margin:0 auto;padding:24px;">
      <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;font-size:14px;margin:0 0 16px;">
        A lead was captured and delivered. No personal details are included below by design.
      </p>
      <pre style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;font-size:13px;line-height:1.6;overflow-x:auto;white-space:pre;color:#111827;">${escapeHtml(block)}</pre>
    </div>`;

  return { subject, html, text: block };
}

export interface AdminFailure {
  leadKind: string;
  sourcePath: string;
  requestId: string;
  receivedAt: Date;
  error: string;
}

/** Sent when the lead email could NOT be delivered. Silence is the failure mode we can't afford. */
export function buildAdminFailureEmail(failure: AdminFailure): EmailBody {
  const rows: Field[] = [
    { label: 'Lead kind', value: failure.leadKind },
    { label: 'Source path', value: failure.sourcePath },
    { label: 'Received at', value: failure.receivedAt.toISOString() },
    { label: 'Request ID', value: failure.requestId },
    { label: 'Error', value: failure.error },
  ];

  const block = toPlainTextBlock(rows);
  const subject = '[Citizens Revival] FAILED to deliver a lead';

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;padding:24px;">
      <h1 style="font-size:18px;color:#b91c1c;margin:0 0 8px;">A lead was submitted but the email failed to send</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 16px;">
        The submitter's details are in the CloudWatch logs for this request ID. Recover the lead from there.
      </p>
      <pre style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:16px;font-size:13px;line-height:1.6;overflow-x:auto;white-space:pre;color:#111827;">${escapeHtml(block)}</pre>
    </div>`;

  return { subject, html, text: block };
}
