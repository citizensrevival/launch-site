// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Drives the real component tree -- store, theme, router, lazy routes -- to prove
 * a visitor can actually sign up. Both lead paths were broken before the CMS
 * removal (the RPC argument names did not match the function's), and the failure
 * was invisible from the UI, so this exercises them against a stubbed Supabase
 * client and asserts on the arguments that actually go over the wire.
 */

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock('../core/supabase', () => ({ supabase: { rpc } }));

import App from '../App';
import { store } from '../core/store';
import { resetSession } from '../core/store/slices/sessionSlice';

describe('lead capture', () => {
  beforeEach(() => {
    rpc.mockReset();
    rpc.mockResolvedValue({ data: 'lead-uuid', error: null });
    // The store is a module singleton and the session slice persists to
    // localStorage, so state leaks between tests unless it is reset.
    localStorage.clear();
    store.dispatch(resetSession());
    window.history.pushState({}, '', '/');
  });

  it('signs a visitor up for the newsletter', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(await screen.findByPlaceholderText('Email Address'), 'visitor@example.com');
    await user.click(screen.getByRole('button', { name: /stay informed/i }));

    await waitFor(() => expect(rpc).toHaveBeenCalledTimes(1));
    expect(rpc).toHaveBeenCalledWith(
      'upsert_lead',
      expect.objectContaining({
        p_lead_kind: 'subscriber',
        p_email: 'visitor@example.com',
        p_source_path: '/',
      })
    );

    expect(await screen.findByText(/subscribed for updates/i)).toBeDefined();
  });

  it('surfaces a failed signup instead of reporting success', async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: 'could not find function', code: 'PGRST202' },
    });

    const user = userEvent.setup();
    render(<App />);

    await user.type(await screen.findByPlaceholderText('Email Address'), 'visitor@example.com');
    await user.click(screen.getByRole('button', { name: /stay informed/i }));

    expect(await screen.findByText(/subscription failed/i)).toBeDefined();
    expect(screen.queryByText(/subscribed for updates/i)).toBeNull();
  });

  it('submits a sponsor through the get involved dialog', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/?dialog=get-involved');
    render(<App />);

    await user.click(await screen.findByRole('button', { name: /^sponsor/i }));

    await user.type(screen.getByPlaceholderText('Your business name'), 'Acme Co');
    await user.type(screen.getByPlaceholderText('Your full name'), 'Jane Doe');
    await user.type(screen.getByPlaceholderText('your@email.com'), 'jane@acme.test');
    await user.type(screen.getByPlaceholderText('(555) 123-4567'), '555-0100');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(rpc).toHaveBeenCalledTimes(1));
    expect(rpc).toHaveBeenCalledWith(
      'upsert_lead',
      expect.objectContaining({
        p_lead_kind: 'sponsor',
        p_email: 'jane@acme.test',
        p_business_name: 'Acme Co',
        p_contact_name: 'Jane Doe',
        p_phone: '555-0100',
      })
    );
  });
});
