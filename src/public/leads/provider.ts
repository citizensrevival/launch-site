import { FakeLeadsProvider } from './services/FakeLeadsProvider';
import type { LeadsProvider } from './types/leads.types';

/**
 * The single place the site decides where leads go.
 *
 * Today that is a fake, in-memory provider: submissions are accepted and
 * discarded. Point this at a real LeadsProvider to make signups live.
 */
export const leadsProvider: LeadsProvider = new FakeLeadsProvider();
