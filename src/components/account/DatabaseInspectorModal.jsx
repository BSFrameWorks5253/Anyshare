import React, { useState } from 'react';
import { sounds } from '../../lib/sound';
import { SUPABASE_CONFIG } from '../../lib/supabase';
import {
  Database,
  X,
  Copy,
  Check,
  Shield,
  Layers,
  Lock
} from 'lucide-react';

const SCHEMA_SQL = `-- Anything Share schema draft for the EXISTING Anything Supabase project.
-- Existing public.profiles and auth.users are reused; no media is stored.

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

alter table anything_share.workflow_items enable row level security;
alter table anything_share.workflow_events enable row level security;
alter table anything_share.bridge_devices enable row level security;
alter table anything_share.render_commands enable row level security;
alter table anything_share.notifications enable row level security;`;

export default function DatabaseInspectorModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    sounds.playSuccess();
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/40 backdrop-blur-md animate-fadeIn">
      <div 
        className="glass-panel w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl border border-[#C5A059]/30 shadow-2xl flex flex-col overflow-hidden text-left bg-white/95"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#C5A059]/20 flex items-start justify-between gap-3 bg-gradient-to-r from-amber-50/60 to-white/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 border border-[#C5A059]/30 text-[#997328]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Supabase Schema Blueprint
              </h2>
              <p className="text-xs text-[#997328] font-mono truncate max-w-[280px]">
                {SUPABASE_CONFIG.url}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-[#C5A059]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div className="flex items-center justify-between">
            <span className="text-stone-700 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Row Level Security (RLS) Enforced
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold glass-pill hover:bg-[#C5A059]/15 text-[#997328] flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied SQL</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL Script</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-stone-900 border border-[#C5A059]/30 text-[11px] font-mono text-amber-100/90 overflow-x-auto max-h-[420px] leading-relaxed select-all shadow-inner">
            {SCHEMA_SQL}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#C5A059]/20 bg-amber-50/40 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold glass-pill hover:bg-stone-200 text-stone-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
