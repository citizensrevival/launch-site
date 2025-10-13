-- =========================================================
-- Excluded Users Table
-- =========================================================
-- Create table to track users/sessions/IPs that should be excluded from analytics

begin;

-- Create excluded_users table
create table if not exists analytics.excluded_users (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references analytics.users(id) on delete cascade,
  session_id        uuid references analytics.sessions(id) on delete cascade,
  ip_address        inet,
  anon_id           text,
  reason            text not null default 'Manual exclusion',
  excluded_by       text not null default 'admin',
  excluded_at       timestamptz not null default now(),
  
  -- Ensure at least one identifier is provided
  constraint excluded_users_identifier_check check (
    user_id is not null or 
    session_id is not null or 
    ip_address is not null or 
    anon_id is not null
  )
);

-- Create indexes for efficient lookups
create index if not exists idx_excluded_users_user_id on analytics.excluded_users (user_id);
create index if not exists idx_excluded_users_session_id on analytics.excluded_users (session_id);
create index if not exists idx_excluded_users_ip_address on analytics.excluded_users (ip_address);
create index if not exists idx_excluded_users_anon_id on analytics.excluded_users (anon_id);
create index if not exists idx_excluded_users_excluded_at on analytics.excluded_users (excluded_at);

-- Create public view for excluded users
create or replace view public.excluded_users as
select * from analytics.excluded_users;

-- Grant permissions
grant select, insert, update, delete on public.excluded_users to authenticated;
grant select, insert, update, delete on public.excluded_users to anon;

-- Create helper function to check if a user is excluded
create or replace function analytics.is_user_excluded(
  p_user_id uuid default null,
  p_session_id uuid default null,
  p_ip_address inet default null,
  p_anon_id text default null
)
returns boolean
language plpgsql
as $$
begin
  return exists (
    select 1 from analytics.excluded_users
    where (p_user_id is not null and user_id = p_user_id)
       or (p_session_id is not null and session_id = p_session_id)
       or (p_ip_address is not null and ip_address = p_ip_address)
       or (p_anon_id is not null and anon_id = p_anon_id)
  );
end;
$$;

-- Create function to exclude a user
create or replace function analytics.exclude_user(
  p_user_id uuid default null,
  p_session_id uuid default null,
  p_ip_address inet default null,
  p_anon_id text default null,
  p_reason text default 'Manual exclusion',
  p_excluded_by text default 'admin'
)
returns uuid
language plpgsql
as $$
declare
  v_exclusion_id uuid;
begin
  -- Validate that at least one identifier is provided
  if p_user_id is null and p_session_id is null and p_ip_address is null and p_anon_id is null then
    raise exception 'At least one identifier (user_id, session_id, ip_address, or anon_id) must be provided';
  end if;

  -- Insert the exclusion record
  insert into analytics.excluded_users (
    user_id, session_id, ip_address, anon_id, reason, excluded_by
  ) values (
    p_user_id, p_session_id, p_ip_address, p_anon_id, p_reason, p_excluded_by
  ) returning id into v_exclusion_id;

  return v_exclusion_id;
end;
$$;

-- Create function to remove exclusion
create or replace function analytics.remove_exclusion(
  p_user_id uuid default null,
  p_session_id uuid default null,
  p_ip_address inet default null,
  p_anon_id text default null
)
returns boolean
language plpgsql
as $$
begin
  delete from analytics.excluded_users
  where (p_user_id is not null and user_id = p_user_id)
     or (p_session_id is not null and session_id = p_session_id)
     or (p_ip_address is not null and ip_address = p_ip_address)
     or (p_anon_id is not null and anon_id = p_anon_id);
  
  return found;
end;
$$;

commit;
