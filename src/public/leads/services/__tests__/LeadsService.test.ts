import { describe, it, expect, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { LeadsService } from '../LeadsService';
import { Database } from '../../../../core/types/database.types';
import { CreateLeadInput } from '../../types/leads.types';

/**
 * The site's only write to the database is upsert_lead. Its argument names are
 * a silent failure mode: a typo means PostgREST cannot resolve the overload
 * (PGRST202) and every signup fails while the UI still looks fine. These tests
 * pin the argument names against the generated database types.
 */

type UpsertLeadArgs = Database['public']['Functions']['upsert_lead']['Args'];

function clientWith(result: { data: unknown; error: unknown }) {
  const rpc = vi.fn().mockResolvedValue(result);
  return {
    client: { rpc } as unknown as SupabaseClient<Database>,
    rpc,
  };
}

const SPONSOR: CreateLeadInput = {
  lead_kind: 'sponsor',
  email: 'jane@acme.test',
  business_name: 'Acme Co',
  contact_name: 'Jane Doe',
  phone: '555-0100',
  website: 'https://acme.test',
  social_links: ['https://x.com/acme'],
  source_path: '/sponsors',
  meta: { submitted_via: 'get_involved_dialog' },
  tags: ['sponsor'],
};

describe('LeadsService.submitLead', () => {
  it('calls upsert_lead with the argument names the function actually declares', async () => {
    const { client, rpc } = clientWith({ data: 'lead-uuid', error: null });

    const result = await new LeadsService(client).submitLead(SPONSOR);

    expect(rpc).toHaveBeenCalledWith('upsert_lead', {
      p_lead_kind: 'sponsor',
      p_email: 'jane@acme.test',
      p_business_name: 'Acme Co',
      p_contact_name: 'Jane Doe',
      p_phone: '555-0100',
      p_website: 'https://acme.test',
      p_social_links: ['https://x.com/acme'],
      p_source_path: '/sponsors',
      p_meta: { submitted_via: 'get_involved_dialog' },
      p_tags: ['sponsor'],
    });
    expect(result).toEqual({ success: true, leadId: 'lead-uuid' });
  });

  it('sends only arguments that upsert_lead accepts', async () => {
    const { client, rpc } = clientWith({ data: 'lead-uuid', error: null });

    await new LeadsService(client).submitLead(SPONSOR);

    // Every key must exist on the generated Args type. Guards against
    // reintroducing dead params like p_first_name / p_company / p_metadata.
    const allowed: Record<keyof UpsertLeadArgs, true> = {
      p_lead_kind: true,
      p_email: true,
      p_business_name: true,
      p_contact_name: true,
      p_phone: true,
      p_website: true,
      p_social_links: true,
      p_source_path: true,
      p_meta: true,
      p_tags: true,
    };

    const sent = Object.keys(rpc.mock.calls[0][1]);
    expect(sent.filter((key) => !(key in allowed))).toEqual([]);
  });

  it('submits the newsletter signup as a subscriber', async () => {
    const { client, rpc } = clientWith({ data: 'lead-uuid', error: null });

    await new LeadsService(client).submitLead({
      lead_kind: 'subscriber',
      email: 'reader@example.com',
      source_path: '/',
    });

    expect(rpc.mock.calls[0][1]).toMatchObject({
      p_lead_kind: 'subscriber',
      p_email: 'reader@example.com',
    });
  });

  it('rejects a malformed email without calling the database', async () => {
    const { client, rpc } = clientWith({ data: null, error: null });

    const result = await new LeadsService(client).submitLead({
      lead_kind: 'subscriber',
      email: 'not-an-email',
    });

    expect(rpc).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
  });

  it('reports a string error the forms can render directly', async () => {
    const { client } = clientWith({
      data: null,
      error: { message: 'PGRST202', code: 'PGRST202' },
    });

    const result = await new LeadsService(client).submitLead(SPONSOR);

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe('string');
  });
});
