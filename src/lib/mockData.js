// AnyShare Ecosystem Data & Stage Models (Zero mock items)

export const STAGE_CONFIG = {
  pending_edit_1: {
    label: 'Pending Edit 1',
    shortLabel: 'Pending E1',
    color: 'slate',
    border: 'border-slate-500/30',
    bg: 'bg-slate-500/10',
    text: 'text-slate-300',
    dot: 'bg-slate-400',
    icon: 'Clock'
  },
  edit_1: {
    label: 'Edit 1',
    shortLabel: 'Edit 1',
    color: 'sky',
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/10',
    text: 'text-sky-300',
    dot: 'bg-sky-400',
    icon: 'FileEdit'
  },
  pending_edit_2: {
    label: 'Pending Edit 2',
    shortLabel: 'Pending E2',
    color: 'blue',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    dot: 'bg-blue-400',
    icon: 'Layers'
  },
  edit_2: {
    label: 'Edit 2',
    shortLabel: 'Edit 2',
    color: 'cyan',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-300',
    dot: 'bg-cyan-400',
    icon: 'Sliders'
  },
  ready_to_render: {
    label: 'Ready to Render',
    shortLabel: 'Ready',
    color: 'indigo',
    border: 'border-indigo-500/40',
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-300',
    dot: 'bg-indigo-400',
    icon: 'Zap'
  },
  render_requested: {
    label: 'Render Requested',
    shortLabel: 'Requested',
    color: 'purple',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/15',
    text: 'text-purple-300',
    dot: 'bg-purple-400',
    icon: 'Send'
  },
  checking: {
    label: 'Checking Preflight',
    shortLabel: 'Checking',
    color: 'amber',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    icon: 'ShieldAlert'
  },
  rendering: {
    label: 'Rendering',
    shortLabel: 'Rendering',
    color: 'amber',
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/20',
    text: 'text-amber-300',
    dot: 'bg-amber-400 animate-pulse',
    icon: 'Cpu'
  },
  rendered: {
    label: 'Rendered',
    shortLabel: 'Rendered',
    color: 'teal',
    border: 'border-teal-500/40',
    bg: 'bg-teal-500/15',
    text: 'text-teal-300',
    dot: 'bg-teal-400',
    icon: 'CheckCircle2'
  },
  pending_upload: {
    label: 'Pending Upload',
    shortLabel: 'To Upload',
    color: 'blue',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    dot: 'bg-blue-400',
    icon: 'UploadCloud'
  },
  uploaded: {
    label: 'Uploaded',
    shortLabel: 'Uploaded',
    color: 'emerald',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
    icon: 'CheckCheck'
  },
  given_to_jamey: {
    label: 'Given to Jamey',
    shortLabel: 'To Jamey',
    color: 'emerald',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
    icon: 'UserCheck'
  },
  done: {
    label: 'Done',
    shortLabel: 'Done',
    color: 'emerald',
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-200',
    dot: 'bg-emerald-400',
    icon: 'Sparkles'
  },
  correction_needed: {
    label: 'Correction Needed',
    shortLabel: 'Needs Review',
    color: 'rose',
    border: 'border-rose-500/50',
    bg: 'bg-rose-500/15',
    text: 'text-rose-300',
    dot: 'bg-rose-400 animate-ping',
    icon: 'AlertTriangle'
  },
  failed: {
    label: 'Failed',
    shortLabel: 'Failed',
    color: 'rose',
    border: 'border-rose-500/40',
    bg: 'bg-rose-500/15',
    text: 'text-rose-300',
    dot: 'bg-rose-500',
    icon: 'XCircle'
  },
  cancelled: {
    label: 'Cancelled',
    shortLabel: 'Cancelled',
    color: 'slate',
    border: 'border-slate-500/30',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    dot: 'bg-slate-500',
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

// Pure empty initial state - NO MOCK ITEMS
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
