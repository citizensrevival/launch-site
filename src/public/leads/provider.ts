import { FakeLeadsProvider } from './services/FakeLeadsProvider';
import { SesLeadsProvider } from './services/SesLeadsProvider';
import type { LeadsProvider } from './types/leads.types';

/**
 * The single place the site decides where leads go.
 *
 * With VITE_LEADS_ENDPOINT set (see .env.production), submissions go to the
 * Lambda that emails them via SES. Without it -- local dev, tests -- they go to
 * the fake provider and are discarded, so no real mail is sent by accident.
 */
const endpoint = import.meta.env.VITE_LEADS_ENDPOINT;

export const leadsProvider: LeadsProvider = endpoint
  ? new SesLeadsProvider(endpoint)
  : new FakeLeadsProvider();
