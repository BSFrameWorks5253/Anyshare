import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import StatusPill from '../common/StatusPill';
import SourceBadge from '../common/SourceBadge';
import EvidencePanel from './EvidencePanel';
import {
  X,
  Play,
  FileCheck,
  AlertTriangle,
  History,
  ShieldCheck,
  Info,
  Clock,
  Sparkles,
  Check,
  RefreshCw,
  Cpu
} from 'lucide-react';

export default function WorkDetailModal({
  item,
  isOpen,
  onClose,
  onStartRender,
  onReviewCorrection,
  onOpenMonitor
}) {
  const { users, currentUser, events, assignUser, adminMarkDone, triggerBridgeScan, bridge } = useApp();
  const [activeTab, setActiveTab] = useState('evidence'); // 'evidence' | 'timeline' | 'manage'
  const [exceptionReason, setExceptionReason] = useState('');

  if (!isOpen || !item) return null;

  const assignedUser = users.find(u => u.id === item.assigned_user_id);
  const isAdmin = currentUser.role === 'admin';
  const isEligibleForRender = item.status === 'ready_to_render';
  const isCorrection = item.status === 'correction_needed';

  const itemEvents = events.filter(e => e.item_id === item.id);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full sm:max-w-2xl max-h-[90vh] sm:rounded-3xl rounded-t-3xl border border-black/[0.08] shadow-2xl flex flex-col overflow-hidden text-left bg-white/95"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-black/[0.06] flex items-start justify-between gap-3 shrink-0 bg-neutral-50/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusPill status={item.status} size="sm" />
              <SourceBadge source={item.status_source} />
            </div>
            <h2 className="text-lg font-bold text-neutral-950 leading-tight">
              {item.display_label}
            </h2>
            <div className="text-xs font-mono text-neutral-500 font-semibold mt-1">
              Key: {item.external_key}
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200/50 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-5 pt-3 border-b border-black/[0.06] gap-2 bg-neutral-50/50 shrink-0">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setActiveTab('evidence');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'evidence'
                ? 'border-neutral-950 text-neutral-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
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
                ? 'border-neutral-950 text-neutral-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
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
                  ? 'border-neutral-950 text-neutral-950 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Info className="w-4 h-4" />
              Admin Actions
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'evidence' && (
            <EvidencePanel item={item} />
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Provenance & Audit Trail
              </h4>
              {itemEvents.length === 0 ? (
                <p className="text-xs text-neutral-500 py-4 text-center">No recorded events yet.</p>
              ) : (
                <div className="relative pl-6 space-y-4 border-l-2 border-neutral-200 ml-2">
                  {itemEvents.map((evt) => (
                    <div key={evt.id} className="relative text-xs">
                      <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-neutral-900 ring-4 ring-white shadow-2xs" />
                      
                      <div className="flex items-center justify-between text-neutral-500 text-[11px] mb-1">
                        <span className="font-bold uppercase tracking-wider text-neutral-700">
                          {evt.event_type.replace('_', ' ')}
                        </span>
                        <span className="font-mono">{new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="rounded-xl p-3 border border-black/[0.06] bg-neutral-50">
                        <p className="text-neutral-900 font-semibold mb-1">{evt.reason || 'Event recorded'}</p>
                        <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                          <span>Source: <strong className="text-neutral-800 capitalize">{evt.source}</strong></span>
                          {evt.old_status && evt.new_status && (
                            <span>{evt.old_status} → <strong className="text-neutral-950">{evt.new_status}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'manage' && isAdmin && (
            <div className="space-y-5">
              <div className="rounded-xl p-4 border border-black/[0.06] bg-neutral-50">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Assign Production Lead
                </label>
                <select
                  value={item.assigned_user_id || ''}
                  onChange={(e) => assignUser(item.id, e.target.value)}
                  className="w-full bg-white border border-neutral-300 text-xs text-neutral-800 rounded-xl p-2.5 focus:outline-none focus:border-neutral-950 font-medium cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl p-4 border border-black/[0.06] flex items-center justify-between bg-neutral-50">
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Workstation Folder Scan</h4>
                  <p className="text-[11px] text-neutral-500">Request One Tap bridge to re-evaluate folder rules now</p>
                </div>
                <button
                  type="button"
                  onClick={() => triggerBridgeScan(item.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold glass-pill hover:bg-white text-neutral-800 flex items-center gap-1.5 cursor-pointer border border-black/[0.08]"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-600" />
                  Scan Now
                </button>
              </div>

              <div className="rounded-xl p-4 border border-black/[0.06] space-y-3 bg-neutral-50">
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Mark Production as Done</h4>
                  <p className="text-[11px] text-neutral-500">
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
                      className="w-full bg-white border border-neutral-300 text-xs text-neutral-800 rounded-xl p-2.5 focus:outline-none focus:border-neutral-950"
                    />
                    <button
                      type="button"
                      onClick={() => adminMarkDone(item.id, exceptionReason)}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Mark Done with Verification
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 p-2.5 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Item marked Done. Retention clock scheduled for 90 days.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-black/[0.06] bg-neutral-100/70 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-neutral-600">
            Assigned: <strong className="text-neutral-900">{assignedUser?.name || 'Unassigned'}</strong>
          </div>

          <div className="flex items-center gap-2">
            {item.status === 'rendering' && (
              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  onClose();
                  if (onOpenMonitor) onOpenMonitor(item);
                }}
                className="py-2 px-4 rounded-xl text-xs font-bold bg-neutral-950 text-white flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Cpu className="w-3.5 h-3.5 text-white animate-spin" />
                <span>Live Monitor</span>
              </button>
            )}

            {isEligibleForRender && (
              <button
                type="button"
                disabled={!bridge.is_online}
                onClick={() => {
                  sounds.playTap();
                  onClose();
                  onStartRender(item);
                }}
                className="py-2 px-4 rounded-xl text-xs font-semibold glass-button-primary flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
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
                className="py-2 px-4 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Review Issue</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
