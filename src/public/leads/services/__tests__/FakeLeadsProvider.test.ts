import { describe, it, expect } from 'vitest';
import { FakeLeadsProvider } from '../FakeLeadsProvider';

describe('FakeLeadsProvider', () => {
  it('accepts a lead and hands back an id', async () => {
    const provider = new FakeLeadsProvider();

    const result = await provider.submitLead({
      lead_kind: 'subscriber',
      email: 'visitor@example.com',
      source_path: '/',
    });

    expect(result.success).toBe(true);
    expect(result.leadId).toBeTruthy();
  });

  it('records what was submitted, normalising the email', async () => {
    const provider = new FakeLeadsProvider();

    await provider.submitLead({
      lead_kind: 'sponsor',
      email: '  Jane@Acme.TEST ',
      business_name: 'Acme Co',
      contact_name: 'Jane Doe',
    });

    expect(provider.getSubmissions()).toEqual([
      {
        lead_kind: 'sponsor',
        email: 'jane@acme.test',
        business_name: 'Acme Co',
        contact_name: 'Jane Doe',
      },
    ]);
  });

  it('rejects a malformed email', async () => {
    const provider = new FakeLeadsProvider();

    const result = await provider.submitLead({
      lead_kind: 'subscriber',
      email: 'not-an-email',
    });

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe('string');
    expect(provider.getSubmissions()).toHaveLength(0);
  });
});
