-- CMS Permissions and Audit System
-- This migration creates the user permissions and audit logging system

-- USER PERMISSIONS
create table if not exists user_permissions (
  user_id uuid not null references auth.users(id) on delete cascade,
  permission text not null,
  granted_at timestamptz not null default now(),
  granted_by uuid,
  primary key (user_id, permission)
);

create index if not exists idx_user_permissions on user_permissions(user_id);

-- Helper function to check permissions
create or replace function has_permission(p_user_id uuid, p_permission text)
returns boolean language sql security definer as $$
  select exists(
    select 1 from user_permissions 
    where user_id = p_user_id 
    and (permission = p_permission or permission = 'system.admin')
  );
$$;

-- AUDIT LOG
create table if not exists cms_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  user_permissions text[], -- snapshot of permissions at time of action
  action text not null, -- 'create', 'update', 'publish', 'unpublish', 'delete', 'rollback'
  entity_type text not null, -- 'page', 'block', 'menu', 'asset'
  entity_id uuid not null,
  version int,
  changes jsonb, -- what changed
  occurred_at timestamptz not null default now()
);

create index if not exists idx_audit_log_entity on cms_audit_log(entity_type, entity_id);
create index if not exists idx_audit_log_user on cms_audit_log(user_id);

-- Function to log audit entries
create or replace function log_cms_audit(
  p_user_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_version int default null,
  p_changes jsonb default null
)
returns void language plpgsql security definer as $$
declare
  user_perms text[];
begin
  -- Get current user permissions
  select array_agg(permission) into user_perms
  from user_permissions 
  where user_id = p_user_id;
  
  -- Insert audit log entry
  insert into cms_audit_log (
    user_id, user_permissions, action, entity_type, entity_id, version, changes
  ) values (
    p_user_id, user_perms, p_action, p_entity_type, p_entity_id, p_version, p_changes
  );
end;
$$;
