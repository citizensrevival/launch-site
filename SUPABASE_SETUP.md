# Supabase Integration Setup

This document explains how to set up Supabase integration for the Launch Site project.

## Prerequisites

1. A Supabase project with the leads table schema
2. GitHub repository with Actions enabled

## Database Schema

Make sure your Supabase database has the following table:

```sql
create table public.leads (
  id uuid not null default gen_random_uuid (),
  lead_kind public.lead_type not null,
  business_name text null,
  contact_name text null,
  email text not null,
  phone text null,
  website text null,
  social_links text[] null default '{}'::text[],
  source_path text null,
  tags text[] null default '{}'::text[],
  meta jsonb null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint leads_pkey primary key (id),
  constraint leads_email_check check ((POSITION(('@'::text) in (email)) > 1))
);

create type public.lead_type as enum ('vendor', 'sponsor', 'volunteer', 'general');

create index IF not exists leads_kind_idx on public.leads using btree (lead_kind);
create index IF not exists leads_email_idx on public.leads using btree (email);
create index IF not exists leads_created_at_idx on public.leads using btree (created_at desc);
```

## Environment Variables Setup

### For Local Development

1. Create a `.env.local` file in your project root
2. Add the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### For GitHub Pages Deployment

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and Variables > Actions
3. Add the following repository secrets:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (keep this secret!)

## Usage

### Basic Usage

```typescript
import { createLeadsPublicService, createLeadsAdminService } from './lib';

// For public lead submission
const leadsPublic = createLeadsPublicService();

// For admin operations (requires service role key)
const leadsAdmin = createLeadsAdminService();
```

### Submitting a Lead

```typescript
const result = await leadsPublic.createLead({
  lead_kind: 'vendor',
  business_name: 'My Business',
  contact_name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  website: 'https://example.com',
  tags: ['food', 'local'],
  source_path: '/vendors',
  meta: { source: 'website' }
});

if (result.success) {
  console.log('Lead created:', result.data);
} else {
  console.error('Error:', result.error);
}
```

### Admin Operations

```typescript
// Search leads
const searchResult = await leadsAdmin.searchLeads({
  filters: { lead_kind: 'vendor' },
  limit: 10,
  offset: 0
});

// Export to CSV
const csvResult = await leadsAdmin.exportLeadsToCSV({
  filters: { created_after: '2024-01-01' }
});

// Get statistics
const stats = await leadsAdmin.getLeadStats();
```

## Security Considerations

1. **Service Role Key**: Never expose the service role key in client-side code. It should only be used in server-side operations or admin functions.

2. **Row Level Security**: Consider setting up Row Level Security (RLS) policies in Supabase to control access to the leads table.

3. **Environment Variables**: Always use environment variables for sensitive configuration.

## API Reference

### LeadsPublic Class

- `createLead(input: CreateLeadInput)`: Creates a new lead
- `emailExists(email: string)`: Checks if an email already exists
- `getLeadById(id: string)`: Gets a lead by ID

### LeadsAdmin Class

- `searchLeads(options: LeadSearchOptions)`: Searches and filters leads
- `getLeadById(id: string)`: Gets a lead by ID
- `updateLead(id: string, updates: UpdateLeadInput)`: Updates a lead
- `deleteLead(id: string)`: Deletes a lead
- `exportLeadsToCSV(options: LeadSearchOptions)`: Exports leads to CSV
- `getLeadStats()`: Gets lead statistics

## Troubleshooting

1. **Build Errors**: Make sure all environment variables are set correctly
2. **Database Errors**: Verify your Supabase project has the correct schema
3. **Permission Errors**: Check that your API keys have the correct permissions
4. **Network Errors**: Ensure your Supabase project is accessible and not paused
