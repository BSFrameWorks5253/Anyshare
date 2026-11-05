// AnyShare Studio Models & Realtime Pipeline Configurations

// 3 Unified Executive Pipeline Milestones (Streamlined from 14 micro-stages for clean executive clarity)
export const PIPELINE_MILESTONES = [
  {
    key: 'editing',
    title: 'In Production & Editing',
    shortTitle: '1. Production',
    description: 'Assembly, Fine Cut & Preflight',
    stepNumber: '01',
    icon: 'FileEdit',
    statuses: ['pending_edit_1', 'edit_1', 'pending_edit_2', 'edit_2', 'ready_to_render'],
    color: 'neutral',
    badgeClass: 'bg-neutral-100 text-neutral-950 font-bold border border-neutral-300'
  },
  {
    key: 'rendering',
    title: 'GPU Workstation Node',
    shortTitle: '2. Rendering',
    description: 'Hardware Accelerated 4K Encoding',
    stepNumber: '02',
    icon: 'Cpu',
    statuses: ['render_requested', 'checking', 'rendering'],
    color: 'emerald',
    badgeClass: 'bg-neutral-950 text-white font-bold border border-neutral-800 shadow-2xs'
  },
  {
    key: 'delivered',
    title: 'QA Review & Delivered',
    shortTitle: '3. Delivered',
    description: 'Output Verified, Uploaded & Archived',
    stepNumber: '03',
    icon: 'Sparkles',
    statuses: ['rendered', 'correction_needed', 'pending_upload', 'uploaded', 'given_to_jamey', 'done', 'cancelled'],
    color: 'slate',
    badgeClass: 'bg-neutral-100 text-neutral-800 font-bold border border-neutral-300'
  }
];

export function getMilestoneForStatus(status) {
  return PIPELINE_MILESTONES.find(m => m.statuses.includes(status)) || PIPELINE_MILESTONES[0];
}

export const STAGE_CONFIG = {
  pending_edit_1: {
    label: 'Pending Edit 1',
    shortLabel: 'Pending E1',
    color: 'slate',
    border: 'border-neutral-300',
    bg: 'bg-neutral-100',
    text: 'text-neutral-900 font-bold',
    dot: 'bg-neutral-500',
    icon: 'Clock'
  },
  edit_1: {
    label: 'Edit 1',
    shortLabel: 'Edit 1',
    color: 'sky',
    border: 'border-sky-300',
    bg: 'bg-sky-50',
    text: 'text-sky-950 font-bold',
    dot: 'bg-sky-600',
    icon: 'FileEdit'
  },
  pending_edit_2: {
    label: 'Pending Edit 2',
    shortLabel: 'Pending E2',
    color: 'slate',
    border: 'border-neutral-300',
    bg: 'bg-neutral-100',
    text: 'text-neutral-900 font-bold',
    dot: 'bg-neutral-500',
    icon: 'Layers'
  },
  edit_2: {
    label: 'Edit 2',
    shortLabel: 'Edit 2',
    color: 'cyan',
    border: 'border-cyan-300',
    bg: 'bg-cyan-50',
    text: 'text-cyan-950 font-bold',
    dot: 'bg-cyan-600',
    icon: 'Sliders'
  },
  ready_to_render: {
    label: 'Ready to Render',
    shortLabel: 'Ready',
    color: 'neutral',
    border: 'border-neutral-900',
    bg: 'bg-neutral-900',
    text: 'text-white font-bold',
    dot: 'bg-emerald-400',
    icon: 'Zap'
  },
  render_requested: {
    label: 'Render Requested',
    shortLabel: 'Requested',
    color: 'neutral',
    border: 'border-neutral-300',
    bg: 'bg-neutral-100',
    text: 'text-neutral-900 font-bold',
    dot: 'bg-neutral-600',
    icon: 'Send'
  },
  checking: {
    label: 'Checking Preflight',
    shortLabel: 'Checking',
    color: 'neutral',
    border: 'border-neutral-300',
    bg: 'bg-neutral-100',
    text: 'text-neutral-900 font-bold',
    dot: 'bg-neutral-600 animate-pulse',
    icon: 'ShieldAlert'
  },
  rendering: {
    label: 'Rendering',
    shortLabel: 'Rendering',
    color: 'emerald',
    border: 'border-emerald-300',
    bg: 'bg-emerald-50',
    text: 'text-emerald-950 font-bold',
    dot: 'bg-emerald-600 animate-pulse',
    icon: 'Cpu'
  },
  rendered: {
    label: 'Rendered',
    shortLabel: 'Rendered',
    color: 'emerald',
    border: 'border-emerald-300',
    bg: 'bg-emerald-50',
    text: 'text-emerald-950 font-bold',
    dot: 'bg-emerald-600',
    icon: 'CheckCircle2'
  },
  pending_upload: {
    label: 'Pending Upload',
    shortLabel: 'To Upload',
    color: 'slate',
    border: 'border-neutral-300',
    bg: 'bg-neutral-100',
    text: 'text-neutral-900 font-bold',
    dot: 'bg-neutral-500',
    icon: 'UploadCloud'
  },
  uploaded: {
    label: 'Uploaded',
    shortLabel: 'Uploaded',
    color: 'emerald',
    border: 'border-emerald-400',
    bg: 'bg-emerald-100',
    text: 'text-emerald-950 font-black',
    dot: 'bg-emerald-600',
    icon: 'CheckCheck'
  },
  given_to_jamey: {
    label: 'Given to Jamey',
    shortLabel: 'To Jamey',
    color: 'emerald',
    border: 'border-emerald-400',
    bg: 'bg-emerald-100',
    text: 'text-emerald-950 font-black',
    dot: 'bg-emerald-600',
    icon: 'UserCheck'
  },
  done: {
    label: 'Done',
    shortLabel: 'Done',
    color: 'emerald',
    border: 'border-emerald-400',
    bg: 'bg-emerald-100',
    text: 'text-emerald-950 font-black',
    dot: 'bg-emerald-600',
    icon: 'Sparkles'
  },
  correction_needed: {
    label: 'Correction Needed',
    shortLabel: 'Needs Review',
    color: 'rose',
    border: 'border-rose-400',
    bg: 'bg-rose-100',
    text: 'text-rose-950 font-black',
    dot: 'bg-rose-600 animate-ping',
    icon: 'AlertTriangle'
  },
  failed: {
    label: 'Failed',
    shortLabel: 'Failed',
    color: 'rose',
    border: 'border-rose-400',
    bg: 'bg-rose-100',
    text: 'text-rose-950 font-black',
    dot: 'bg-rose-600',
    icon: 'XCircle'
  },
  cancelled: {
    label: 'Cancelled',
    shortLabel: 'Cancelled',
    color: 'stone',
    border: 'border-stone-400',
    bg: 'bg-neutral-200',
    text: 'text-neutral-900 font-black',
    dot: 'bg-neutral-500',
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

// Authentic Production Workflow Items & Pipeline Tasks
export const INITIAL_WORKFLOW_ITEMS = [
  {
    id: 'item_safar_1448_day_01',
    external_key: 'safar_1448_day_01_mumbai',
    display_label: 'Safar 1448 - Day 01 Mumbai (Istefada Ilmiyah)',
    assigned_user_id: 'CREATIVE-ADMIN-MASTER',
    status: 'ready_to_render',
    status_source: 'onetap_detected',
    rule_id: 'onetap_rule_canonical_v2',
    rule_version: '2.4.1',
    last_scanned_at: new Date().toISOString(),
    is_stale: false,
    done_at: null,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    evidence_summary: {
      matched_folders: [
        '01_Raw_Footage',
        '02_Audio',
        '03_Project_Files',
        '04_Render_Queue',
        '05_Outputs'
      ],
      project_file: 'safar_1448_day_01_mumbai.prproj',
      project_mtime: new Date().toISOString(),
      raw_clips_count: 48,
      audio_sync_passed: true,
      target_preset: 'Match Source - High Bitrate (4K H.264)',
      render_progress: 0,
      preflight_results: {
        checks: [
          { id: 'folder_structure', name: 'Folder Structure Compliance', passed: true, detail: 'Canonical directories verified (01_Raw, 02_Audio, 03_Project_Files, 04_Render_Queue)' },
          { id: 'prproj_health', name: 'Premiere Pro Project File', passed: true, detail: 'Lockfile cleared, assets linked' },
          { id: 'audio_alignment', name: 'Audio Sync Verification', passed: true, detail: '32-bit float audio waveforms matched with zero drift' },
          { id: 'disk_space', name: 'Workstation Storage Space', passed: true, detail: '482 GB available on high-speed NVMe scratch disk' }
        ]
      }
    }
  },
  {
    id: 'item_safar_1448_day_02',
    external_key: 'safar_1448_day_02_mumbai',
    display_label: 'Safar 1448 - Day 02 Mumbai (Majlis Mubarak)',
    assigned_user_id: 'user_editor_zaid',
    status: 'edit_1',
    status_source: 'onetap_detected',
    rule_id: 'onetap_rule_canonical_v2',
    rule_version: '2.4.1',
    last_scanned_at: new Date().toISOString(),
    is_stale: false,
    done_at: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    evidence_summary: {
      matched_folders: [
        '01_Raw_Footage',
        '02_Audio',
        '03_Project_Files',
        '04_Render_Queue'
      ],
      project_file: 'safar_1448_day_02_mumbai.prproj',
      project_mtime: new Date().toISOString(),
      raw_clips_count: 56,
      audio_sync_passed: true,
      target_preset: 'YouTube 4K UHD 59.94fps Master',
      render_progress: 0,
      preflight_results: {
        checks: [
          { id: 'folder_structure', name: 'Folder Structure Compliance', passed: true, detail: 'Canonical directories verified' },
          { id: 'prproj_health', name: 'Premiere Pro Project File', passed: true, detail: 'Active editing session' },
          { id: 'audio_alignment', name: 'Audio Sync Verification', passed: true, detail: '32-bit audio synchronized' },
          { id: 'disk_space', name: 'Workstation Storage Space', passed: true, detail: '482 GB available' }
        ]
      }
    }
  },
  {
    id: 'item_safar_1448_day_03',
    external_key: 'safar_1448_day_03_mumbai',
    display_label: 'Safar 1448 - Day 03 Mumbai (Ziyarat & Wasila)',
    assigned_user_id: 'CREATIVE-ADMIN-MASTER',
    status: 'edit_2',
    status_source: 'onetap_detected',
    rule_id: 'onetap_rule_canonical_v2',
    rule_version: '2.4.1',
    last_scanned_at: new Date().toISOString(),
    is_stale: false,
    done_at: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    evidence_summary: {
      matched_folders: [
        '01_Raw_Footage',
        '02_Audio',
        '03_Project_Files',
        '04_Render_Queue'
      ],
      project_file: 'safar_1448_day_03_mumbai.prproj',
      project_mtime: new Date().toISOString(),
      raw_clips_count: 62,
      audio_sync_passed: true,
      target_preset: 'Match Source - High Bitrate (4K H.264)',
      render_progress: 0,
      preflight_results: {
        checks: [
          { id: 'folder_structure', name: 'Folder Structure Compliance', passed: true, detail: 'Canonical directories verified' },
          { id: 'prproj_health', name: 'Premiere Pro Project File', passed: true, detail: 'Color grading and audio pass complete' },
          { id: 'audio_alignment', name: 'Audio Sync Verification', passed: true, detail: 'Synchronized with zero phase errors' },
          { id: 'disk_space', name: 'Workstation Storage Space', passed: true, detail: '482 GB available' }
        ]
      }
    }
  },
  {
    id: 'item_safar_1448_day_04',
    external_key: 'safar_1448_day_04_mumbai',
    display_label: 'Safar 1448 - Day 04 Mumbai (Khatam Majlis)',
    assigned_user_id: 'CREATIVE-ADMIN-MASTER',
    status: 'ready_to_render',
    status_source: 'onetap_detected',
    rule_id: 'onetap_rule_canonical_v2',
    rule_version: '2.4.1',
    last_scanned_at: new Date().toISOString(),
    is_stale: false,
    done_at: null,
    created_at: new Date(Date.now() - 43200000).toISOString(),
    updated_at: new Date().toISOString(),
    evidence_summary: {
      matched_folders: [
        '01_Raw_Footage',
        '02_Audio',
        '03_Project_Files',
        '04_Render_Queue',
        '05_Outputs'
      ],
      project_file: 'safar_1448_day_04_mumbai.prproj',
      project_mtime: new Date().toISOString(),
      raw_clips_count: 38,
      audio_sync_passed: true,
      target_preset: 'Match Source - High Bitrate (4K H.264)',
      render_progress: 0,
      preflight_results: {
        checks: [
          { id: 'folder_structure', name: 'Folder Structure Compliance', passed: true, detail: 'Canonical directories verified' },
          { id: 'prproj_health', name: 'Premiere Pro Project File', passed: true, detail: 'Lockfile cleared, ready for GPU render' },
          { id: 'audio_alignment', name: 'Audio Sync Verification', passed: true, detail: '32-bit audio synchronized' },
          { id: 'disk_space', name: 'Workstation Storage Space', passed: true, detail: '482 GB available' }
        ]
      }
    }
  },
  {
    id: 'item_safar_1448_day_05',
    external_key: 'safar_1448_day_05_mumbai',
    display_label: 'Safar 1448 - Day 05 Mumbai (Farewell Gathering)',
    assigned_user_id: 'user_editor_zaid',
    status: 'pending_edit_1',
    status_source: 'onetap_detected',
    rule_id: 'onetap_rule_canonical_v2',
    rule_version: '2.4.1',
    last_scanned_at: new Date().toISOString(),
    is_stale: false,
    done_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    evidence_summary: {
      matched_folders: [
        '01_Raw_Footage',
        '02_Audio'
      ],
      project_file: 'safar_1448_day_05_mumbai.prproj',
      project_mtime: new Date().toISOString(),
      raw_clips_count: 44,
      audio_sync_passed: true,
      target_preset: 'Match Source - High Bitrate (4K H.264)',
      render_progress: 0,
      preflight_results: {
        checks: [
          { id: 'folder_structure', name: 'Folder Structure Compliance', passed: true, detail: 'Raw footage and audio ingested' },
          { id: 'prproj_health', name: 'Premiere Pro Project File', passed: true, detail: 'Timeline pending assembly' },
          { id: 'audio_alignment', name: 'Audio Sync Verification', passed: true, detail: 'Audio sync pending' },
          { id: 'disk_space', name: 'Workstation Storage Space', passed: true, detail: '482 GB available' }
        ]
      }
    }
  },
  {
    id: 'item_safar_titles_master',
    external_key: 'safar_1448_mumbai_master_titles',
    display_label: 'Safar 1448 Mumbai - Master Intro Titles & Lower Thirds',
    assigned_user_id: 'CREATIVE-ADMIN-MASTER',
    status: 'rendered',
    status_source: 'onetap_detected',
    rule_id: 'onetap_rule_canonical_v2',
    rule_version: '2.4.1',
    last_scanned_at: new Date().toISOString(),
    is_stale: false,
    done_at: new Date(Date.now() - 7200000).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
    evidence_summary: {
      matched_folders: [
        '01_Raw_Footage',
        '02_Audio',
        '03_Project_Files',
        '04_Render_Queue',
        '05_Outputs'
      ],
      project_file: 'safar_1448_mumbai_master_titles.prproj',
      project_mtime: new Date().toISOString(),
      raw_clips_count: 16,
      audio_sync_passed: true,
      target_preset: 'Apple ProRes 422 HQ / 4K Master',
      render_progress: 100,
      rendered_file: '05_Outputs/safar_1448_mumbai_master_titles_4K.mp4',
      checksum: 'sha256-verified-master-a1b2c3d4e5f6',
      verified_at: new Date(Date.now() - 7200000).toISOString(),
      preflight_results: {
        checks: [
          { id: 'folder_structure', name: 'Folder Structure Compliance', passed: true, detail: 'Canonical directories verified' },
          { id: 'prproj_health', name: 'Premiere Pro Project File', passed: true, detail: 'Render verified complete' },
          { id: 'audio_alignment', name: 'Audio Sync Verification', passed: true, detail: 'Master output audio lossless' },
          { id: 'disk_space', name: 'Workstation Storage Space', passed: true, detail: 'Output saved to scratch storage' }
        ]
      }
    }
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_welcome_01',
    recipient_user_id: 'CREATIVE-ADMIN-MASTER',
    item_id: 'item_safar_1448_day_01',
    kind: 'assigned',
    title: 'Ready for GPU Render',
    message: 'Safar 1448 - Day 01 Mumbai has passed preflight and is ready for 1-Tap render.',
    delivery_state: 'supabase_live',
    read_at: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'notif_welcome_02',
    recipient_user_id: 'CREATIVE-ADMIN-MASTER',
    item_id: 'item_safar_titles_master',
    kind: 'render_finished',
    title: 'Master Titles Rendered',
    message: 'Master Intro Titles & Lower Thirds verified in 05_Outputs with SHA-256 checksum.',
    delivery_state: 'supabase_live',
    read_at: null,
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

export const INITIAL_EVENTS = [
  {
    id: 'evt_init_01',
    item_id: 'item_safar_titles_master',
    event_type: 'render_finished',
    old_status: 'rendering',
    new_status: 'rendered',
    actor_user_id: 'CREATIVE-ADMIN-MASTER',
    source: 'onetap',
    reason: 'Hardware GPU render completed and verified with SHA-256 master file hash.',
    evidence_summary: { rendered_file: '05_Outputs/safar_1448_mumbai_master_titles_4K.mp4' },
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'evt_init_02',
    item_id: 'item_safar_1448_day_01',
    event_type: 'detected',
    old_status: 'edit_2',
    new_status: 'ready_to_render',
    actor_user_id: 'CREATIVE-ADMIN-MASTER',
    source: 'onetap',
    reason: 'Preflight validation passed: 48 clips verified, audio in-phase, lockfile cleared.',
    evidence_summary: { clips: 48 },
    created_at: new Date(Date.now() - 14400000).toISOString()
  }
];

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

// 6-Stage Web Task Tracker Progress Stepper Config (PRD Section 4.3)
export const TRACKER_STAGE_CONFIG = {
  editing_pending: {
    key: 'editing_pending',
    label: 'Editing Pending',
    shortLabel: 'Pending',
    stepNumber: 1,
    color: 'slate',
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
    dot: 'bg-slate-500',
    description: 'Raw media ingested, awaiting edit assembly'
  },
  editing: {
    key: 'editing',
    label: 'In Progress (Editing)',
    shortLabel: 'Editing',
    stepNumber: 2,
    color: 'blue',
    badge: 'bg-sky-50 text-sky-800 border-sky-300',
    dot: 'bg-sky-500',
    description: 'Timeline active in Premiere / MediaFlow'
  },
  review: {
    key: 'review',
    label: 'QA Review',
    shortLabel: 'Review',
    stepNumber: 3,
    color: 'purple',
    badge: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    dot: 'bg-indigo-500',
    description: 'Editorial cuts under admin inspection'
  },
  upload_pending: {
    key: 'upload_pending',
    label: 'Upload Pending',
    shortLabel: 'Render Done',
    stepNumber: 4,
    color: 'cyan',
    badge: 'bg-cyan-50 text-cyan-800 border-cyan-300',
    dot: 'bg-cyan-500 animate-pulse',
    description: 'Batch render completed on workstation; pending NAS upload'
  },
  uploaded: {
    key: 'uploaded',
    label: 'Uploaded to Vault',
    shortLabel: 'Uploaded',
    stepNumber: 5,
    color: 'emerald',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-500',
    description: 'Verified 4K master on central storage'
  },
  submitted: {
    key: 'submitted',
    label: 'Submitted to AlJamea',
    shortLabel: 'Submitted',
    stepNumber: 6,
    color: 'green',
    badge: 'bg-emerald-600 text-white border-emerald-700',
    dot: 'bg-white',
    description: 'Signed off and archived in official repository'
  }
};

// Safar Campaigns, Upload Dates Matrix & User Approval Requests
export const INITIAL_SAFAR_CAMPAIGNS = [
  {
    id: 'safar_1448_colombo',
    safarName: 'Safar 1448 — Colombo',
    name: 'Safar 1448 — Colombo',
    hijriYear: '1448 H',
    city: 'Colombo',
    serialNumber: 'SN-1448-01',
    driveRoot: 'F:\\',
    venue: 'Bambalapitiya Burhani Complex',
    baseDirectory: 'F:\\SAFAR_WORKSPACE\\Safar_1448_Colombo',
    serverDestination: '//aljamea-nas.local/Central_Vault/1448_Colombo',
    totalDays: 10,
    is_archived: false,
    is_safar_done: false,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    created_by: 'admin',
    dates: [
      {
        id: 'safar_1448_col_d01',
        dayNumber: 1,
        dateLabel: '1448-03-01',
        dateFolder: '1448-03-01_Video_01',
        hijriDate: '1 Safar al-Muzaffar 1448',
        title: 'Iftetah Majlis Mubarak & Istefada Opening',
        assignedEditor: 'admin',
        status: 'submitted',
        uploaded_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        uploaded_by: 'admin',
        file_size_gb: 46.2,
        server_path: 'F:/SAFAR_WORKSPACE/Safar_1448_Colombo/1448-03-01_Video_01/Master.mov'
      },
      {
        id: 'safar_1448_col_d02',
        dayNumber: 2,
        dateLabel: '1448-03-02',
        dateFolder: '1448-03-02_Video_02',
        hijriDate: '2 Safar al-Muzaffar 1448',
        title: 'Majlis 2 — Falsafat al-Taleem',
        assignedEditor: 'zaid_cuts',
        status: 'uploaded',
        uploaded_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        uploaded_by: 'admin',
        file_size_gb: 43.8,
        server_path: 'F:/SAFAR_WORKSPACE/Safar_1448_Colombo/1448-03-02_Video_02/Master.mov'
      },
      {
        id: 'safar_1448_col_d03',
        dayNumber: 3,
        dateLabel: '1448-03-03',
        dateFolder: '1448-03-03_Video_03',
        hijriDate: '3 Safar al-Muzaffar 1448',
        title: 'Majlis 3 — Hikmat & Adab',
        assignedEditor: 'zaid_cuts',
        status: 'upload_pending',
        uploaded_at: null,
        uploaded_by: null,
        file_size_gb: 41.5,
        server_path: null
      },
      {
        id: 'safar_1448_col_d04',
        dayNumber: 4,
        dateLabel: '1448-03-04',
        dateFolder: '1448-03-04_Video_04',
        hijriDate: '4 Safar al-Muzaffar 1448',
        title: 'Majlis 4 — Tareekh & Seerat',
        assignedEditor: 'zaid_cuts',
        status: 'review',
        uploaded_at: null,
        uploaded_by: null,
        file_size_gb: 44.0,
        server_path: null
      },
      {
        id: 'safar_1448_col_d05',
        dayNumber: 5,
        dateLabel: '1448-03-05',
        dateFolder: '1448-03-05_Video_05',
        hijriDate: '5 Safar al-Muzaffar 1448',
        title: 'Majlis 5 — Al-Fiqh al-Islami',
        assignedEditor: 'admin',
        status: 'editing',
        uploaded_at: null,
        uploaded_by: null,
        file_size_gb: 48.0,
        server_path: null
      },
      {
        id: 'safar_1448_col_d06',
        dayNumber: 6,
        dateLabel: '1448-03-06',
        dateFolder: '1448-03-06_Video_06',
        hijriDate: '6 Safar al-Muzaffar 1448',
        title: 'Majlis 6 — Akhlaaq & Tarbiyat',
        assignedEditor: 'zaid_cuts',
        status: 'editing_pending',
        uploaded_at: null,
        uploaded_by: null,
        file_size_gb: 42.0,
        server_path: null
      },
      {
        id: 'safar_1448_col_d07',
        dayNumber: 7,
        dateLabel: '1448-03-07',
        dateFolder: '1448-03-07_Video_07',
        hijriDate: '7 Safar al-Muzaffar 1448',
        title: 'Majlis 7 — Shahaadat Imam Husain (AS) Zikr',
        assignedEditor: 'admin',
        status: 'editing_pending',
        uploaded_at: null,
        uploaded_by: null,
        file_size_gb: 52.0,
        server_path: null
      },
      {
        id: 'safar_1448_col_d08',
        dayNumber: 8,
        dateLabel: '1448-03-08',
        dateFolder: '1448-03-08_Video_08',
        hijriDate: '8 Safar al-Muzaffar 1448',
        title: 'Majlis 8 — Masaeb & Matam',
        assignedEditor: 'zaid_cuts',
        status: 'editing_pending',
        uploaded_at: null,
        uploaded_by: null,
        file_size_gb: 49.0,
        server_path: null
      },
      {
        id: 'safar_1448_col_d09',
        dayNumber: 9,
        dateLabel: '1448-03-09',
        dateFolder: '1448-03-09_Video_09',
        hijriDate: '9 Safar al-Muzaffar 1448',
        title: 'Majlis 9 — Shab-e-Ashura Majlis',
        assignedEditor: 'admin',
        status: 'editing_pending',
        uploaded_at: null,
        uploaded_by: null,
        file_size_gb: 55.0,
        server_path: null
      },
      {
        id: 'safar_1448_col_d10',
        dayNumber: 10,
        dateLabel: '1448-03-10',
        dateFolder: '1448-03-10_Video_10',
        hijriDate: '10 Safar al-Muzaffar 1448',
        title: 'Majlis 10 — Chehlum Imam Husain (AS)',
        assignedEditor: 'admin',
        status: 'editing_pending',
        uploaded_at: null,
        uploaded_by: null,
        file_size_gb: 60.0,
        server_path: null
      }
    ]
  },
  {
    id: 'safar_1448_mumbai',
    safarName: 'Safar 1448 — Mumbai',
    name: 'Safar 1448 — Mumbai',
    hijriYear: '1448 H',
    city: 'Mumbai',
    serialNumber: 'SN-1448-02',
    driveRoot: 'E:\\',
    venue: 'Aljamea-tus-Saifiyah Complex',
    baseDirectory: 'E:\\DATAFLOW_WORKSPACE\\Safar_1448_Mumbai',
    serverDestination: '//aljamea-nas.local/Central_Vault/1448_Mumbai',
    totalDays: 10,
    is_archived: false,
    is_safar_done: false,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    created_by: 'admin',
    dates: [
      {
        id: 'safar_1448_mumbai_d01',
        dayNumber: 1,
        dateLabel: '1448-02-01',
        dateFolder: '1448-02-01_01M',
        hijriDate: '1 Safar al-Muzaffar 1448',
        title: 'Iftetah Majlis Mubarak & Istefada Opening',
        assignedEditor: 'admin',
        status: 'submitted',
        uploaded_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        uploaded_by: 'admin',
        file_size_gb: 42.4,
        server_path: 'Main Data/Safar_1448_Mumbai/1448-02-01_01M/Master_ProRes.mov'
      },
      {
        id: 'safar_1448_mumbai_d02',
        dayNumber: 2,
        dateLabel: '1448-02-02',
        dateFolder: '1448-02-02_02M',
        hijriDate: '2 Safar al-Muzaffar 1448',
        title: 'Majlis 2 — Falsafat al-Taleem',
        assignedEditor: 'zaid_cuts',
        status: 'uploaded',
        uploaded_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        uploaded_by: 'admin',
        file_size_gb: 38.6,
        server_path: 'Main Data/Safar_1448_Mumbai/1448-02-02_02M/Master_ProRes.mov'
      },
      {
        id: 'safar_1448_mumbai_d03',
        dayNumber: 3,
        dateLabel: '1448-02-03',
        dateFolder: '1448-02-03_03M',
        hijriDate: '3 Safar al-Muzaffar 1448',
        title: 'Majlis 3 — Hikmat & Adab',
        assignedEditor: 'zaid_cuts',
        status: 'uploaded',
        uploaded_at: new Date(Date.now() - 86400000).toISOString(),
        uploaded_by: 'admin',
        file_size_gb: 41.2,
        server_path: 'Main Data/Safar_1448_Mumbai/1448-02-03_03M/Master_ProRes.mov'
      },
      {
        id: 'safar_1448_mumbai_d04',
        dayNumber: 4,
        dateLabel: '1448-02-04',
        dateFolder: '1448-02-04_04M',
        hijriDate: '4 Safar al-Muzaffar 1448',
        title: 'Majlis 4 — Tareekh & Seerat',
        assignedEditor: 'zaid_cuts',
        status: 'upload_pending',
        uploaded_at: null,
        uploaded_by: null,
        file_size_gb: 36.8,
        server_path: null
      },
      {
        id: 'safar_1448_mumbai_d05',
        dayNumber: 5,
        dateLabel: '1448-02-05',
        dateFolder: '1448-02-05_05M',
        hijriDate: '5 Safar al-Muzaffar 1448',
        title: 'Majlis 5 — Al-Fiqh al-Islami',
        assignedEditor: 'admin',
        status: 'review',
        uploaded_at: null,
        uploaded_by: null,
        file_size_gb: 39.5,
        server_path: null
      },
      {
        id: 'safar_1448_mumbai_d06',
        dayNumber: 6,
        dateLabel: '1448-02-06',
        dateFolder: '1448-02-06_06M',
        hijriDate: '6 Safar al-Muzaffar 1448',
        title: 'Majlis 6 — Akhlaaq & Tarbiyat',
        assignedEditor: 'zaid_cuts',
        status: 'editing',
        uploaded_at: null,
        uploaded_by: null,
        file_size_gb: 44.1,
        server_path: null
      },
      {
        id: 'safar_1448_mumbai_d07',
        dayNumber: 7,
        dateLabel: '1448-02-07',
        dateFolder: '1448-02-07_07M',
        hijriDate: '7 Safar al-Muzaffar 1448',
        title: 'Majlis 7 — Shahaadat Imam Husain (AS) Zikr',
        assignedEditor: 'admin',
        status: 'editing_pending',
        uploaded_at: null,
        uploaded_by: null,
        file_size_gb: 51.0,
        server_path: null
      },
      {
        id: 'safar_1448_mumbai_d08',
        dayNumber: 8,
        dateLabel: '1448-02-08',
        dateFolder: '1448-02-08_08M',
        hijriDate: '8 Safar al-Muzaffar 1448',
        title: 'Majlis 8 — Masaeb & Matam',
        assignedEditor: 'zaid_cuts',
        status: 'editing_pending',
        uploaded_at: null,
        uploaded_by: null,
        file_size_gb: 47.3,
        server_path: null
      },
      {
        id: 'safar_1448_mumbai_d09',
        dayNumber: 9,
        dateLabel: '1448-02-09',
        dateFolder: '1448-02-09_09M',
        hijriDate: '9 Safar al-Muzaffar 1448',
        title: 'Majlis 9 — Shab-e-Ashura Majlis',
        assignedEditor: 'admin',
        status: 'editing_pending',
        uploaded_at: null,
        uploaded_by: null,
        file_size_gb: 58.2,
        server_path: null
      },
      {
        id: 'safar_1448_mumbai_d10',
        dayNumber: 10,
        dateLabel: '1448-02-10',
        dateFolder: '1448-02-10_10M',
        hijriDate: '10 Safar al-Muzaffar 1448',
        title: 'Majlis 10 — Chehlum Imam Husain (AS)',
        assignedEditor: 'admin',
        status: 'editing_pending',
        uploaded_at: null,
        uploaded_by: null,
        file_size_gb: 62.0,
        server_path: null
      }
    ]
  },
  {
    id: 'safar_1447_daressalaam',
    safarName: 'Safar 1447 — Dar es Salaam',
    name: 'Safar 1447 — Dar es Salaam',
    hijriYear: '1447 H',
    city: 'Dar es Salaam',
    serialNumber: 'SN-1447-01',
    driveRoot: 'D:\\',
    venue: 'Saifee Masjid & Jamea Campus',
    baseDirectory: 'D:\\ARCHIVE_DELIVERIES\\Safar_1447_Dar',
    serverDestination: '//aljamea-nas.local/Central_Vault/1447_Dar',
    totalDays: 10,
    is_archived: true,
    is_safar_done: true,
    created_at: new Date(Date.now() - 86400000 * 365).toISOString(),
    created_by: 'admin',
    dates: Array.from({ length: 10 }, (_, i) => ({
      id: `safar_1447_dar_d0${i + 1}`,
      dayNumber: i + 1,
      dateLabel: `1447-02-0${i + 1}`,
      dateFolder: `1447-02-0${i + 1}_Dar_0${i + 1}`,
      hijriDate: `${i + 1} Safar al-Muzaffar 1447`,
      title: `Safar 1447 Dar Day ${i + 1} Master Cut`,
      assignedEditor: i % 2 === 0 ? 'admin' : 'zaid_cuts',
      status: 'submitted',
      uploaded_at: new Date(Date.now() - 86400000 * (365 - i)).toISOString(),
      uploaded_by: 'admin',
      file_size_gb: 39.5,
      server_path: `Main Data/Safar_1447_Dar/Day_${i + 1}/Master.mp4`
    }))
  }
];

export const INITIAL_SAFAR_REQUESTS = [
  {
    id: 'req_01',
    safarId: 'safar_1448_mumbai',
    dayNumber: 4,
    requestedBy: 'zaid_cuts',
    requestedByName: 'Zaid Editor',
    type: 'mark_uploaded',
    notes: 'Master 4K ProRes 422 export completed and copied to MediaFlow upload structure (04M). Ready for official server confirmation.',
    serverPathProposed: '//aljamea-nas.local/Central_Vault/1448_Mumbai/Main Data/1448-02-04_04M',
    fileSizeGb: 36.8,
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  }
];
