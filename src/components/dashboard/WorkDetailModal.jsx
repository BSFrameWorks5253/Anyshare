import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import StatusPill from '../common/StatusPill';
import SourceBadge from '../common/SourceBadge';
import EvidencePanel from './EvidencePanel';
import { sounds } from '../../lib/sound';
import {
  X,
  History,
  Info,
  ShieldCheck,
  Play,
  AlertTriangle,
  User,
  Clock,
  Sparkles,
  RefreshCw,
  Check
} from 'lucide-react';

export default function WorkDetailModal({
  item,
  isOpen,
  onClose,
  onStartRender,
  onReviewCorrection
}) {
  const { events, users, currentUser, isAdmin, assignUser, adminMarkDone, triggerBridgeScan, bridge } = useApp();
  const [activeTab, setActiveTab] = useState('evidence'); // 'evidence' | 'timeline' | 'manage'
  const [exceptionReason, setExceptionReason] = useState('');
  const [showDoneConfirm, setShowDoneConfirm] = useState(false);

  if (!isOpen || !item) return null;

  // Filter events related to this item
  const itemEvents = events.filter(e => e.item_id === item.id);
  const assignedUser = users.find(u => u.id === item.assigned_user_id);

  const isEligibleForRender = item.status === 'ready_to_render';
  const isCorrection = item.status === 'correction_needed';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      {/* Container: Full-screen mobile bottom sheet / rounded modal on desktop */}
      <div 
        className="glass-panel w-full sm:max-w-2xl max-h-[90vh] sm:rounded-3xl rounded-t-3xl border border-white/15 shadow-2xl flex flex-col overflow-hidden text-left"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusPill status={item.status} size="sm" />
              <SourceBadge source={item.status_source} />
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">
              {item.display_label}
            </h2>
            <div className="text-xs font-mono text-indigo-300 mt-1">
              Key: {item.external_key}
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-5 pt-3 border-b border-white/5 gap-2 bg-slate-900/30 shrink-0">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setActiveTab('evidence');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'evidence'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Evidence & Checks
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setActiveTab('timeline');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            Audit Ledger ({itemEvents.length})
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setActiveTab('manage');
              }}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'manage'
                  ? 'border-indigo-500 text-indigo-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="w-4 h-4" />
              Admin Actions
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: Evidence */}
          {activeTab === 'evidence' && (
            <EvidencePanel item={item} />
          )}

          {/* TAB 2: Chronological Audit Trail */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Provenance & Audit Trail
              </h4>
              {itemEvents.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recorded events yet.</p>
              ) : (
                <div className="relative pl-6 space-y-4 border-l border-white/10 ml-2">
                  {itemEvents.map((evt) => (
                    <div key={evt.id} className="relative text-xs">
                      {/* Node bullet */}
                      <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-900" />
                      
                      <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                        <span className="font-semibold uppercase tracking-wider text-indigo-300">
                          {evt.event_type.replace('_', ' ')}
                        </span>
                        <span>{new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="glass-panel-subtle rounded-xl p-3 border border-white/10">
                        <p className="text-slate-200 font-medium mb-1">{evt.reason || 'Event recorded'}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span>Source: <strong className="text-slate-300 capitalize">{evt.source}</strong></span>
                          {evt.old_status && evt.new_status && (
                            <span>{evt.old_status} → <strong className="text-indigo-300">{evt.new_status}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Admin Actions */}
          {activeTab === 'manage' && isAdmin && (
            <div className="space-y-5">
              {/* Assignee Control */}
              <div className="glass-panel-subtle rounded-xl p-4 border border-white/10">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Assign Production Lead
                </label>
                <select
                  value={item.assigned_user_id || ''}
                  onChange={(e) => assignUser(item.id, e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              {/* Force Fresh Scan */}
              <div className="glass-panel-subtle rounded-xl p-4 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Workstation Folder Scan</h4>
                  <p className="text-[11px] text-slate-400">Request One Tap bridge to re-evaluate folder rules now</p>
                </div>
                <button
                  type="button"
                  onClick={() => triggerBridgeScan(item.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold glass-pill hover:bg-white/10 text-indigo-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Scan Now
                </button>
              </div>

              {/* Admin Mark Done */}
              <div className="glass-panel-subtle rounded-xl p-4 border border-white/10 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white">Mark Production as Done</h4>
                  <p className="text-[11px] text-slate-400">
                    One Tap lifecycle rule: all date folders must be verified uploaded/submitted, or an explicit exception reason must be recorded.
                  </p>
                </div>

                {item.status !== 'done' ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={exceptionReason}
                      onChange={(e) => setExceptionReason(e.target.value)}
                      placeholder="Optional Admin exception reason (if manual override)..."
                      className="w-full bg-slate-900 border border-white/10 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => adminMarkDone(item.id, exceptionReason)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/40 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Mark Done with Verification
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Item marked Done. Retention clock scheduled for 90 days.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Primary Trigger */}
        <div className="p-4 border-t border-white/10 bg-slate-900/50 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400">
            Assigned: <strong className="text-slate-200">{assignedUser?.name || 'Unassigned'}</strong>
          </div>

          <div className="flex items-center gap-2">
            {isEligibleForRender && (
              <button
                type="button"
                disabled={!bridge.is_online}
                onClick={() => {
                  sounds.playTap();
                  onClose();
                  onStartRender(item);
                }}
                className="py-2 px-4 rounded-xl text-xs font-bold glass-button-primary flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Render</span>
              </button>
            )}

            {isCorrection && (
              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  onClose();
                  onReviewCorrection(item);
                }}
                className="py-2 px-4 rounded-xl text-xs font-bold bg-rose-600/40 hover:bg-rose-600/60 text-white border border-rose-500/50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Review Correction</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              className="py-2 px-3.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white/10 text-slate-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
