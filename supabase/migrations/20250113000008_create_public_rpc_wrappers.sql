-- =========================================================
-- Create Public RPC Wrappers for Analytics Functions
-- =========================================================
-- Create public wrapper functions that call analytics schema functions
-- This allows RPC calls to work properly with Supabase

begin;

-- Create public wrapper for is_user_excluded
create or replace function public.is_user_excluded(
  p_user_id uuid default null,
  p_session_id uuid default null,
  p_ip_address inet default null,
  p_anon_id text default null
)
returns boolean
language plpgsql
security definer
as $$
begin
  return analytics.is_user_excluded(p_user_id, p_session_id, p_ip_address, p_anon_id);
end;
$$;

-- Create public wrapper for exclude_user
create or replace function public.exclude_user(
  p_user_id uuid default null,
  p_session_id uuid default null,
  p_ip_address inet default null,
  p_anon_id text default null,
  p_reason text default 'Manual exclusion',
  p_excluded_by text default 'admin'
)
returns uuid
language plpgsql
security definer
as $$
begin
  return analytics.exclude_user(p_user_id, p_session_id, p_ip_address, p_anon_id, p_reason, p_excluded_by);
end;
$$;

-- Create public wrapper for remove_exclusion
create or replace function public.remove_exclusion(
  p_user_id uuid default null,
  p_session_id uuid default null,
  p_ip_address inet default null,
  p_anon_id text default null
)
returns boolean
language plpgsql
security definer
as $$
begin
  return analytics.remove_exclusion(p_user_id, p_session_id, p_ip_address, p_anon_id);
end;
$$;

-- Grant execute permissions on public functions
grant execute on function public.is_user_excluded(uuid, uuid, inet, text) to authenticated;
grant execute on function public.is_user_excluded(uuid, uuid, inet, text) to anon;
grant execute on function public.exclude_user(uuid, uuid, inet, text, text, text) to authenticated;
grant execute on function public.exclude_user(uuid, uuid, inet, text, text, text) to anon;
grant execute on function public.remove_exclusion(uuid, uuid, inet, text) to authenticated;
grant execute on function public.remove_exclusion(uuid, uuid, inet, text) to anon;

commit;
