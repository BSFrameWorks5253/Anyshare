import React, { useState, useMemo } from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import SkeletonLoader from '../common/SkeletonLoader';
import {
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  PlusCircle,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  HardDrive,
  FileCheck2,
  UploadCloud,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCheck,
  Filter,
  EyeOff
} from 'lucide-react';

const KANBAN_STAGES = [
  {
    id: 'stage_1_editing',
    title: 'Stage 1: In Editing',
    badge: 'Editing / Raw',
    color: 'amber',
    borderColor: 'border-amber-200/70',
    headerBg: 'bg-amber-50/80 text-amber-800',
    dotBg: 'bg-amber-500',
    allowedStatuses: ['editing_pending', 'editing', 'review']
  },
  {
    id: 'stage_2_rendered',
    title: 'Stage 2: Rendered',
    badge: 'Ready to Upload',
    color: 'blue',
    borderColor: 'border-blue-200/70',
    headerBg: 'bg-blue-50/80 text-blue-800',
    dotBg: 'bg-blue-500',
    allowedStatuses: ['upload_pending']
  },
  {
    id: 'stage_3_uploaded',
    title: 'Stage 3: Uploaded',
    badge: 'Uploaded',
    color: 'emerald',
    borderColor: 'border-emerald-200/70',
    headerBg: 'bg-emerald-50/80 text-emerald-800',
    dotBg: 'bg-emerald-500',
    allowedStatuses: ['uploaded']
  },
  {
    id: 'stage_4_submitted',
    title: 'Stage 4: Submitted to Jameya',
    badge: 'Delivered',
    color: 'purple',
    borderColor: 'border-purple-200/70',
    headerBg: 'bg-purple-50/80 text-purple-800',
    dotBg: 'bg-purple-600',
    allowedStatuses: ['submitted']
  }
];

// Helper to normalize folder names for strict deduplication
function normalizeFolderKey(name) {
  if (!name) return '';
  return name.toLowerCase().replace(/[\s_\-]/g, '');
}

export default function OngoingSafarKanban({ onSelectTaskForInspect }) {
  const {
    safarCampaigns,
    isAdmin,
    users,
    bridge,
    isLoading,
    isScanning,
    markTaskStatus,
    triggerBridgeResetAndRescan,
    removeTrackerDateFolder,
    addTrackerDateFolder
  } = useApp();

  // Active / Ongoing Safars
  const ongoingSafars = useMemo(() => {
    return (safarCampaigns || []).filter(s => !s.is_archived && !s.is_safar_done);
  }, [safarCampaigns]);

  // Selected Safar ID (default to first active, or null)
  const [selectedSafarId, setSelectedSafarId] = useState(() => {
    if (ongoingSafars.length > 0) return ongoingSafars[0].id;
    return safarCampaigns?.[0]?.id || null;
  });

  // Keep selection valid if list changes
  const activeSafar = useMemo(() => {
    if (!selectedSafarId && ongoingSafars.length > 0) return ongoingSafars[0];
    return (safarCampaigns || []).find(s => s.id === selectedSafarId) || ongoingSafars[0] || null;
  }, [safarCampaigns, ongoingSafars, selectedSafarId]);

  // Modal / Form state for Add Date Folder
  const [isAddDateModalOpen, setIsAddDateModalOpen] = useState(false);
  const [newDateFolderName, setNewDateFolderName] = useState('');
  const [newDateDayNumber, setNewDateDayNumber] = useState('');
  const [isSubmittingDate, setIsSubmittingDate] = useState(false);

  // Status Filter within Kanban
  const [filterSearch, setFilterSearch] = useState('');

  // Deduplicated & Categorized deliverables for the active Safar
  const kanbanColumns = useMemo(() => {
    if (!activeSafar) return { stage_1_editing: [], stage_2_rendered: [], stage_3_uploaded: [], stage_4_submitted: [] };

    const rawDates = activeSafar.dates || [];

    // Deduplicate dates by normalized key: keep the most advanced status
    const statusPriority = {
      submitted: 4,
      uploaded: 3,
      upload_pending: 2,
      review: 1,
      editing: 1,
      editing_pending: 0
    };

    const dedupeMap = new Map();

    rawDates.forEach(dateItem => {
      const folderName = dateItem.dateFolder || dateItem.folderName || dateItem.name || '';
      if (!folderName) return;

      const normKey = normalizeFolderKey(folderName);
      const existing = dedupeMap.get(normKey);

      if (!existing) {
        dedupeMap.set(normKey, { ...dateItem, dateFolder: folderName });
      } else {
        // Compare priority: higher priority wins
        const existingPriority = statusPriority[existing.status] || 0;
        const currentPriority = statusPriority[dateItem.status] || 0;
        if (currentPriority > existingPriority) {
          dedupeMap.set(normKey, { ...dateItem, dateFolder: folderName });
        } else if (currentPriority === existingPriority && dateItem.renderedAt && !existing.renderedAt) {
          dedupeMap.set(normKey, { ...dateItem, dateFolder: folderName });
        }
      }
    });

    const uniqueDates = Array.from(dedupeMap.values());

    // Filter by search query if any
    const filtered = filterSearch.trim().length > 0
      ? uniqueDates.filter(d => (d.dateFolder || '').toLowerCase().includes(filterSearch.toLowerCase()))
      : uniqueDates;

    // Distribute into 4 columns adhering to the rule:
    // Non-present folders (is_present === false or isMissing === true) MUST ONLY be in Column 4 (Submitted to Jameya)
    const columns = {
      stage_1_editing: [],
      stage_2_rendered: [],
      stage_3_uploaded: [],
      stage_4_submitted: []
    };

    filtered.forEach(item => {
      const isMissingOnDisk = item.is_present === false || item.isMissing === true;

      if (isMissingOnDisk) {
        // NON-PRESENT RULE: only in Column 4!
        columns.stage_4_submitted.push({
          ...item,
          status: 'submitted',
          isArchivedOffline: true
        });
        return;
      }

      if (item.status === 'upload_pending') {
        columns.stage_2_rendered.push(item);
      } else if (item.status === 'uploaded') {
        columns.stage_3_uploaded.push(item);
      } else if (item.status === 'submitted') {
        columns.stage_4_submitted.push(item);
      } else {
        // editing_pending, editing, review, or default
        columns.stage_1_editing.push(item);
      }
    });

    return columns;
  }, [activeSafar, filterSearch]);

  // Overall metrics for the active Safar
  const activeMetrics = useMemo(() => {
    if (!activeSafar) return { total: 0, submitted: 0, rendered: 0, uploaded: 0, percent: 0 };
    const col = kanbanColumns;
    const editingCount = col.stage_1_editing.length;
    const renderedCount = col.stage_2_rendered.length;
    const uploadedCount = col.stage_3_uploaded.length;
    const submittedCount = col.stage_4_submitted.length;
    const total = editingCount + renderedCount + uploadedCount + submittedCount;
    const percent = total > 0 ? Math.round(((submittedCount + uploadedCount) / total) * 100) : 0;
    return {
      total,
      editing: editingCount,
      rendered: renderedCount,
      uploaded: uploadedCount,
      submitted: submittedCount,
      percent
    };
  }, [activeSafar, kanbanColumns]);

  // Handle Remove / Exclude Folder from Tracker
  const handleRemoveFolder = async (folderName, currentStatus) => {
    if (!activeSafar) return;
    const confirmMsg = `Remove "${folderName}" from the Task Tracker?\n\nThis will exclude this date folder from active tracking and recalculate Safar statistics.`;
    if (!window.confirm(confirmMsg)) return;

    sounds.playTap();
    if (removeTrackerDateFolder) {
      await removeTrackerDateFolder(activeSafar.safarName || activeSafar.name, folderName);
    }
  };

  // Handle Manual Add Date Folder
  const handleAddDateSubmit = async (e) => {
    e.preventDefault();
    if (!activeSafar || !newDateFolderName.trim()) return;

    setIsSubmittingDate(true);
    try {
      sounds.playTap();
      if (addTrackerDateFolder) {
        await addTrackerDateFolder(
          activeSafar.safarName || activeSafar.name,
          newDateFolderName.trim(),
          activeSafar.driveRoot || 'F:\\'
        );
      }
      setNewDateFolderName('');
      setNewDateDayNumber('');
      setIsAddDateModalOpen(false);
    } finally {
      setIsSubmittingDate(false);
    }
  };

  // Handle Reset & Rescan
  const handleResetRescan = async () => {
    sounds.playTap();
    if (triggerBridgeResetAndRescan) {
      await triggerBridgeResetAndRescan();
    }
  };

  // Advance or set status
  const handleSetStatus = async (dateItem, newStatus) => {
    sounds.playTap();
    if (markTaskStatus) {
      await markTaskStatus(activeSafar.safarName || activeSafar.name, dateItem.dateFolder, newStatus);
    }
  };

  if (isLoading || isScanning) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <SkeletonLoader variant="kanban" message="Syncing workstation Safar folders & render pipeline..." />
      </div>
    );
  }

  if (!activeSafar) {
    return (
      <div className="p-8 text-center rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-xl shadow-xs">
        <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Active Safar Detected</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          One Tap workstation has not synced any active Safar folders yet, or all Safars are archived.
        </p>
        <button
          onClick={handleResetRescan}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Rescan Workstation Node</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ongoing Safar Hero Header */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                Ongoing Safar Campaign
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {activeSafar.driveRoot || 'F:\\'}
              </span>
              {activeSafar.city && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                  {activeSafar.city}
                </span>
              )}
              {activeSafar.hijriYear && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                  {activeSafar.hijriYear}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {activeSafar.safarName || activeSafar.name}
              </h2>

              {/* Selector if multiple active Safars */}
              {ongoingSafars.length > 1 && (
                <select
                  value={activeSafar.id}
                  onChange={(e) => setSelectedSafarId(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 cursor-pointer focus:outline-none"
                >
                  {ongoingSafars.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.safarName || s.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <p className="text-xs text-slate-500 font-mono">
              Folder Root: {activeSafar.baseDirectory || `${activeSafar.driveRoot || 'F:\\'}${activeSafar.safarName}`}
            </p>
          </div>

          {/* Quick Actions Toolbar */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Search within ongoing safar */}
            <input
              type="text"
              placeholder="Filter dates..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200/90 bg-slate-50/80 text-slate-700 w-36 focus:w-44 transition-all focus:outline-none focus:border-indigo-400"
            />

            {/* + Add Date Folder Button */}
            <button
              onClick={() => setIsAddDateModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Add a custom date folder deliverable"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>+ Add Date</span>
            </button>

            {/* Reset & Clean Rescan Button */}
            <button
              onClick={handleResetRescan}
              disabled={isScanning}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
              title="Rescan workstation disk fresh, discard phantom folders and sync latest data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>Reset & Rescan</span>
            </button>
          </div>
        </div>

        {/* Deliverables Progress Bar & Mini Stats */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {activeMetrics.editing} In Editing
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {activeMetrics.rendered} Rendered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {activeMetrics.uploaded} Uploaded
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              {activeMetrics.submitted} Submitted
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">
              {activeMetrics.submitted + activeMetrics.uploaded} / {activeMetrics.total} Deliverables ({activeMetrics.percent}%)
            </span>
            <div className="w-28 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${activeMetrics.percent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Column Interactive Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {KANBAN_STAGES.map((stage) => {
          const items = kanbanColumns[stage.id] || [];

          return (
            <div
              key={stage.id}
              className={`flex flex-col rounded-2xl border ${stage.borderColor} bg-slate-50/70 backdrop-blur-md p-3.5 min-h-[460px] shadow-2xs`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${stage.dotBg}`}></div>
                  <h3 className="text-xs font-bold text-slate-800 tracking-tight">{stage.title}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${stage.headerBg}`}>
                  {items.length}
                </span>
              </div>

              {/* Column Cards List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[620px] pr-0.5">
                {items.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-3 border border-dashed border-slate-200 rounded-xl text-slate-400">
                    <p className="text-xs font-medium">No folders in this stage</p>
                  </div>
                ) : (
                  items.map((dateItem) => {
                    const folderName = dateItem.dateFolder || dateItem.folderName || 'Date Folder';
                    const hasVideos = (dateItem.renderVideoCount || dateItem.videoCount || 0) > 0;
                    const videoCountText = hasVideos
                      ? `${dateItem.renderVideoCount || dateItem.videoCount} video(s)`
                      : '0 videos';

                    return (
                      <div
                        key={dateItem.id || folderName}
                        className="group relative p-3.5 rounded-xl border border-slate-200/90 bg-white/95 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col gap-2"
                      >
                        {/* Top: Folder Name + Actions */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="font-mono text-xs font-bold text-slate-900 block truncate max-w-[170px]" title={folderName}>
                              {folderName}
                            </span>
                            {dateItem.dayNumber && (
                              <span className="text-[10px] text-slate-500 font-medium block">
                                Day {dateItem.dayNumber}
                              </span>
                            )}
                          </div>

                          {/* Top-Right: Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveFolder(folderName, dateItem.status)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Remove / Exclude folder from Task Tracker"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Middle: Deliverable Metrics */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span className="font-mono font-medium">{videoCountText}</span>
                          {dateItem.file_size_gb ? (
                            <span className="font-mono text-[10px] text-slate-400">
                              {dateItem.file_size_gb} GB
                            </span>
                          ) : dateItem.renderSizeBytes ? (
                            <span className="font-mono text-[10px] text-slate-400">
                              {(dateItem.renderSizeBytes / (1024 * 1024 * 1024)).toFixed(1)} GB
                            </span>
                          ) : null}
                        </div>

                        {/* Missing / Offline Tag (Column 4 only) */}
                        {dateItem.isArchivedOffline && (
                          <div className="flex items-center gap-1 text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                            <EyeOff className="w-3 h-3" />
                            <span>Not on disk · Archived delivery</span>
                          </div>
                        )}

                        {/* Bottom: Quick Stage Advance Stepper */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          {stage.id === 'stage_1_editing' && (
                            <button
                              type="button"
                              onClick={() => handleSetStatus(dateItem, 'upload_pending')}
                              className="w-full py-1 px-2 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>Mark Rendered</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}

                          {stage.id === 'stage_2_rendered' && (
                            <div className="flex items-center gap-1 w-full">
                              <button
                                type="button"
                                onClick={() => handleSetStatus(dateItem, 'editing_pending')}
                                className="py-1 px-1.5 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                                title="Move back to Editing"
                              >
                                ← Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetStatus(dateItem, 'uploaded')}
                                className="flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>Mark Uploaded</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {stage.id === 'stage_3_uploaded' && (
                            <div className="flex items-center gap-1 w-full">
                              <button
                                type="button"
                                onClick={() => handleSetStatus(dateItem, 'upload_pending')}
                                className="py-1 px-1.5 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                                title="Move back to Rendered"
                              >
                                ←
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetStatus(dateItem, 'submitted')}
                                className="flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>Submit to Jameya</span>
                                <CheckCheck className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {stage.id === 'stage_4_submitted' && (
                            <div className="flex items-center justify-between w-full text-[11px] text-purple-700 font-medium">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                                Completed
                              </span>
                              {!dateItem.isArchivedOffline && (
                                <button
                                  type="button"
                                  onClick={() => handleSetStatus(dateItem, 'uploaded')}
                                  className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                                >
                                  Reopen
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: + Add Date Folder */}
      {isAddDateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                Add Date Folder to Tracker
              </h3>
              <button
                type="button"
                onClick={() => setIsAddDateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date Folder Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1448-03-14_01M or 1448-02-05_Day_05"
                  value={newDateFolderName}
                  onChange={(e) => setNewDateFolderName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Must be a direct date folder name (no sub-event folders).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p><strong>Target Safar:</strong> {activeSafar.safarName || activeSafar.name}</p>
                <p><strong>Drive Root:</strong> {activeSafar.driveRoot || 'F:\\'}</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDate || !newDateFolderName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingDate ? 'Adding...' : 'Add Date Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
