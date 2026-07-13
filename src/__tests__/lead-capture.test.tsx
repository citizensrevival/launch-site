// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '../App';
import { store } from '../core/store';
import {
  resetSession,
  setEmailSubscribed,
  setGetInvolvedSubmission,
} from '../core/store/slices/sessionSlice';
import { leadsProvider } from '../public/leads/provider';

/**
 * Drives the real component tree -- store, theme, router, lazy routes -- to prove
 * a visitor can still sign up. The forms are the only interactive surface on the
 * site, and they currently hand off to a fake provider, so these tests assert on
 * what reaches the provider rather than on any backend.
 */
describe('lead capture', () => {
  let submitLead: ReturnType<typeof vi.spyOn<typeof leadsProvider, 'submitLead'>>;

  beforeEach(() => {
    submitLead = vi.spyOn(leadsProvider, 'submitLead');
    submitLead.mockResolvedValue({ success: true, leadId: 'lead-id' });
    // The store is a module singleton and the session slice persists to
    // localStorage, so state leaks between tests unless it is reset.
    localStorage.clear();
    store.dispatch(resetSession());
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    submitLead.mockRestore();
  });

  it('signs a visitor up for the newsletter', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(await screen.findByPlaceholderText('Email Address'), 'visitor@example.com');
    await user.click(screen.getByRole('button', { name: /stay informed/i }));

    await waitFor(() => expect(submitLead).toHaveBeenCalledTimes(1));
    expect(submitLead).toHaveBeenCalledWith(
      expect.objectContaining({
        lead_kind: 'subscriber',
        email: 'visitor@example.com',
        source_path: '/',
      })
    );

    expect(await screen.findByText(/successfully subscribed/i)).toBeDefined();
  });

  it('surfaces a failed signup instead of reporting success', async () => {
    submitLead.mockResolvedValue({ success: false, error: 'Something went wrong.' });

    const user = userEvent.setup();
    render(<App />);

    await user.type(await screen.findByPlaceholderText('Email Address'), 'visitor@example.com');
    await user.click(screen.getByRole('button', { name: /stay informed/i }));

    expect(await screen.findByText(/subscription failed/i)).toBeDefined();
    expect(screen.queryByText(/successfully subscribed/i)).toBeNull();
  });

  // A previous signup is remembered in localStorage, but it must never stop the
  // visitor submitting again -- they may want to use a different address.
  it('still lets a previously subscribed visitor sign up again', async () => {
    store.dispatch(setEmailSubscribed(true));

    const user = userEvent.setup();
    render(<App />);

    await user.type(await screen.findByPlaceholderText('Email Address'), 'second@example.com');
    await user.click(screen.getByRole('button', { name: /stay informed/i }));

    await waitFor(() => expect(submitLead).toHaveBeenCalledTimes(1));
    expect(submitLead).toHaveBeenCalledWith(
      expect.objectContaining({ lead_kind: 'subscriber', email: 'second@example.com' })
    );
  });

  // Same rule for the Get Involved dialog: a remembered sponsor submission must
  // not disable the sponsor option.
  it('still lets a previously submitted sponsor open the sponsor form again', async () => {
    store.dispatch(setGetInvolvedSubmission({ type: 'sponsor', submitted: true }));
    window.history.pushState({}, '', '/?dialog=get-involved');

    const user = userEvent.setup();
    render(<App />);

    const sponsorButton = await screen.findByRole('button', { name: /^sponsor/i });
    expect(sponsorButton.hasAttribute('disabled')).toBe(false);

    await user.click(sponsorButton);
    expect(screen.getByPlaceholderText('Your business name')).toBeDefined();
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

    await waitFor(() => expect(submitLead).toHaveBeenCalledTimes(1));
    expect(submitLead).toHaveBeenCalledWith(
      expect.objectContaining({
        lead_kind: 'sponsor',
        email: 'jane@acme.test',
        business_name: 'Acme Co',
        contact_name: 'Jane Doe',
        phone: '555-0100',
      })
    );
  });
});
