-- Anything Share schema draft for the EXISTING Anything Supabase project.
-- Existing public.profiles and auth.users are reused; no media is stored.
-- Review and apply via migration after validating the current project schema/RLS.

create schema if not exists anything_share;

create or replace function anything_share.is_admin()
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(p.role) = 'admin'
  );
$$;

create table if not exists anything_share.workflow_items (
  id uuid primary key default gen_random_uuid(),
  external_key text not null unique,
  display_label text not null,
  assigned_user_id uuid references public.profiles(id) on delete set null,
  status text not null check (status in (
    'pending_edit_1','edit_1','pending_edit_2','edit_2','ready_to_render',
    'render_requested','checking','correction_needed','rendering','rendered',
    'pending_upload','uploaded','given_to_jamey','done','failed','cancelled'
  )),
  status_source text not null check (status_source in ('onetap_detected','admin_confirmed','admin_corrected','system')),
  evidence_summary jsonb not null default '{}'::jsonb,
  rule_id text,
  rule_version text,
  last_scanned_at timestamptz,
  is_stale boolean not null default false,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists anything_share.workflow_events (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references anything_share.workflow_items(id) on delete cascade,
  event_type text not null check (event_type in (
    'detected','confirmed','corrected','assigned','render_requested','preflight',
    'render_started','render_progress','render_completed','render_failed',
    'correction_requested','done','admin_exception','scan_stale'
  )),
  old_status text,
  new_status text,
  evidence_summary jsonb not null default '{}'::jsonb,
  reason text,
  actor_user_id uuid references public.profiles(id) on delete set null,
  source text not null check (source in ('onetap','user','admin','system')),
  created_at timestamptz not null default now()
);

create table if not exists anything_share.bridge_devices (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  credential_hash text not null,
  enrolled_by uuid references public.profiles(id) on delete set null,
  is_active boolean not null default true,
  app_version text,
  last_heartbeat_at timestamptz,
  last_scan_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists anything_share.render_commands (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references anything_share.workflow_items(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete restrict,
  bridge_device_id uuid references anything_share.bridge_devices(id) on delete set null,
  state text not null check (state in (
    'queued','claimed','checking','correction_needed','rendering',
    'verifying','completed','failed','cancelled','expired'
  )),
  idempotency_key uuid not null unique,
  check_report jsonb not null default '{}'::jsonb,
  result_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  claimed_at timestamptz,
  finished_at timestamptz
);

create table if not exists anything_share.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid references anything_share.workflow_items(id) on delete set null,
  command_id uuid references anything_share.render_commands(id) on delete set null,
  kind text not null check (kind in ('assigned','correction_needed','render_started','render_failed','render_completed','status_changed')),
  title text not null,
  message text not null,
  delivery_state text not null default 'in_app' check (delivery_state in ('in_app','queued','sent','failed','expired')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists anything_share.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh_key text not null,
  auth_key text not null,
  enabled_kinds text[] not null default array['render_completed','render_failed','correction_needed'],
  created_at timestamptz not null default now(),
  last_success_at timestamptz
);

create index if not exists share_items_assignee_status_idx on anything_share.workflow_items(assigned_user_id, status);
create index if not exists share_events_item_created_idx on anything_share.workflow_events(item_id, created_at desc);
create index if not exists share_commands_state_created_idx on anything_share.render_commands(state, created_at);
create index if not exists share_notifications_recipient_created_idx on anything_share.notifications(recipient_user_id, created_at desc);

alter table anything_share.workflow_items enable row level security;
alter table anything_share.workflow_events enable row level security;
alter table anything_share.bridge_devices enable row level security;
alter table anything_share.render_commands enable row level security;
alter table anything_share.notifications enable row level security;
alter table anything_share.push_subscriptions enable row level security;

-- Read access only for direct clients. Mutations should go through validated
-- Edge Functions/RPCs that enforce roles, assignment, evidence and idempotency.
create policy "assigned users and admins read items" on anything_share.workflow_items
  for select to authenticated using (assigned_user_id = auth.uid() or anything_share.is_admin());
create policy "users and admins read related events" on anything_share.workflow_events
  for select to authenticated using (
    anything_share.is_admin() or exists (
      select 1 from anything_share.workflow_items i
      where i.id = item_id and i.assigned_user_id = auth.uid()
    )
  );
create policy "admins read bridge devices" on anything_share.bridge_devices
  for select to authenticated using (anything_share.is_admin());
create policy "requesters assigned users and admins read commands" on anything_share.render_commands
  for select to authenticated using (
    requested_by = auth.uid() or anything_share.is_admin() or exists (
      select 1 from anything_share.workflow_items i
      where i.id = item_id and i.assigned_user_id = auth.uid()
    )
  );
create policy "recipients read notifications" on anything_share.notifications
  for select to authenticated using (recipient_user_id = auth.uid() or anything_share.is_admin());
create policy "users manage their push subscriptions" on anything_share.push_subscriptions
  for all to authenticated using (user_id = auth.uid() or anything_share.is_admin())
  with check (user_id = auth.uid() or anything_share.is_admin());

-- Intentionally no direct client write policies for statuses, events, commands,
-- notifications, or bridge credentials. Implement validated server functions.
-- Retention job (daily): delete notifications older than 30 days; delete terminal
-- commands after 7 days; delete events/items only when item is Done and done_at
-- is older than 90 days. Never delete active/unresolved items or public.profiles.
-- Configure/schedule this job in the Supabase project and monitor its last run.
