import { randomUUID } from 'node:crypto';

import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

import {
  buildAdminEmail,
  buildAdminFailureEmail,
  buildLeadEmail,
  describeSource,
} from './format';
import type { EmailBody } from './format';
import { RateLimiter } from './rateLimiter';
import { HoneypotError, ValidationError } from './types';
import type { LeadPayload, SubmissionContext } from './types';
import { parseLead } from './validate';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const FROM_EMAIL = requiredEnv('FROM_EMAIL');
const LEADS_EMAIL = requiredEnv('LEADS_EMAIL');
const ADMIN_EMAIL = requiredEnv('ADMIN_EMAIL');
const ALLOWED_ORIGINS = requiredEnv('ALLOWED_ORIGINS')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const REGION = requiredEnv('AWS_REGION');

const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

const ses = new SESv2Client({ region: REGION });

/** Module scope on purpose: survives across warm invocations. */
const rateLimiter = new RateLimiter(RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);

async function sendEmail(to: string, body: EmailBody, replyTo?: string): Promise<string> {
  const response = await ses.send(
    new SendEmailCommand({
      FromEmailAddress: FROM_EMAIL,
      Destination: { ToAddresses: [to] },
      ReplyToAddresses: replyTo ? [replyTo] : undefined,
      Content: {
        Simple: {
          Subject: { Data: body.subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: body.html, Charset: 'UTF-8' },
            Text: { Data: body.text, Charset: 'UTF-8' },
          },
        },
      },
    }),
  );

  return response.MessageId ?? 'unknown';
}

function jsonResponse(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

/**
 * The origin check is a cheap filter, not a security boundary -- any client can
 * forge the header. Browsers cannot, which is what makes it worth having: it
 * costs nothing and stops a hostile page from posting on a visitor's behalf.
 */
function isOriginAllowed(event: APIGatewayProxyEventV2): boolean {
  const origin = event.headers.origin ?? event.headers.Origin;
  return origin !== undefined && ALLOWED_ORIGINS.includes(origin);
}

/**
 * Notify the admin that a lead came in but could not be emailed, and log the
 * payload so the lead is recoverable from CloudWatch. Never throws -- it runs
 * on a path that is already failing.
 */
async function reportFailure(
  lead: LeadPayload,
  context: SubmissionContext,
  error: unknown,
): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);

  console.error('LEAD_SEND_FAILED', {
    requestId: context.requestId,
    error: message,
    lead,
  });

  try {
    await sendEmail(
      ADMIN_EMAIL,
      buildAdminFailureEmail({
        leadKind: lead.lead_kind,
        sourcePath: lead.source_path ?? '/',
        requestId: context.requestId,
        receivedAt: context.receivedAt,
        error: message,
      }),
    );
  } catch (alertError) {
    console.error('ADMIN_ALERT_FAILED', { requestId: context.requestId, error: alertError });
  }
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const requestId = event.requestContext.requestId;
  const receivedAt = new Date();

  if (event.requestContext.http.method !== 'POST') {
    return jsonResponse(405, { success: false, error: 'Method not allowed' });
  }

  if (!isOriginAllowed(event)) {
    console.warn('ORIGIN_REJECTED', { requestId, origin: event.headers.origin });
    return jsonResponse(403, { success: false, error: 'Forbidden' });
  }

  const sourceIp = event.requestContext.http.sourceIp;
  if (!rateLimiter.tryConsume(sourceIp, receivedAt.getTime())) {
    console.warn('RATE_LIMITED', { requestId, sourceIp });
    return jsonResponse(429, {
      success: false,
      error: 'Too many submissions. Please wait a minute and try again.',
    });
  }

  let lead: LeadPayload;
  try {
    lead = parseLead(event.body);
  } catch (error) {
    if (error instanceof HoneypotError) {
      // Report success so the bot has nothing to tune against. Nothing is sent.
      console.warn('HONEYPOT_TRIPPED', { requestId, sourceIp });
      return jsonResponse(200, { success: true, leadId: randomUUID() });
    }
    if (error instanceof ValidationError) {
      return jsonResponse(400, { success: false, error: error.message });
    }
    throw error;
  }

  const context: SubmissionContext = { leadId: randomUUID(), receivedAt, requestId };
  const startedAt = Date.now();

  try {
    const messageId = await sendEmail(
      LEADS_EMAIL,
      buildLeadEmail(lead, context),
      lead.email,
    );

    const source = describeSource(lead);
    console.info('LEAD_DELIVERED', {
      requestId,
      leadId: context.leadId,
      leadKind: lead.lead_kind,
      page: source.page,
      messageId,
    });

    // The admin report is a nice-to-have: the lead is already delivered, so a
    // failure here must not fail the request.
    try {
      await sendEmail(
        ADMIN_EMAIL,
        buildAdminEmail({
          leadKind: lead.lead_kind,
          page: source.page,
          form: source.form,
          sourcePath: lead.source_path ?? '/',
          receivedAt,
          leadId: context.leadId,
          requestId,
          messageId,
          durationMs: Date.now() - startedAt,
          region: REGION,
        }),
      );
    } catch (error) {
      console.error('ADMIN_REPORT_FAILED', { requestId, error });
    }

    return jsonResponse(200, { success: true, leadId: context.leadId });
  } catch (error) {
    await reportFailure(lead, context, error);
    return jsonResponse(502, {
      success: false,
      error: 'We could not submit your details right now. Please try again shortly.',
    });
  }
}
