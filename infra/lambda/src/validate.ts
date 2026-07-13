import { HoneypotError, LEAD_KINDS, ValidationError } from './types';
import type { LeadKind, LeadPayload } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Caps that keep a hostile payload from turning into a giant email. */
const MAX_FIELD_LENGTH = 500;
const MAX_SOCIAL_LINKS = 10;
const MAX_TAGS = 10;

function asTrimmedString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string`);
  }
  const trimmed = value.trim();
  if (trimmed.length > MAX_FIELD_LENGTH) {
    throw new ValidationError(`${field} must be ${MAX_FIELD_LENGTH} characters or fewer`);
  }
  return trimmed.length > 0 ? trimmed : undefined;
}

function asStringArray(value: unknown, field: string, max: number): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new ValidationError(`${field} must be an array`);
  }
  if (value.length > max) {
    throw new ValidationError(`${field} must have ${max} entries or fewer`);
  }
  const items = value
    .map((entry, index) => asTrimmedString(entry, `${field}[${index}]`))
    .filter((entry): entry is string => entry !== undefined);

  return items.length > 0 ? items : undefined;
}

function asLeadKind(value: unknown): LeadKind {
  if (typeof value !== 'string' || !LEAD_KINDS.includes(value as LeadKind)) {
    throw new ValidationError(`lead_kind must be one of: ${LEAD_KINDS.join(', ')}`);
  }
  return value as LeadKind;
}

/**
 * Parse an untrusted request body into a LeadPayload.
 *
 * Throws ValidationError for anything malformed and HoneypotError when the
 * honeypot is filled -- the caller decides how each is reported.
 */
export function parseLead(rawBody: string | undefined): LeadPayload {
  if (!rawBody) {
    throw new ValidationError('Request body is empty');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new ValidationError('Request body is not valid JSON');
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new ValidationError('Request body must be a JSON object');
  }

  const body = parsed as Record<string, unknown>;

  if (asTrimmedString(body.company_website, 'company_website') !== undefined) {
    throw new HoneypotError();
  }

  const email = asTrimmedString(body.email, 'email');
  if (!email || !EMAIL_PATTERN.test(email)) {
    throw new ValidationError('Please enter a valid email address.');
  }

  const meta =
    typeof body.meta === 'object' && body.meta !== null && !Array.isArray(body.meta)
      ? (body.meta as Record<string, unknown>)
      : undefined;

  return {
    lead_kind: asLeadKind(body.lead_kind),
    email: email.toLowerCase(),
    business_name: asTrimmedString(body.business_name, 'business_name'),
    contact_name: asTrimmedString(body.contact_name, 'contact_name'),
    phone: asTrimmedString(body.phone, 'phone'),
    website: asTrimmedString(body.website, 'website'),
    social_links: asStringArray(body.social_links, 'social_links', MAX_SOCIAL_LINKS),
    source_path: asTrimmedString(body.source_path, 'source_path'),
    tags: asStringArray(body.tags, 'tags', MAX_TAGS),
    meta,
  };
}
