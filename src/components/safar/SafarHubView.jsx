import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import UserAvatarWithReflection from '../common/UserAvatarWithReflection';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Upload,
  HardDrive,
  FolderPlus,
  Send,
  Sparkles,
  AlertCircle,
  FileCheck,
  Server,
  Layers,
  ArrowRight,
  Shield,
  User,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  Edit3,
  Trash2
} from 'lucide-react';

export default function SafarHubView() {
  const {
    currentUser,
    isAdmin,
    bridge,
    triggerBridgeScan,
    detectSafarFromPath,
    safarCampaigns,
    safarRequests,
    markSafarDateUploaded,
    createSafarCampaign,
    updateSafarCampaign,
    removeSafarCampaign,
    submitSafarRequest,
    reviewSafarRequest
  } = useApp();

  const [selectedCampaignId, setSelectedCampaignId] = useState(
    safarCampaigns[0]?.id || ''
  );
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'uploaded' | 'pending'
  const [isScanning, setIsScanning] = useState(false);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestTargetDate, setRequestTargetDate] = useState(null);

  // Form states for Admin Safar Creation
  const [newName, setNewName] = useState('');
  const [newHijri, setNewHijri] = useState('1448 H');
  const [newCity, setNewCity] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newTotalDays, setNewTotalDays] = useState(10);
  const [newServerDest, setNewServerDest] = useState('//aljamea-nas.local/Central_Vault');

  // Form states for Admin Safar Editing
  const [editName, setEditName] = useState('');
  const [editHijri, setEditHijri] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editTotalDays, setEditTotalDays] = useState(10);
  const [editServerDest, setEditServerDest] = useState('');

  // Form state for User Upload Request
  const [requestNotes, setRequestNotes] = useState('');
  const [requestServerPath, setRequestServerPath] = useState('');
  const [requestSizeGb, setRequestSizeGb] = useState('40.0');

  const activeCampaign = safarCampaigns.find(c => c.id === selectedCampaignId) || safarCampaigns[0];

  if (!activeCampaign) {
    return (
      <div className="glass-panel rounded-3xl p-10 sm:p-14 text-center border border-slate-200/80 bg-white/90 shadow-sm space-y-5 max-w-2xl mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <CalendarDays className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            No Safar Campaigns Loaded
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Connect to your One Tap workstation to automatically detect active Safar project directories, or create a campaign manually.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            disabled={isScanning}
            onClick={async () => {
              setIsScanning(true);
              await triggerBridgeScan();
              setTimeout(() => setIsScanning(false), 800);
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 cursor-pointer shadow-sm transition-all"
          >
            <Server className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Workstation...' : 'Detect from One Tap Workstation'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold glass-pill hover:bg-slate-100 text-slate-800 flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-xs"
          >
            <FolderPlus className="w-3.5 h-3.5 text-slate-700" />
            <span>+ Create Safar Campaign</span>
          </button>
        </div>
      </div>
    );
  }

  // Calculate metrics for active campaign
  const totalDays = activeCampaign.dates?.length || activeCampaign.totalDays || 0;
  const uploadedCount = activeCampaign.dates?.filter(d => d.status === 'uploaded').length || 0;
  const pendingCount = totalDays - uploadedCount;
  const progressPercent = totalDays > 0 ? Math.round((uploadedCount / totalDays) * 100) : 0;

  // Filter dates
  const filteredDates = (activeCampaign.dates || []).filter(d => {
    if (filterStatus === 'uploaded') return d.status === 'uploaded';
    if (filterStatus === 'pending') return d.status === 'pending';
    return true;
  });

  // Pending requests for this campaign
  const campaignPendingRequests = (safarRequests || []).filter(
    r => r.safarId === activeCampaign.id && r.status === 'pending'
  );

  const handleAdminMarkUploaded = (dayNumber, defaultPath) => {
    sounds.playTap();
    markSafarDateUploaded({
      safarId: activeCampaign.id,
      dayNumber,
      serverPath: defaultPath || activeCampaign.serverDestination + `/Day_${dayNumber}`
    });
  };

  const handleOpenRequestModal = (dateItem) => {
    sounds.playTap();
    setRequestTargetDate(dateItem);
    setRequestNotes(`Finished export for ${dateItem.title}. Ready for central vault verification.`);
    setRequestServerPath(`${activeCampaign.serverDestination}/Main Data/${dateItem.dateLabel}_0${dateItem.dayNumber}M`);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!requestTargetDate) return;

    submitSafarRequest({
      safarId: activeCampaign.id,
      dayNumber: requestTargetDate.dayNumber,
      type: 'mark_uploaded',
      notes: requestNotes,
      serverPathProposed: requestServerPath,
      fileSizeGb: requestSizeGb
    });

    setShowRequestModal(false);
    setRequestTargetDate(null);
  };

  const handleCreateCampaignSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newCity.trim()) return;

    createSafarCampaign({
      name: newName,
      hijriYear: newHijri,
      city: newCity,
      venue: newVenue,
      totalDays: newTotalDays,
      serverDestination: newServerDest
    });

    setShowCreateModal(false);
    setNewName('');
    setNewCity('');
  };

  const openEditModal = () => {
    sounds.playTap();
    setEditName(activeCampaign.name || activeCampaign.safarName || '');
    setEditHijri(activeCampaign.hijriYear || '1448 H');
    setEditCity(activeCampaign.city || '');
    setEditVenue(activeCampaign.venue || '');
    setEditTotalDays(activeCampaign.totalDays || activeCampaign.dates?.length || 10);
    setEditServerDest(activeCampaign.serverDestination || '');
    setShowEditModal(true);
  };

  const handleEditCampaignSubmit = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editCity.trim()) return;

    updateSafarCampaign(activeCampaign.id, {
      name: editName.trim(),
      safarName: editName.trim(),
      hijriYear: editHijri.trim(),
      city: editCity.trim(),
      venue: editVenue.trim(),
      totalDays: parseInt(editTotalDays, 10) || 10,
      serverDestination: editServerDest.trim()
    });

    setShowEditModal(false);
  };

  const handleConfirmDelete = () => {
    sounds.playTap();
    removeSafarCampaign(activeCampaign.id);
    setShowDeleteConfirm(false);
    const remaining = safarCampaigns.filter(c => c.id !== activeCampaign.id);
    if (remaining.length > 0) {
      setSelectedCampaignId(remaining[0].id);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* 1. Header: Apple Liquid Glass Executive Safar Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-black/[0.08] relative overflow-hidden shadow-sm bg-white/80">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold glass-pill text-neutral-800 border border-black/[0.06] bg-white shadow-2xs mb-3">
              <CalendarDays className="w-3.5 h-3.5 text-neutral-600" />
              <span>Safar Hub • Central Upload Tracking Matrix</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight font-sans">
                {activeCampaign.name}
              </h2>

              {/* Campaign Switcher Dropdown */}
              {safarCampaigns.length > 1 && (
                <div className="relative inline-block">
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => {
                      sounds.playTap();
                      setSelectedCampaignId(e.target.value);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-black/[0.08] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 shadow-2xs cursor-pointer"
                  >
                    {safarCampaigns.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Admin Edit & Delete buttons */}
              {isAdmin && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-950 transition-colors shadow-2xs cursor-pointer"
                    title={`Edit ${activeCampaign.name}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setShowDeleteConfirm(true);
                    }}
                    className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-800 transition-colors shadow-2xs cursor-pointer"
                    title={`Delete ${activeCampaign.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-1 leading-relaxed">
              Real-time synchronization of Safar recording dates, 4K master uploads, and vault verification. Marked uploads instantly broadcast cross-device notifications to team editors and admins.
            </p>
          </div>

          {/* Action Button: Create Safar Campaign */}
          <div className="flex items-center gap-3 shrink-0">
            {isAdmin ? (
              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  setShowCreateModal(true);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold glass-button-primary flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <FolderPlus className="w-4 h-4" />
                <span>+ Create New Safar Campaign</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-white/80 border border-black/[0.06] text-xs font-semibold text-neutral-700 flex items-center gap-2 shadow-2xs">
                <Shield className="w-4 h-4 text-neutral-600" />
                <span>Safar campaigns are curated by Admin</span>
              </div>
            )}
          </div>
        </div>

        {/* 4 Executive Metric Cards with Liquid Glass Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-black/[0.06] mb-4">
          <div className="p-4 rounded-2xl bg-white border border-black/[0.06] shadow-2xs">
            <span className="text-xs font-medium text-neutral-500 block">Total Safar Dates</span>
            <span className="text-2xl font-bold text-neutral-950">{totalDays} Days</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-black/[0.06] shadow-2xs">
            <span className="text-xs font-medium text-neutral-500 block">Uploaded & Verified</span>
            <span className="text-2xl font-bold text-emerald-700">
              {uploadedCount} Done
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-black/[0.06] shadow-2xs">
            <span className="text-xs font-medium text-neutral-500 block">Pending Uploads</span>
            <span className="text-2xl font-bold text-neutral-700">
              {pendingCount} Pending
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-black/[0.06] shadow-2xs">
            <span className="text-xs font-medium text-neutral-500 block">Vault Completion</span>
            <span className="text-2xl font-bold text-neutral-950 font-mono">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Linear Completion Progress Bar */}
        <div className="w-full bg-neutral-200/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-black/[0.04]">
          <div 
            className="h-full rounded-full bg-neutral-950 transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Admin Review Queue for Pending User Requests (Visible to Admin) */}
      {isAdmin && campaignPendingRequests.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 border border-neutral-300 bg-white/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
              <h3 className="text-sm font-bold text-neutral-950 font-sans">
                Pending Upload Approval Requests ({campaignPendingRequests.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-300">
              Admin Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {campaignPendingRequests.map((req) => (
              <div 
                key={req.id} 
                className="p-4 rounded-2xl bg-white/95 border border-white/80 shadow-xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-950">
                      Day {req.dayNumber} Upload Verification
                    </span>
                    <span className="font-mono text-xs font-bold text-[#1e293b]">
                      @{req.requestedBy}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 italic">
                    "{req.notes}"
                  </p>
                  {req.serverPathProposed && (
                    <p className="text-[11px] font-mono text-slate-600 mt-1 truncate bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                      {req.serverPathProposed}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      reviewSafarRequest({ requestId: req.id, action: 'approve' });
                    }}
                    className="flex-1 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Mark Uploaded</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      reviewSafarRequest({ requestId: req.id, action: 'reject' });
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-300 cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Safar Dates Matrix Table & Grid */}
      <div className="space-y-4">
        {/* Filter and Status Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h3 className="text-base font-black text-slate-950">
              Safar Dates Breakdown & Server Deliveries
            </h3>
            <p className="text-xs text-slate-600 font-semibold">
              Showing {filteredDates.length} of {totalDays} dates in this campaign
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl p-1 bg-white/80 border border-white/60 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  setFilterStatus('all');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                All Dates ({totalDays})
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  setFilterStatus('uploaded');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  filterStatus === 'uploaded'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                Done ({uploadedCount})
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  setFilterStatus('pending');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  filterStatus === 'pending'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                Pending ({pendingCount})
              </button>
            </div>
          </div>
        </div>

        {/* Matrix Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDates.map((dateItem) => {
            const isDone = dateItem.status === 'uploaded';

            return (
              <div
                key={dateItem.id}
                className={`apple-liquid-glass-card rounded-3xl p-5 border text-left flex flex-col justify-between select-none ${
                  isDone
                    ? 'border-emerald-300/80 bg-gradient-to-br from-emerald-50/50 via-white to-white'
                    : 'border-white/80 bg-white/85'
                }`}
              >
                <div>
                  {/* Card Header: Day Badge & Upload Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white shadow-xs">
                        DAY {dateItem.dayNumber < 10 ? `0${dateItem.dayNumber}` : dateItem.dayNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        {dateItem.dateLabel}
                      </span>
                    </div>

                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}>
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>UPLOADED (DONE)</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          <span>PENDING UPLOAD</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Title & Hijri Date */}
                  <h4 className="text-base font-bold text-neutral-950 tracking-tight leading-snug">
                    {dateItem.title}
                  </h4>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">
                    {dateItem.hijriDate}
                  </p>

                  {/* File & Server Telemetry */}
                  <div className="mt-3.5 p-3 rounded-2xl bg-white/90 border border-slate-200/80 text-xs space-y-1.5 shadow-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-sans font-medium">Assigned Editor:</span>
                      <span className="font-bold text-slate-950">@{dateItem.assignedEditor || 'unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-sans font-medium">Workstation Date Path:</span>
                      <span className="font-bold text-slate-950 truncate max-w-[200px]" title={dateItem.datePath || `${activeCampaign.baseDirectory || 'F:\\'}\\${dateItem.dateFolder || dateItem.dateLabel}`}>
                        {dateItem.datePath || `${activeCampaign.baseDirectory || 'F:\\'}\\${dateItem.dateFolder || dateItem.dateLabel}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-sans font-medium">Vault Archive Path:</span>
                      <span className="font-bold text-slate-950 truncate max-w-[190px]" title={dateItem.server_path || 'Pending upload'}>
                        {dateItem.server_path ? dateItem.server_path : 'Not Yet Uploaded'}
                      </span>
                    </div>
                    {isDone && (
                      <div className="flex justify-between text-emerald-800">
                        <span className="font-sans font-medium">Verified by:</span>
                        <span className="font-bold">@{dateItem.uploaded_by || 'admin'} • {new Date(dateItem.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">
                    Est. Size: <strong className="text-slate-950">{dateItem.file_size_gb || 40.0} GB</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {isDone ? (
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    ) : isAdmin ? (
                      <button
                        type="button"
                        onClick={() => handleAdminMarkUploaded(dateItem.dayNumber, dateItem.server_path)}
                        className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Uploaded (Admin)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenRequestModal(dateItem)}
                        className="px-3.5 py-2 rounded-xl text-xs font-black glass-button-primary flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Request Admin to Mark Done</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: User Request Upload Verification Modal */}
      {showRequestModal && requestTargetDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fadeIn text-left">
          <div className="w-full max-w-lg rounded-3xl border border-black/[0.08] bg-white shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-black/[0.06] bg-neutral-50/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-950 font-sans">
                  Request Upload Verification
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  {activeCampaign.name} — Day {requestTargetDate.dayNumber}
                </p>
              </div>
              <button 
                onClick={() => setShowRequestModal(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-neutral-800 font-bold mb-1">
                  Proposed Server Vault Directory / File Path
                </label>
                <input
                  type="text"
                  required
                  value={requestServerPath}
                  onChange={(e) => setRequestServerPath(e.target.value)}
                  placeholder="//aljamea-nas.local/Central_Vault/..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-neutral-950 font-medium focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-800 font-bold mb-1">
                    Uploaded File Size (GB)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={requestSizeGb}
                    onChange={(e) => setRequestSizeGb(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-neutral-950 font-medium focus:outline-none focus:border-neutral-950"
                  />
                </div>
                <div>
                  <label className="block text-neutral-800 font-bold mb-1">
                    Submitting Creator Handle
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`@${currentUser.username || 'creator'}`}
                    className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-xl font-mono text-neutral-600 font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-800 font-bold mb-1">
                  Notes for Admin Verification
                </label>
                <textarea
                  rows={3}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-950 font-medium focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-700 font-semibold hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold glass-button-primary shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request to Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Admin Create Safar Campaign Modal */}
      {showCreateModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fadeIn text-left">
          <div className="w-full max-w-lg rounded-3xl border border-black/[0.08] bg-white shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-black/[0.06] bg-neutral-50/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-950 font-sans">
                  Create New Safar Campaign (Admin)
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  Generate Safar dates matrix and server destination folder
                </p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaignSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-neutral-800 font-bold mb-1">
                  Safar Campaign Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Safar 1449 — Colombo"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-950 font-bold focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-800 font-bold mb-1">
                    Hijri Year
                  </label>
                  <input
                    type="text"
                    required
                    value={newHijri}
                    onChange={(e) => setNewHijri(e.target.value)}
                    placeholder="1449 H"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-neutral-950 font-bold focus:outline-none focus:border-neutral-950"
                  />
                </div>
                <div>
                  <label className="block text-neutral-800 font-bold mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Colombo"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-950 font-bold focus:outline-none focus:border-neutral-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-800 font-bold mb-1">
                    Venue / Complex
                  </label>
                  <input
                    type="text"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    placeholder="Saifee Masjid Complex"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-950 font-bold focus:outline-none focus:border-neutral-950"
                  />
                </div>
                <div>
                  <label className="block text-neutral-800 font-bold mb-1">
                    Total Recording Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={newTotalDays}
                    onChange={(e) => setNewTotalDays(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-neutral-950 font-bold focus:outline-none focus:border-neutral-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-800 font-bold mb-1">
                  Central Server Vault Destination Path
                </label>
                <input
                  type="text"
                  value={newServerDest}
                  onChange={(e) => setNewServerDest(e.target.value)}
                  placeholder="//aljamea-nas.local/Central_Vault"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-neutral-950 font-bold focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-700 font-semibold hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold glass-button-primary shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Create Campaign & Generate Dates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Safar Campaign Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-black/[0.08] bg-white shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-950">Edit Safar Campaign</h3>
                  <p className="text-xs text-neutral-500">Update event information and total days</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCampaignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-800 font-bold mb-1">
                  Campaign Title / Safar Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-950 font-bold focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-800 font-bold mb-1">
                    City / Destination
                  </label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-950 font-bold focus:outline-none focus:border-neutral-950"
                  />
                </div>
                <div>
                  <label className="block text-neutral-800 font-bold mb-1">
                    Hijri Year
                  </label>
                  <input
                    type="text"
                    required
                    value={editHijri}
                    onChange={(e) => setEditHijri(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-neutral-950 font-bold focus:outline-none focus:border-neutral-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-800 font-bold mb-1">
                    Venue / Complex
                  </label>
                  <input
                    type="text"
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-950 font-bold focus:outline-none focus:border-neutral-950"
                  />
                </div>
                <div>
                  <label className="block text-neutral-800 font-bold mb-1">
                    Total Recording Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={editTotalDays}
                    onChange={(e) => setEditTotalDays(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-neutral-950 font-bold focus:outline-none focus:border-neutral-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-800 font-bold mb-1">
                  Central Server Vault Destination Path
                </label>
                <input
                  type="text"
                  value={editServerDest}
                  onChange={(e) => setEditServerDest(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-neutral-950 font-bold focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-700 font-semibold hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold glass-button-primary shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Safar Campaign Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 border border-rose-200 bg-white shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Safar Campaign?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to delete <strong>{activeCampaign.name}</strong>? This removes all associated deliverable dates from AnyShare.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold glass-pill hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
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
