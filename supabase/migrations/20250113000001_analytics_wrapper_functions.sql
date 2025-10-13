-- =========================================================
-- Analytics Wrapper Functions for Edge Functions
-- =========================================================
-- Create public wrapper functions that call the analytics schema functions
-- This allows Edge Functions to call them via RPC without schema prefixes

begin;

-- Wrapper for upsert_user_by_anon_id
create or replace function public.upsert_user_by_anon_id(p_anon_id text)
returns uuid
language plpgsql
security definer
as $$
begin
  return analytics.upsert_user_by_anon_id(p_anon_id);
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.upsert_user_by_anon_id(text) to authenticated;
grant execute on function public.upsert_user_by_anon_id(text) to anon;

commit;
