-- ====================================================================
-- ANYSHARE & ONE TAP NEXUS — SUPABASE REALTIME DDL SCHEMA
-- ====================================================================
-- Execute this script in your Supabase SQL Editor to enable real-time
-- synchronization between AnyShare mobile/web and One Tap desktop node.
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Schema (or use public)
CREATE SCHEMA IF NOT EXISTS anything_share;

-- 3. Workflow Productions Table
CREATE TABLE IF NOT EXISTS public.anyshare_items (
  id TEXT PRIMARY KEY,
  external_key TEXT NOT NULL UNIQUE,
  display_label TEXT NOT NULL,
  assigned_user_id TEXT,
  status TEXT NOT NULL CHECK (status IN (
    'in_editing', 'ready_to_render', 'render_requested', 'checking',
    'correction_needed', 'rendering', 'rendered', 'qa_review', 'delivered', 'done'
  )),
  status_source TEXT NOT NULL DEFAULT 'onetap_detected',
  evidence_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  rule_id TEXT DEFAULT 'onetap_canonical_v2',
  rule_version TEXT DEFAULT '2.4.1',
  last_scanned_at TIMESTAMPTZ DEFAULT NOW(),
  is_stale BOOLEAN NOT NULL DEFAULT false,
  done_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Audit & Provenance Ledger Table
CREATE TABLE IF NOT EXISTS public.anyshare_events (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES public.anyshare_items(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  evidence_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  reason TEXT,
  actor_user_id TEXT,
  source TEXT NOT NULL DEFAULT 'onetap',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Realtime Remote Render Commands Queue
CREATE TABLE IF NOT EXISTS public.anyshare_render_commands (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  external_key TEXT NOT NULL,
  display_label TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  target_preset TEXT DEFAULT 'Match Source - High Bitrate (4K H.264)',
  priority TEXT DEFAULT 'rush',
  state TEXT NOT NULL DEFAULT 'queued' CHECK (state IN (
    'queued', 'claimed', 'checking', 'rendering', 'verifying', 'completed', 'failed', 'aborted'
  )),
  idempotency_key TEXT NOT NULL UNIQUE,
  check_report JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  claimed_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

-- 6. Realtime Notifications Table
CREATE TABLE IF NOT EXISTS public.anyshare_notifications (
  id TEXT PRIMARY KEY,
  recipient_user_id TEXT NOT NULL,
  item_id TEXT,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Workstation Bridge Nodes Table
CREATE TABLE IF NOT EXISTS public.anyshare_workstations (
  node_id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  app_version TEXT,
  bridge_port INT DEFAULT 5253,
  local_ip TEXT DEFAULT '127.0.0.1',
  gpu TEXT,
  storage_free_gb NUMERIC,
  is_online BOOLEAN DEFAULT true,
  last_heartbeat_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.anyshare_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anyshare_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anyshare_render_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anyshare_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anyshare_workstations ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access for authenticated & anonymous studio clients
CREATE POLICY "Public read anyshare_items" ON public.anyshare_items FOR SELECT USING (true);
CREATE POLICY "Public insert anyshare_items" ON public.anyshare_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update anyshare_items" ON public.anyshare_items FOR UPDATE USING (true);

CREATE POLICY "Public read anyshare_events" ON public.anyshare_events FOR SELECT USING (true);
CREATE POLICY "Public insert anyshare_events" ON public.anyshare_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read anyshare_render_commands" ON public.anyshare_render_commands FOR SELECT USING (true);
CREATE POLICY "Public write anyshare_render_commands" ON public.anyshare_render_commands FOR ALL USING (true);

CREATE POLICY "Public read anyshare_notifications" ON public.anyshare_notifications FOR SELECT USING (true);
CREATE POLICY "Public write anyshare_notifications" ON public.anyshare_notifications FOR ALL USING (true);

CREATE POLICY "Public read anyshare_workstations" ON public.anyshare_workstations FOR SELECT USING (true);
CREATE POLICY "Public write anyshare_workstations" ON public.anyshare_workstations FOR ALL USING (true);

-- ====================================================================
-- ENABLE REALTIME PUBLICATION
-- ====================================================================
-- Allows supabase.channel listeners on phones and PC to receive instant postgres_changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.anyshare_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anyshare_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anyshare_render_commands;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anyshare_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anyshare_workstations;
