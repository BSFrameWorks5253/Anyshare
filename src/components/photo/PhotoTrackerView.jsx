import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import {
  fetchPhotoFolderStatus,
  markPhotoFolderUploaded,
  markPhotoFolderDownloaded,
  sendWhatsAppNotification,
  getGsWebAppUrl,
  setGsWebAppUrl,
  DEFAULT_WHATSAPP_PHONE
} from '../../lib/googleAppsScriptService';
import SkeletonLoader from '../common/SkeletonLoader';
import {
  Camera,
  FolderSync,
  UploadCloud,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  MessageSquare,
  Smartphone,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Settings,
  HardDrive,
  Link,
  Check,
  AlertCircle
} from 'lucide-react';

export default function PhotoTrackerView() {
  const {
    safarCampaigns,
    isAdmin,
    addToast,
    markTaskStatus,
    desktopPermission,
    canInstallPWA
  } = useApp();

  // Active / Ongoing Safars from Task Tracker
  const activeSafars = useMemo(() => {
    return (safarCampaigns || []).filter(s => !s.is_archived && !s.is_safar_done);
  }, [safarCampaigns]);

  const [selectedSafarId, setSelectedSafarId] = useState(() => {
    return activeSafars[0]?.id || safarCampaigns?.[0]?.id || null;
  });

  const activeSafar = useMemo(() => {
    return (safarCampaigns || []).find(s => s.id === selectedSafarId) || activeSafars[0] || null;
  }, [safarCampaigns, activeSafars, selectedSafarId]);

  // Extract expected date deliverables from active Safar (Task Tracker is single source of truth!)
  const expectedDateFolders = useMemo(() => {
    if (!activeSafar) return [];
    return (activeSafar.dates || []).map(d => ({
      dateFolder: d.dateFolder || d.dateLabel || d.name,
      taskStatus: d.status,
      isSystemUploaded: d.status === 'uploaded' || d.status === 'submitted'
    }));
  }, [activeSafar]);

  // Photo Tracking State
  const [photoRecords, setPhotoRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'uploaded' | 'pending' | 'downloaded'
  const [searchQuery, setSearchQuery] = useState('');
  const [isGsModalOpen, setIsGsModalOpen] = useState(false);
  const [gsUrlInput, setGsUrlInput] = useState(() => getGsWebAppUrl());
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  // Sync / Load photo folder status from Google Drive & Sheets
  const refreshPhotoStatus = async () => {
    if (!activeSafar) return;
    setIsLoading(true);
    sounds.playTap();

    try {
      const res = await fetchPhotoFolderStatus({
        safarName: activeSafar.safarName || activeSafar.name,
        expectedDates: expectedDateFolders.map(d => d.dateFolder)
      });

      if (res?.success && Array.isArray(res.folders)) {
        // Merge with system tracker status
        const merged = res.folders.map(f => {
          const matchedExpected = expectedDateFolders.find(
            e => e.dateFolder.toLowerCase() === f.dateFolder.toLowerCase()
          );
          return {
            ...f,
            taskStatus: matchedExpected?.taskStatus || 'editing_pending',
            isSystemUploaded: matchedExpected?.isSystemUploaded || false
          };
        });
        setPhotoRecords(merged);
      }
    } catch (err) {
      console.error('Failed to sync photo folders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load when active Safar changes
  useEffect(() => {
    refreshPhotoStatus();
  }, [activeSafar?.id]);

  // 1. Mark date folder uploaded in Google Drive + System Tracker + Trigger WhatsApp milestone alert
  const handleMarkUploaded = async (folderName) => {
    if (!activeSafar) return;
    sounds.playTap();

    const safarName = activeSafar.safarName || activeSafar.name;

    // A. Update in Google Drive & Google Sheet via GS
    const res = await markPhotoFolderUploaded({
      safarName,
      dateFolder: folderName,
      markedBy: 'AnyShare Web User',
      websiteUrl: window.location.origin
    });

    // B. Also update System Task Tracker so both systems stay perfectly synchronized!
    if (markTaskStatus) {
      await markTaskStatus({
        safarName,
        dateFolder: folderName,
        status: 'uploaded'
      });
    }

    // C. Update local view state immediately
    setPhotoRecords(prev => prev.map(p => {
      if (p.dateFolder.toLowerCase() === folderName.toLowerCase()) {
        return {
          ...p,
          isUploaded: true,
          status: p.isDownloaded ? 'downloaded' : 'uploaded',
          taskStatus: 'uploaded'
        };
      }
      return p;
    }));

    // Calculate updated counts for feedback
    const updatedUploaded = photoRecords.filter(p => p.isUploaded || p.dateFolder === folderName).length;
    const updatedPending = Math.max(0, photoRecords.length - updatedUploaded);

    addToast({
      title: 'Photo Folder Uploaded & WhatsApp Dispatched',
      message: `${folderName} marked uploaded in Google Drive & notified ${DEFAULT_WHATSAPP_PHONE} (${updatedUploaded} uploaded · ${updatedPending} pending).`,
      type: 'success'
    });
  };

  // 2. Mark date folder downloaded
  const handleMarkDownloaded = async (folderName) => {
    if (!activeSafar) return;
    sounds.playTap();

    const safarName = activeSafar.safarName || activeSafar.name;
    await markPhotoFolderDownloaded({
      safarName,
      dateFolder: folderName,
      markedBy: 'AnyShare Web User'
    });

    setPhotoRecords(prev => prev.map(p => {
      if (p.dateFolder.toLowerCase() === folderName.toLowerCase()) {
        return {
          ...p,
          isDownloaded: true,
          status: 'downloaded'
        };
      }
      return p;
    }));

    addToast({
      title: 'Marked Downloaded',
      message: `${folderName} marked as downloaded to studio storage.`,
      type: 'info'
    });
  };

  // 3. Manual WhatsApp Milestone Trigger
  const handleSendManualWhatsAppAlert = async () => {
    if (!activeSafar) return;
    setIsSendingWhatsApp(true);
    sounds.playTap();

    const uploadedCount = photoRecords.filter(p => p.isUploaded).length;
    const pendingCount = photoRecords.length - uploadedCount;
    const targetFolder = photoRecords.find(p => p.isUploaded)?.dateFolder || 'Latest Batch';

    try {
      const res = await sendWhatsAppNotification({
        folderName: targetFolder,
        uploadedCount,
        pendingCount,
        websiteUrl: window.location.origin,
        phone: DEFAULT_WHATSAPP_PHONE
      });

      if (res?.success) {
        addToast({
          title: 'WhatsApp Alert Dispatched',
          message: `Sent milestone alert to +91 ${DEFAULT_WHATSAPP_PHONE}: ${uploadedCount} uploaded · ${pendingCount} pending.`,
          type: 'success'
        });
      } else {
        addToast({
          title: 'WhatsApp Alert Notice',
          message: res?.message || 'WhatsApp alert logged. Configure your GS Web App URL to route real-time messages.',
          type: 'info'
        });
      }
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  // Save GS Web App URL
  const handleSaveGsUrl = (e) => {
    e.preventDefault();
    setGsWebAppUrl(gsUrlInput);
    setIsGsModalOpen(false);
    sounds.playSuccess();
    addToast({
      title: 'Google Apps Script Linked',
      message: 'Web App URL configured. Real Google Drive and Gmail services activated.',
      type: 'success'
    });
    refreshPhotoStatus();
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = photoRecords.length;
    const uploaded = photoRecords.filter(p => p.isUploaded).length;
    const downloaded = photoRecords.filter(p => p.isDownloaded).length;
    const pending = total - uploaded;
    const percent = total > 0 ? Math.round((uploaded / total) * 100) : 0;
    return { total, uploaded, downloaded, pending, percent };
  }, [photoRecords]);

  // Filtered deliverables
  const filteredRecords = useMemo(() => {
    return photoRecords.filter(rec => {
      if (filterTab === 'uploaded' && !rec.isUploaded) return false;
      if (filterTab === 'pending' && rec.isUploaded) return false;
      if (filterTab === 'downloaded' && !rec.isDownloaded) return false;

      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        if (!rec.dateFolder.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [photoRecords, filterTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/80 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-rose-600" />
                Google Drive Photo Sync
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {activeSafar?.driveRoot || 'F:\\'}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-emerald-600" />
                WA: +91 {DEFAULT_WHATSAPP_PHONE}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Photo Data & Sync Matrix
              </h2>

              {activeSafars.length > 1 && (
                <select
                  value={activeSafar?.id}
                  onChange={(e) => setSelectedSafarId(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 cursor-pointer focus:outline-none"
                >
                  {activeSafars.map(s => (
                    <option key={s.id} value={s.id}>{s.safarName || s.name}</option>
                  ))}
                </select>
              )}
            </div>

            <p className="text-xs text-slate-500 font-mono">
              Safar Campaign: <strong className="text-slate-800">{activeSafar?.safarName || 'No Active Safar'}</strong> &middot; Tracked Date Folders derived directly from Task Tracker
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Sync Now */}
            <button
              type="button"
              disabled={isLoading}
              onClick={refreshPhotoStatus}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition disabled:opacity-60"
              title="Rescan Google Drive & Sheet for latest photo uploads"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Syncing Drive...' : 'Sync with Drive'}</span>
            </button>

            {/* Send WhatsApp Milestone Alert */}
            <button
              type="button"
              disabled={isSendingWhatsApp}
              onClick={handleSendManualWhatsAppAlert}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition disabled:opacity-60"
              title="Push current milestone status to WhatsApp (+91 8369811201)"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Alert</span>
            </button>

            {/* GS Script Config */}
            <button
              type="button"
              onClick={() => setIsGsModalOpen(true)}
              className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer shadow-2xs"
              title="Configure Google Apps Script Web App URL"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {metrics.uploaded} Uploaded to Drive
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {metrics.pending} Pending Upload
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              {metrics.downloaded} Downloaded to Archive
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">
              {metrics.uploaded} / {metrics.total} Folders Uploaded ({metrics.percent}%)
            </span>
            <div className="w-32 sm:w-40 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${metrics.percent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-start">
          {[
            { id: 'all', label: `All Dates (${metrics.total})` },
            { id: 'uploaded', label: `Uploaded (${metrics.uploaded})` },
            { id: 'pending', label: `Pending (${metrics.pending})` },
            { id: 'downloaded', label: `Downloaded (${metrics.downloaded})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { sounds.playTap(); setFilterTab(tab.id); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative flex-1 sm:w-64">
          <input
            type="text"
            placeholder="Search date folder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xs font-mono"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 3. Photo Deliverables Cards Grid */}
      {isLoading ? (
        <SkeletonLoader variant="kanban" message="Syncing Google Drive folders with Task Tracker dates..." />
      ) : filteredRecords.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-xl shadow-xs">
          <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Photo Date Folders Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            No date folders matched the current filter. Sync with Task Tracker or register a new Safar campaign.
          </p>
          <button
            onClick={refreshPhotoStatus}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resync with Drive</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRecords.map((record) => {
            const folderName = record.dateFolder;
            const isUploaded = record.isUploaded;
            const isDownloaded = record.isDownloaded;

            return (
              <div
                key={folderName}
                className="p-4 rounded-2xl border border-slate-200/90 bg-white/95 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="font-mono text-sm font-bold text-slate-900 block truncate max-w-[200px]" title={folderName}>
                      {folderName}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Task Tracker Status */}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        Task: {record.taskStatus ? record.taskStatus.replace('_', ' ') : 'in editing'}
                      </span>
                    </div>
                  </div>

                  {/* Drive Status Pill */}
                  <div>
                    {isUploaded ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Uploaded
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Info */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 space-y-1.5 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Google Drive:</span>
                    <span className="font-semibold text-slate-800">
                      {isUploaded ? '[UPLOADED] Tagged' : 'Awaiting sync'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Archive Vault:</span>
                    <span className="font-semibold text-slate-800">
                      {isDownloaded ? 'Downloaded to disk' : 'Not downloaded'}
                    </span>
                  </div>
                  {record.lastSyncedAt && (
                    <div className="text-[10px] text-slate-400 truncate pt-1 border-t border-slate-200/60">
                      Synced: {new Date(record.lastSyncedAt).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* Mark Uploaded */}
                    {!isUploaded ? (
                      <button
                        type="button"
                        onClick={() => handleMarkUploaded(folderName)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Mark date as uploaded in Drive, update Task Tracker & trigger WhatsApp alert"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Mark Uploaded</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Synced
                      </span>
                    )}

                    {/* Mark Downloaded */}
                    {!isDownloaded && isUploaded && (
                      <button
                        type="button"
                        onClick={() => handleMarkDownloaded(folderName)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition flex items-center gap-1 cursor-pointer"
                        title="Mark date as downloaded to local archive"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Downloaded</span>
                      </button>
                    )}
                  </div>

                  {/* Drive Link */}
                  {record.driveFolderUrl && (
                    <a
                      href={record.driveFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                      title="Open in Google Drive"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Google Apps Script Configuration Modal */}
      {isGsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md animate-fadeIn text-left">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-600" />
                Google Apps Script & WhatsApp Configuration
              </h3>
              <button
                type="button"
                onClick={() => setIsGsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGsUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Apps Script Web App URL
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={gsUrlInput}
                  onChange={(e) => setGsUrlInput(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Deploy the provided <code>photo_safar_tracker.gs</code> script as a Web App (Access: Anyone) to enable live Drive tags, WhatsApp alerts, and Gmail dispatches.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Target WhatsApp Phone:</span>
                  <span className="font-mono font-bold text-emerald-700">+91 {DEFAULT_WHATSAPP_PHONE}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  On every date upload completion, WhatsApp receives: <em>Folder Name, X uploaded &middot; Y pending, and website URL.</em>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer shadow-xs"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
