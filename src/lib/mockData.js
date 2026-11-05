// AnyShare Ecosystem Data & Stage Models (Islamic Golden & White Edition)

export const STAGE_CONFIG = {
  pending_edit_1: {
    label: 'Pending Edit 1',
    shortLabel: 'Pending E1',
    color: 'amber',
    border: 'border-amber-700/20',
    bg: 'bg-amber-500/10',
    text: 'text-amber-900',
    dot: 'bg-amber-600',
    icon: 'Clock'
  },
  edit_1: {
    label: 'Edit 1',
    shortLabel: 'Edit 1',
    color: 'sky',
    border: 'border-sky-600/25',
    bg: 'bg-sky-500/10',
    text: 'text-sky-950',
    dot: 'bg-sky-600',
    icon: 'FileEdit'
  },
  pending_edit_2: {
    label: 'Pending Edit 2',
    shortLabel: 'Pending E2',
    color: 'amber',
    border: 'border-amber-700/20',
    bg: 'bg-amber-500/10',
    text: 'text-amber-900',
    dot: 'bg-amber-600',
    icon: 'Layers'
  },
  edit_2: {
    label: 'Edit 2',
    shortLabel: 'Edit 2',
    color: 'cyan',
    border: 'border-cyan-600/25',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-950',
    dot: 'bg-cyan-600',
    icon: 'Sliders'
  },
  ready_to_render: {
    label: 'Ready to Render',
    shortLabel: 'Ready',
    color: 'gold',
    border: 'border-amber-500/40',
    bg: 'bg-amber-100/70',
    text: 'text-amber-950 font-bold',
    dot: 'bg-amber-500',
    icon: 'Zap'
  },
  render_requested: {
    label: 'Render Requested',
    shortLabel: 'Requested',
    color: 'gold',
    border: 'border-amber-500/35',
    bg: 'bg-amber-100/60',
    text: 'text-amber-900',
    dot: 'bg-amber-500',
    icon: 'Send'
  },
  checking: {
    label: 'Checking Preflight',
    shortLabel: 'Checking',
    color: 'amber',
    border: 'border-amber-600/30',
    bg: 'bg-amber-100/60',
    text: 'text-amber-900',
    dot: 'bg-amber-500 animate-pulse',
    icon: 'ShieldAlert'
  },
  rendering: {
    label: 'Rendering',
    shortLabel: 'Rendering',
    color: 'gold',
    border: 'border-amber-600/40',
    bg: 'bg-amber-200/50',
    text: 'text-amber-950 font-bold',
    dot: 'bg-amber-600 animate-ping',
    icon: 'Cpu'
  },
  rendered: {
    label: 'Rendered',
    shortLabel: 'Rendered',
    color: 'emerald',
    border: 'border-emerald-600/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-950 font-semibold',
    dot: 'bg-emerald-600',
    icon: 'CheckCircle2'
  },
  pending_upload: {
    label: 'Pending Upload',
    shortLabel: 'To Upload',
    color: 'amber',
    border: 'border-amber-700/20',
    bg: 'bg-amber-500/10',
    text: 'text-amber-900',
    dot: 'bg-amber-600',
    icon: 'UploadCloud'
  },
  uploaded: {
    label: 'Uploaded',
    shortLabel: 'Uploaded',
    color: 'emerald',
    border: 'border-emerald-600/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-900 font-semibold',
    dot: 'bg-emerald-600',
    icon: 'CheckCheck'
  },
  given_to_jamey: {
    label: 'Given to Jamey',
    shortLabel: 'To Jamey',
    color: 'emerald',
    border: 'border-emerald-600/35',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-950 font-bold',
    dot: 'bg-emerald-600',
    icon: 'UserCheck'
  },
  done: {
    label: 'Done',
    shortLabel: 'Done',
    color: 'emerald',
    border: 'border-emerald-600/40',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-950 font-bold',
    dot: 'bg-emerald-600',
    icon: 'Sparkles'
  },
  correction_needed: {
    label: 'Correction Needed',
    shortLabel: 'Needs Review',
    color: 'rose',
    border: 'border-rose-600/40',
    bg: 'bg-rose-500/10',
    text: 'text-rose-950 font-bold',
    dot: 'bg-rose-600 animate-ping',
    icon: 'AlertTriangle'
  },
  failed: {
    label: 'Failed',
    shortLabel: 'Failed',
    color: 'rose',
    border: 'border-rose-600/30',
    bg: 'bg-rose-500/10',
    text: 'text-rose-900',
    dot: 'bg-rose-600',
    icon: 'XCircle'
  },
  cancelled: {
    label: 'Cancelled',
    shortLabel: 'Cancelled',
    color: 'stone',
    border: 'border-stone-500/20',
    bg: 'bg-stone-500/10',
    text: 'text-stone-700',
    dot: 'bg-stone-500',
    icon: 'Ban'
  }
};

export const INITIAL_BRIDGE = {
  id: 'bridge_workstation_studio_01',
  label: 'Studio-PC-01 (Primary One Tap Node)',
  app_version: 'One Tap v2.4.1 (Ecosystem Build 882)',
  is_active: true,
  is_online: true,
  last_heartbeat_at: new Date().toISOString(),
  last_scan_at: new Date().toISOString(),
  enrolled_by: 'CREATIVE-ADMIN-MASTER',
  active_jobs_count: 0,
  os: 'Windows 11 Pro 64-bit (13th Gen i9, RTX 4090, 64GB DDR5)',
  workstation_storage_free_gb: 482.4
};

// Pure clean state - NO MOCK ITEMS
export const INITIAL_WORKFLOW_ITEMS = [];
export const INITIAL_NOTIFICATIONS = [];
export const INITIAL_EVENTS = [];

// Default Ecosystem Users from master Anything session
export const DEFAULT_ECOSYSTEM_USER = {
  id: 'CREATIVE-ADMIN-MASTER',
  name: 'Master Architect',
  email: 'admin@anything.local',
  username: 'admin',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  provider: 'anything'
};

export const INITIAL_USERS = [
  DEFAULT_ECOSYSTEM_USER,
  {
    id: 'user_editor_zaid',
    name: 'Zaid Editor',
    email: 'zaid@anything.local',
    username: 'zaid_cuts',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    provider: 'anything'
  }
];
