import { z } from 'zod';
import type { Lead, CreateLeadInput, UpdateLeadInput, LeadFilters, LeadListResult, LeadStats } from '../types/leads.types';

// ================================================
// Lead Schemas
// ================================================

export const LeadSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  lead_kind: z.enum(['volunteer', 'vendor', 'sponsor', 'general']),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'rejected']),
  source: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  created_by: z.string().uuid().optional(),
  updated_by: z.string().uuid().optional(),
});

export const CreateLeadInputSchema = z.object({
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  lead_kind: z.enum(['volunteer', 'vendor', 'sponsor', 'general']),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'rejected']).optional().default('new'),
  source: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional().default({}),
});

export const UpdateLeadInputSchema = z.object({
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  lead_kind: z.enum(['volunteer', 'vendor', 'sponsor', 'general']).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'rejected']).optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const LeadFiltersSchema = z.object({
  search: z.string().optional(),
  lead_kind: z.enum(['volunteer', 'vendor', 'sponsor', 'general']).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'rejected']).optional(),
  source: z.string().optional(),
  created_after: z.string().datetime().optional(),
  created_before: z.string().datetime().optional(),
  updated_after: z.string().datetime().optional(),
  updated_before: z.string().datetime().optional(),
});

// ================================================
// Response Schemas
// ================================================

export const LeadListResultSchema = z.object({
  leads: z.array(LeadSchema),
  total: z.number(),
  hasMore: z.boolean(),
});

export const LeadStatsSchema = z.object({
  total: z.number(),
  byKind: z.record(z.number()),
  byStatus: z.record(z.number()),
  bySource: z.record(z.number()),
  recent: z.number(),
});
