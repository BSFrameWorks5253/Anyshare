import React, { useState, useMemo } from 'react';
import { useApp } from '../../lib/store';
import { TRACKER_STAGE_CONFIG } from '../../lib/mockData';
import { sounds } from '../../lib/sound';
import { parseSafarPath } from '../../lib/pathParser';
import OngoingSafarKanban from './OngoingSafarKanban';
import SkeletonLoader from '../common/SkeletonLoader';
import {
  CheckCircle2,
  Clock,
  HardDrive,
  Calendar,
  Search,
  Filter,
  Layers,
  Zap,
  ChevronDown,
  ChevronUp,
  Archive,
  RefreshCw,
  Bell,
  Cpu,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCheck,
  UploadCloud,
  FileCheck2,
  ExternalLink,
  FolderSearch,
  Trash2,
  X,
  PlusCircle,
  FolderGit2,
  Edit3
} from 'lucide-react';

const STAGE_KEYS = [
  'editing_pending',
  'editing',
  'review',
  'upload_pending',
  'uploaded',
  'submitted'
];

export default function TaskTrackerView() {
  const {
    safarCampaigns,
    isAdmin,
    users,
    bridge,
    isLoading,
    isScanning: storeScanning,
    triggerBridgeScan,
    triggerBridgeResetAndRescan,
    removeTrackerDateFolder,
    addTrackerDateFolder,
    detectSafarFromPath,
    clearMockDataAndRescan,
    toggleSafarDone,
    markTaskStatus,
    markAllSafarDatesStatus,
    updateSafarCampaign,
    removeSafarCampaign,
    updateDeliverableEditor,
    desktopPermission,
    requestDesktopNotificationPermission
  } = useApp();

  const [trackerMode, setTrackerMode] = useState('kanban'); // 'kanban' | 'campaigns'
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archived' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrive, setSelectedDrive] = useState('all');
  const [isDetectModalOpen, setIsDetectModalOpen] = useState(false);
  const [localScanning, setLocalScanning] = useState(false);
  const isScanning = localScanning || storeScanning;

  // Folder detection modal inputs
  const [detectFolderInput, setDetectFolderInput] = useState('F:\\Safar_1448_Colombo');
  const [detectSafarName, setDetectSafarName] = useState('Safar 1448 — Colombo');
  const [detectCity, setDetectCity] = useState('Colombo');
  const [detectDaysCount, setDetectDaysCount] = useState(10);
  const [detectDriveRoot, setDetectDriveRoot] = useState('F:\\');

  // Live Path Analysis & Date Auto-Resolution
  const parsedPathInfo = useMemo(() => {
    if (!detectFolderInput) return null;
    return parseSafarPath(detectFolderInput);
  }, [detectFolderInput]);

  const handleFolderInputChange = (val) => {
    setDetectFolderInput(val);
    const parsed = parseSafarPath(val);
    if (parsed) {
      setDetectSafarName(parsed.safarName);
      setDetectCity(parsed.city);
      setDetectDriveRoot(parsed.driveRoot);
      setDetectDaysCount(parsed.totalDays);
    }
  };

  // Safar Edit modal state
  const [editingSafar, setEditingSafar] = useState(null);
  const [editSafarName, setEditSafarName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editHijriYear, setEditHijriYear] = useState('');
  const [editDriveRoot, setEditDriveRoot] = useState('');
  const [editBaseDir, setEditBaseDir] = useState('');
  const [editTotalDays, setEditTotalDays] = useState(10);

  // Safar Delete state
  const [safarToDelete, setSafarToDelete] = useState(null);

  const startEditSafar = (safar) => {
    sounds.playTap();
    setEditingSafar(safar);
    setEditSafarName(safar.safarName || safar.name || '');
    setEditCity(safar.city || '');
    setEditHijriYear(safar.hijriYear || '1448 H');
    setEditDriveRoot(safar.driveRoot || 'F:\\');
    setEditBaseDir(safar.baseDirectory || '');
    setEditTotalDays(safar.totalDays || safar.dates?.length || 10);
  };

  const handleSaveSafarEdit = (e) => {
    e.preventDefault();
    if (!editingSafar || !editSafarName.trim()) return;

    updateSafarCampaign(editingSafar.id, {
      safarName: editSafarName.trim(),
      name: editSafarName.trim(),
      city: editCity.trim(),
      hijriYear: editHijriYear.trim(),
      driveRoot: editDriveRoot.trim().toUpperCase(),
      baseDirectory: editBaseDir.trim(),
      totalDays: parseInt(editTotalDays, 10) || 10
    });

    setEditingSafar(null);
  };

  const handleConfirmDeleteSafar = () => {
    if (!safarToDelete) return;
    removeSafarCampaign(safarToDelete.id);
    setSafarToDelete(null);
  };

  const [expandedSafarIds, setExpandedSafarIds] = useState(() => {
    const set = new Set();
    safarCampaigns.forEach(c => {
      if (!c.is_archived && !c.is_safar_done) set.add(c.id);
    });
    return set;
  });

  const toggleExpand = (safarId) => {
    sounds.playTap();
    setExpandedSafarIds(prev => {
      const next = new Set(prev);
      if (next.has(safarId)) {
        next.delete(safarId);
      } else {
        next.add(safarId);
      }
      return next;
    });
  };

  // Trigger workstation scan with feedback
  const handleScanWorkstation = async () => {
    setLocalScanning(true);
    await triggerBridgeScan();
    setTimeout(() => setLocalScanning(false), 800);
  };

  // Extract unique drive roots
  const driveRoots = useMemo(() => {
    const drives = new Set();
    safarCampaigns.forEach(c => {
      if (c.driveRoot) drives.add(c.driveRoot);
    });
    return Array.from(drives);
  }, [safarCampaigns]);

  // Aggregate Metrics & Deliverable Counts
  const metrics = useMemo(() => {
    let totalDays = 0;
    const stageCounts = {
      editing_pending: 0,
      editing: 0,
      review: 0,
      upload_pending: 0,
      uploaded: 0,
      submitted: 0
    };

    safarCampaigns.forEach(c => {
      (c.dates || []).forEach(d => {
        totalDays++;
        if (stageCounts[d.status] !== undefined) {
          stageCounts[d.status]++;
        } else {
          stageCounts.editing_pending++;
        }
      });
    });

    const completedDeliverables = stageCounts.submitted;
    const progressPercent = totalDays > 0 ? Math.round((completedDeliverables / totalDays) * 100) : 0;

    return {
      totalSafars: safarCampaigns.length,
      totalDays,
      stageCounts,
      completedDeliverables,
      progressPercent
    };
  }, [safarCampaigns]);

  // Filtered Safars based on tab, search, drive
  const filteredSafars = useMemo(() => {
    return safarCampaigns.filter(safar => {
      const isDoneOrArchived = safar.is_archived || safar.is_safar_done;

      if (activeTab === 'active' && isDoneOrArchived) return false;
      if (activeTab === 'archived' && !isDoneOrArchived) return false;

      if (selectedDrive !== 'all' && safar.driveRoot !== selectedDrive) {
        return false;
      }

      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesName = (safar.safarName || safar.name || '').toLowerCase().includes(q);
        const matchesCity = (safar.city || '').toLowerCase().includes(q);
        const matchesSerial = (safar.serialNumber || '').toLowerCase().includes(q);
        const matchesDrive = (safar.driveRoot || '').toLowerCase().includes(q);
        const matchesDate = (safar.dates || []).some(d =>
          (d.dateFolder || '').toLowerCase().includes(q) ||
          (d.dateLabel || '').toLowerCase().includes(q) ||
          (d.title || '').toLowerCase().includes(q)
        );
        if (!matchesName && !matchesCity && !matchesSerial && !matchesDrive && !matchesDate) {
          return false;
        }
      }

      return true;
    });
  }, [safarCampaigns, activeTab, selectedDrive, searchQuery]);

  // Submit detected folder path
  const handleDetectSubmit = (e) => {
    e.preventDefault();
    if (!detectFolderInput) return;
    detectSafarFromPath({
      folderPath: detectFolderInput,
      safarName: detectSafarName,
      city: detectCity,
      totalDays: detectDaysCount,
      driveRoot: detectDriveRoot
    });
    setIsDetectModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. Header Banner & Realtime Status */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 bg-white/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4 fill-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Task Tracker & Workstation Companion
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Nexus Live
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium max-w-2xl">
            Live delivery tracker synced directly with One Tap workstations. Batch render completions auto-advance tasks to Upload Pending.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Workstation Detection Trigger */}
          <button
            type="button"
            disabled={isScanning}
            onClick={handleScanWorkstation}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 cursor-pointer shadow-xs transition-all disabled:opacity-60"
            title="Scan One Tap desktop node for Safar projects & render queues"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Drives...' : 'Scan Drives'}</span>
          </button>

          {/* Reset & Clean Rescan Button */}
          <button
            type="button"
            disabled={isScanning}
            onClick={() => {
              sounds.playTap();
              if (triggerBridgeResetAndRescan) triggerBridgeResetAndRescan();
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all disabled:opacity-60"
            title="Clear phantom records, rescan disk fresh, and deduplicate folders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>Reset & Clean Rescan</span>
          </button>

          {/* Detect Custom Folder / Drive */}
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setIsDetectModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold glass-pill hover:bg-slate-100 text-slate-800 flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-xs"
            title="Register a Safar campaign directory from workstation"
          >
            <FolderSearch className="w-3.5 h-3.5 text-indigo-600" />
            <span>Detect Folder</span>
          </button>

          {/* Clear Mock Data */}
          {isAdmin && (
            <button
              type="button"
              onClick={clearMockDataAndRescan}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold glass-pill hover:bg-rose-50 text-slate-600 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-xs"
              title="Purge cached mock data and refresh workstation detection"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Mock</span>
            </button>
          )}

          {desktopPermission !== 'granted' && (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                requestDesktopNotificationPermission();
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold glass-pill hover:bg-slate-100 text-slate-800 flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-xs"
              title="Enable Desktop Audio & Popup Alerts"
            >
              <Bell className="w-3.5 h-3.5 text-slate-600" />
              <span>Enable Alerts</span>
            </button>
          )}

          <div className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200/80 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-slate-600" />
            <span>{bridge.label?.split(' (')[0] || 'Studio-PC-01'}</span>
            <span className={`w-2 h-2 rounded-full ${bridge.is_online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          </div>
        </div>
      </div>

      {/* Tracker Mode Toggle (Ongoing Safar Kanban vs All Campaigns Matrix) */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => { sounds.playTap(); setTrackerMode('kanban'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              trackerMode === 'kanban'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ongoing Safar Kanban</span>
          </button>
          <button
            type="button"
            onClick={() => { sounds.playTap(); setTrackerMode('campaigns'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              trackerMode === 'campaigns'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>All Campaigns & Matrix ({safarCampaigns.length})</span>
          </button>
        </div>
      </div>

      {/* Conditional Rendering: Kanban vs Campaigns */}
      {isScanning ? (
        <SkeletonLoader variant="kanban" message="Syncing workstation Safar folders & render pipeline..." />
      ) : trackerMode === 'kanban' ? (
        <OngoingSafarKanban />
      ) : (
        <>
      {/* 2. KPI Bar (Total Safars, Total Days, 6 Stage Counts & % Delivered) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAGE_KEYS.map((stageKey) => {
          const cfg = TRACKER_STAGE_CONFIG[stageKey];
          const count = metrics.stageCounts[stageKey] || 0;
          return (
            <div
              key={stageKey}
              className="glass-panel p-3.5 rounded-2xl border border-slate-200/80 bg-white/80 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[11px] font-bold text-slate-500 truncate">
                  {cfg.shortLabel}
                </span>
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900 font-mono">
                  {count}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {metrics.totalDays > 0 ? `${Math.round((count / metrics.totalDays) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workstation Overall Delivery Progress Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 bg-white/85 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Workstation Delivery Progress</span>
            <span className="text-slate-400">({metrics.completedDeliverables} of {metrics.totalDays} Days Submitted)</span>
          </div>
          <span className="font-mono font-bold text-indigo-600">{metrics.progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
          <div
            className="h-full bg-indigo-600 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${metrics.progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Filters & Lifecycle Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Segmented Control Tabs: Active, Archived, All */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-start">
          <button
            type="button"
            onClick={() => { sounds.playTap(); setActiveTab('active'); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Active Safars ({safarCampaigns.filter(c => !c.is_archived && !c.is_safar_done).length})
          </button>
          <button
            type="button"
            onClick={() => { sounds.playTap(); setActiveTab('archived'); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'archived'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Archived / Done ({safarCampaigns.filter(c => c.is_archived || c.is_safar_done).length})
          </button>
          <button
            type="button"
            onClick={() => { sounds.playTap(); setActiveTab('all'); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            All Safars ({safarCampaigns.length})
          </button>
        </div>

        {/* Search & Drive Filter */}
        <div className="flex items-center gap-2">
          {/* Drive Root Filter */}
          <div className="relative">
            <select
              value={selectedDrive}
              onChange={(e) => {
                sounds.playTap();
                setSelectedDrive(e.target.value);
              }}
              className="appearance-none pl-8 pr-8 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer shadow-xs"
            >
              <option value="all">All Drives</option>
              {driveRoots.map(dr => (
                <option key={dr} value={dr}>{dr}</option>
              ))}
            </select>
            <HardDrive className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Safar, date, serial..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* 4. Safar Cards & Stepper Rows OR One Tap Detection Empty Slate */}
      {safarCampaigns.length === 0 ? (
        <div className="glass-panel rounded-3xl p-10 sm:p-14 text-center border border-slate-200/80 bg-white/90 shadow-sm space-y-5 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              One Tap Auto-Detection Active
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              No mock data loaded. AnyShare detects Safar campaigns, daily deliverables, and render exports directly from One Tap on your PC.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold">Workstation Node:</span>
              <span className="font-mono font-bold text-slate-900">{bridge.label?.split(' (')[0] || 'Studio-PC-01'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold">Bridge Port:</span>
              <span className="font-mono text-indigo-600 font-bold">http://127.0.0.1:5253</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold">Realtime Nexus:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Listening
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              disabled={isScanning}
              onClick={handleScanWorkstation}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>Scan One Tap Drives Now</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setIsDetectModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold glass-pill hover:bg-slate-100 text-slate-800 flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-xs"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-slate-700" />
              <span>Detect Drive Folder Path</span>
            </button>
          </div>
        </div>
      ) : filteredSafars.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-200/80 bg-white/70">
          <Layers className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No Matching Safars</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No campaigns match "${searchQuery}".`
              : activeTab === 'archived'
              ? 'No archived Safars. When all dates are done, admins can archive them.'
              : 'No active Safar campaigns.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSafars.map((safar) => {
            const isExpanded = expandedSafarIds.has(safar.id);
            const isDoneOrArchived = safar.is_archived || safar.is_safar_done;

            const total = (safar.dates || []).length;
            const submittedCount = (safar.dates || []).filter(d => d.status === 'submitted').length;
            const safarPercent = total > 0 ? Math.round((submittedCount / total) * 100) : 0;

            return (
              <div
                key={safar.id}
                className="glass-panel rounded-3xl border border-slate-200/80 bg-white/90 shadow-xs overflow-hidden transition-all"
              >
                {/* Safar Header Bar */}
                <div className="p-5 sm:p-6 border-b border-slate-200/60">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Safar Title, Badges & Drive */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                          {safar.safarName || safar.name}
                        </h3>
                        {safar.city && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                            {safar.city}
                          </span>
                        )}
                        {safar.serialNumber && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {safar.serialNumber}
                          </span>
                        )}
                        {safar.driveRoot && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-900 text-white flex items-center gap-1">
                            <HardDrive className="w-3 h-3 text-slate-300" />
                            {safar.driveRoot}
                          </span>
                        )}
                        {isDoneOrArchived && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-700" />
                            100% Done & Archived
                          </span>
                        )}
                        {safar.auto_date_injected && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1" title="One Tap automatically appended the production date to this path">
                            <Zap className="w-3 h-3 text-indigo-600" />
                            Auto-Date Path
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                        <span>{safar.venue || 'Main Complex'}</span>
                        <span>•</span>
                        <span className="font-mono">{safar.baseDirectory || 'Root Drive'}</span>
                        <span>•</span>
                        <span className="font-bold text-slate-800">
                          {submittedCount} of {total} Days Delivered ({safarPercent}%)
                        </span>
                      </div>
                    </div>

                    {/* Right: Admin Quick Action Group & Expand Toggle */}
                    <div className="flex flex-wrap items-center gap-2">
                      {isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              toggleSafarDone({
                                safarName: safar.safarName || safar.name,
                                isDone: !isDoneOrArchived,
                                isArchived: !isDoneOrArchived
                              });
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                              isDoneOrArchived
                                ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            <Archive className="w-3.5 h-3.5" />
                            <span>{isDoneOrArchived ? 'Restore to Active' : 'Mark Safar Done & Archive'}</span>
                          </button>

                          {!isDoneOrArchived && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  markAllSafarDatesStatus({
                                    safarName: safar.safarName || safar.name,
                                    status: 'uploaded'
                                  });
                                }}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white text-slate-800 cursor-pointer border border-slate-200 shadow-xs"
                                title="Mark all days as uploaded to Vault"
                              >
                                Mark All Uploaded
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  markAllSafarDatesStatus({
                                    safarName: safar.safarName || safar.name,
                                    status: 'submitted'
                                  });
                                }}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white text-slate-800 cursor-pointer border border-slate-200 shadow-xs"
                                title="Mark all days as submitted to AlJamea"
                              >
                                Mark All Submitted
                              </button>
                            </>
                          )}

                          {/* Edit Safar Campaign */}
                          <button
                            type="button"
                            onClick={() => startEditSafar(safar)}
                            className="p-1.5 rounded-xl glass-pill hover:bg-slate-100 text-slate-700 hover:text-slate-950 cursor-pointer border border-slate-200 shadow-2xs"
                            title={`Edit ${safar.safarName || safar.name}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Safar Campaign */}
                          <button
                            type="button"
                            onClick={() => {
                              sounds.playTap();
                              setSafarToDelete(safar);
                            }}
                            className="p-1.5 rounded-xl glass-pill hover:bg-rose-50 text-rose-600 hover:text-rose-800 cursor-pointer border border-rose-200 shadow-2xs"
                            title={`Delete ${safar.safarName || safar.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleExpand(safar.id)}
                        className="p-1.5 rounded-xl glass-pill hover:bg-white text-slate-700 cursor-pointer border border-slate-200 shadow-xs"
                        aria-label={isExpanded ? 'Collapse dates' : 'Expand dates'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4 border border-slate-200/60">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                      style={{ width: `${safarPercent}%` }}
                    />
                  </div>
                </div>

                {/* Expanded Date Deliverables Table & 6-Stage Stepper */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 space-y-3 bg-slate-50/60">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1 mb-2">
                      Daily Video Deliverables ({(safar.dates || []).length} Days)
                    </div>

                    <div className="space-y-3">
                      {(safar.dates || []).map((dateItem) => (
                        <DateDeliverableRow
                          key={dateItem.id}
                          safarName={safar.safarName || safar.name}
                          safarBaseDirectory={safar.baseDirectory}
                          dateItem={dateItem}
                          isAdmin={isAdmin}
                          onUpdateEditor={(newEditor) => {
                            updateDeliverableEditor({
                              safarId: safar.id,
                              safarName: safar.safarName || safar.name,
                              dateFolder: dateItem.dateFolder || dateItem.dateLabel,
                              dayNumber: dateItem.dayNumber,
                              assignedEditor: newEditor
                            });
                          }}
                          onMarkStatus={(status) => {
                            markTaskStatus({
                              safarName: safar.safarName || safar.name,
                              dateFolder: dateItem.dateFolder || dateItem.dateLabel,
                              status
                            });
                          }}
                          onRemoveFolder={() => {
                            removeTrackerDateFolder(safar.safarName || safar.name, dateItem.dateFolder || dateItem.dateLabel);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </>
      )}

      {/* 5. Workstation Directory Detection Modal */}
      {isDetectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md animate-fadeIn text-left">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <FolderSearch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Detect Safar Workstation Folder
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Auto-discovers date folders and registers with One Tap
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetectModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDetectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Workstation Directory Path (on PC)
                </label>
                <input
                  type="text"
                  required
                  value={detectFolderInput}
                  onChange={(e) => handleFolderInputChange(e.target.value)}
                  placeholder="e.g. F:\Safar_1448_Colombo or E:\Ashara_1448_Karachi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-xs"
                />

                {/* Real-time Path Analysis & Auto-Date Preview */}
                {parsedPathInfo && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-100/80 border border-slate-200 text-xs space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Live One Tap Path Engine
                      </span>
                      {parsedPathInfo.isAutoDateAdded ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Zap className="w-3 h-3 text-indigo-600" />
                          Date Auto-Injected by One Tap
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCheck className="w-3 h-3 text-emerald-600" />
                          Date Specified in Path
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="text-slate-600 flex items-center gap-1.5 truncate">
                        <span className="text-slate-400 shrink-0">Safar Base:</span>
                        <span className="font-semibold text-slate-900 truncate">{parsedPathInfo.safarBasePath}</span>
                      </div>
                      <div className="text-slate-600 flex items-center gap-1.5 truncate">
                        <span className="text-slate-400 shrink-0">Active Date:</span>
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                          \{parsedPathInfo.resolvedDateFolder}
                        </span>
                      </div>
                      <div className="text-slate-600 flex items-center gap-1.5 truncate">
                        <span className="text-slate-400 shrink-0">Resolved Path:</span>
                        <span className="font-bold text-slate-900 truncate">{parsedPathInfo.resolvedDatePath}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Safar Title
                  </label>
                  <input
                    type="text"
                    required
                    value={detectSafarName}
                    onChange={(e) => setDetectSafarName(e.target.value)}
                    placeholder="e.g. Safar 1448 — Colombo"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    City / Venue
                  </label>
                  <input
                    type="text"
                    required
                    value={detectCity}
                    onChange={(e) => setDetectCity(e.target.value)}
                    placeholder="e.g. Colombo"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Total Event Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={detectDaysCount}
                    onChange={(e) => setDetectDaysCount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Drive Root Letter
                  </label>
                  <input
                    type="text"
                    value={detectDriveRoot}
                    onChange={(e) => setDetectDriveRoot(e.target.value.toUpperCase())}
                    placeholder="e.g. F:\"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDetectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold glass-pill hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs transition-colors"
                >
                  Register & Detect Deliverables
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Safar Modal */}
      {editingSafar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-slate-200 bg-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                Edit Safar Campaign
              </h3>
              <button
                type="button"
                onClick={() => setEditingSafar(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-950 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSafarEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Safar Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={editSafarName}
                  onChange={(e) => setEditSafarName(e.target.value)}
                  placeholder="e.g. Safar 1448 — Colombo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    City / Venue
                  </label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="e.g. Colombo"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Hijri Year
                  </label>
                  <input
                    type="text"
                    required
                    value={editHijriYear}
                    onChange={(e) => setEditHijriYear(e.target.value)}
                    placeholder="e.g. 1448 H"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Drive Root
                  </label>
                  <input
                    type="text"
                    value={editDriveRoot}
                    onChange={(e) => setEditDriveRoot(e.target.value.toUpperCase())}
                    placeholder="e.g. F:\"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Total Event Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={editTotalDays}
                    onChange={(e) => setEditTotalDays(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Base Directory Path
                </label>
                <input
                  type="text"
                  value={editBaseDir}
                  onChange={(e) => setEditBaseDir(e.target.value)}
                  placeholder="e.g. F:\Safar_1448_Colombo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingSafar(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold glass-pill hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs transition-colors"
                >
                  Save Safar Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Safar Dialog */}
      {safarToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 border border-rose-200 bg-white shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Safar Campaign?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to delete <strong>{safarToDelete.safarName || safarToDelete.name}</strong>? This removes all associated deliverable dates from AnyShare.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSafarToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold glass-pill hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSafar}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs transition-colors"
              >
                Yes, Delete Safar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Single Date Deliverable Row with 6-Stage Stepper
function DateDeliverableRow({ safarName, dateItem, safarBaseDirectory, isAdmin, onMarkStatus, onUpdateEditor, onRemoveFolder }) {
  const currentStageIndex = STAGE_KEYS.indexOf(dateItem.status);
  const currentConfig = TRACKER_STAGE_CONFIG[dateItem.status] || TRACKER_STAGE_CONFIG.editing_pending;
  const fullDatePath = dateItem.datePath || (safarBaseDirectory ? `${safarBaseDirectory}\\${dateItem.dateFolder || dateItem.dateLabel}` : null);

  const [isEditingEditor, setIsEditingEditor] = useState(false);
  const [editorInput, setEditorInput] = useState(dateItem.assignedEditor || '');

  const handleSaveEditor = () => {
    if (onUpdateEditor) {
      onUpdateEditor(editorInput);
    }
    setIsEditingEditor(false);
  };

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      {/* Date Item Details */}
      <div className="space-y-1 min-w-[240px]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
            {dateItem.dateFolder || dateItem.dateLabel}
          </span>
          <span className="text-xs font-bold text-slate-900 truncate">
            {dateItem.title}
          </span>
          {dateItem.was_auto_date_added && (
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded" title="One Tap automatically appended date to Safar path">
              Auto-Date
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span>{dateItem.hijriDate}</span>
          {fullDatePath && (
            <>
              <span>•</span>
              <span className="font-mono text-slate-600 truncate max-w-[220px]" title={fullDatePath}>
                {fullDatePath}
              </span>
            </>
          )}
          <span>•</span>
          <span className="font-mono">{dateItem.file_size_gb || 40} GB</span>
          <span>•</span>
          {isEditingEditor ? (
            <span className="inline-flex items-center gap-1 font-sans">
              <input
                type="text"
                autoFocus
                value={editorInput}
                onChange={(e) => setEditorInput(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEditor();
                  if (e.key === 'Escape') setIsEditingEditor(false);
                }}
                className="px-1.5 py-0.5 rounded bg-slate-50 border border-indigo-400 font-mono text-[11px] text-slate-900 w-28 focus:outline-none"
                placeholder="editor..."
              />
              <button
                type="button"
                onClick={handleSaveEditor}
                className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingEditor(false)}
                className="px-1 py-0.5 rounded text-slate-400 hover:text-slate-700 text-[10px] cursor-pointer"
              >
                ✕
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (isAdmin) {
                  sounds.playTap();
                  setEditorInput(dateItem.assignedEditor || '');
                  setIsEditingEditor(true);
                }
              }}
              className={`font-mono text-slate-700 inline-flex items-center gap-1 ${
                isAdmin ? 'hover:text-indigo-600 cursor-pointer underline decoration-dotted' : ''
              }`}
              title={isAdmin ? 'Click to edit or reassign editor' : 'Assigned Editor'}
            >
              <span>@{dateItem.assignedEditor || 'unassigned'}</span>
              {isAdmin && <Edit3 className="w-2.5 h-2.5 opacity-60" />}
            </button>
          )}
        </div>
      </div>

      {/* 6-Stage Interactive Stepper */}
      <div className="flex-1 max-w-2xl py-2">
        <div className="relative flex items-center justify-between">
          {/* Track Line */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-slate-200 z-0" />
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-indigo-600 transition-all duration-300 z-0"
            style={{
              width: `${(Math.max(0, currentStageIndex) / (STAGE_KEYS.length - 1)) * 100}%`
            }}
          />

          {STAGE_KEYS.map((stageKey, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const cfg = TRACKER_STAGE_CONFIG[stageKey];

            return (
              <div
                key={stageKey}
                onClick={() => {
                  if (isAdmin) {
                    sounds.playTap();
                    onMarkStatus(stageKey);
                  }
                }}
                className={`relative z-10 flex flex-col items-center group ${
                  isAdmin ? 'cursor-pointer' : 'cursor-default'
                }`}
                title={`${cfg.label} (${cfg.description})${isAdmin ? ' — Click to override stage' : ''}`}
              >
                {/* Stepper Node Circle */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 scale-110 shadow-xs'
                      : isCompleted
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border-2 border-slate-300 text-slate-400 group-hover:border-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : (
                    cfg.stepNumber
                  )}
                </div>

                {/* Stage Short Label */}
                <span
                  className={`text-[9px] font-bold mt-1.5 truncate max-w-[65px] text-center ${
                    isCurrent
                      ? 'text-indigo-600 font-extrabold'
                      : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {cfg.shortLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Quick Action Stage Overrides */}
      {isAdmin && (
        <div className="flex items-center gap-1.5 shrink-0 self-end xl:self-center">
          {dateItem.status !== 'upload_pending' && dateItem.status !== 'uploaded' && dateItem.status !== 'submitted' && (
            <button
              type="button"
              onClick={() => onMarkStatus('upload_pending')}
              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 cursor-pointer shadow-2xs"
              title="Workstation render complete, awaiting NAS upload"
            >
              Upload Pending
            </button>
          )}

          {dateItem.status !== 'uploaded' && (
            <button
              type="button"
              onClick={() => onMarkStatus('uploaded')}
              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 cursor-pointer shadow-2xs"
              title="Confirm file copied to central storage vault"
            >
              Mark Uploaded
            </button>
          )}

          {dateItem.status !== 'submitted' && (
            <button
              type="button"
              onClick={() => onMarkStatus('submitted')}
              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-2xs"
              title="Official sign-off & deliver to AlJamea"
            >
              Mark Submitted
            </button>
          )}

          {onRemoveFolder && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Remove "${dateItem.dateFolder || dateItem.dateLabel}" from Task Tracker?`)) {
                  sounds.playTap();
                  onRemoveFolder();
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              title="Remove / Exclude folder from Task Tracker"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
      {/* Edit Safar Modal */}
      {editingSafar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-slate-200 bg-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                Edit Safar Campaign
              </h3>
              <button
                type="button"
                onClick={() => setEditingSafar(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-950 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSafarEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Safar Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={editSafarName}
                  onChange={(e) => setEditSafarName(e.target.value)}
                  placeholder="e.g. Safar 1448 — Colombo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    City / Venue
                  </label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="e.g. Colombo"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Hijri Year
                  </label>
                  <input
                    type="text"
                    required
                    value={editHijriYear}
                    onChange={(e) => setEditHijriYear(e.target.value)}
                    placeholder="e.g. 1448 H"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Drive Root
                  </label>
                  <input
                    type="text"
                    value={editDriveRoot}
                    onChange={(e) => setEditDriveRoot(e.target.value.toUpperCase())}
                    placeholder="e.g. F:\"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Total Event Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={editTotalDays}
                    onChange={(e) => setEditTotalDays(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Base Directory Path
                </label>
                <input
                  type="text"
                  value={editBaseDir}
                  onChange={(e) => setEditBaseDir(e.target.value)}
                  placeholder="e.g. F:\Safar_1448_Colombo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingSafar(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold glass-pill hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs transition-colors"
                >
                  Save Safar Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Safar Dialog */}
      {safarToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 border border-rose-200 bg-white shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Safar Campaign?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to delete <strong>{safarToDelete.safarName || safarToDelete.name}</strong>? This removes all associated deliverable dates from AnyShare.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSafarToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold glass-pill hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSafar}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs transition-colors"
              >
                Yes, Delete Safar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
