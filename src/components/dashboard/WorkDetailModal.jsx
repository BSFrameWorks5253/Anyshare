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
  onReviewCorrection,
  onOpenMonitor
}) {
  const { events, users, currentUser, isAdmin, assignUser, adminMarkDone, triggerBridgeScan, bridge } = useApp();
  const [activeTab, setActiveTab] = useState('evidence');
  const [exceptionReason, setExceptionReason] = useState('');

  if (!isOpen || !item) return null;

  const itemEvents = events.filter(e => e.item_id === item.id);
  const assignedUser = users.find(u => u.id === item.assigned_user_id);

  const isEligibleForRender = item.status === 'ready_to_render';
  const isCorrection = item.status === 'correction_needed';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/40 backdrop-blur-md animate-fadeIn">
      <div 
        className="glass-panel w-full sm:max-w-2xl max-h-[90vh] sm:rounded-3xl rounded-t-3xl border border-[#C5A059]/40 shadow-2xl flex flex-col overflow-hidden text-left bg-[#FAF8F5]/95"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#C5A059]/20 flex items-start justify-between gap-3 shrink-0 bg-gradient-to-r from-amber-100/60 to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusPill status={item.status} size="sm" />
              <SourceBadge source={item.status_source} />
            </div>
            <h2 className="text-lg font-extrabold text-stone-900 leading-tight">
              {item.display_label}
            </h2>
            <div className="text-xs font-mono text-[#8B6508] font-bold mt-1">
              Key: {item.external_key}
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-200/50 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-5 pt-3 border-b border-[#C5A059]/15 gap-2 bg-amber-50/50 shrink-0">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setActiveTab('evidence');
            }}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'evidence'
                ? 'border-[#B8860B] text-[#8B6508]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
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
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-[#B8860B] text-[#8B6508]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
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
              className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'manage'
                  ? 'border-[#B8860B] text-[#8B6508]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B6508] mb-2">
                Provenance & Audit Trail
              </h4>
              {itemEvents.length === 0 ? (
                <p className="text-xs text-stone-500 py-4 text-center">No recorded events yet.</p>
              ) : (
                <div className="relative pl-6 space-y-4 border-l-2 border-amber-300 ml-2">
                  {itemEvents.map((evt) => (
                    <div key={evt.id} className="relative text-xs">
                      <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#D4AF37] ring-4 ring-white shadow-xs" />
                      
                      <div className="flex items-center justify-between text-stone-500 text-[11px] mb-1">
                        <span className="font-bold uppercase tracking-wider text-[#8B6508]">
                          {evt.event_type.replace('_', ' ')}
                        </span>
                        <span className="font-mono">{new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="glass-panel-subtle rounded-xl p-3 border border-[#C5A059]/25 bg-white/80">
                        <p className="text-stone-900 font-semibold mb-1">{evt.reason || 'Event recorded'}</p>
                        <div className="flex items-center gap-3 text-[11px] text-stone-500">
                          <span>Source: <strong className="text-stone-800 capitalize">{evt.source}</strong></span>
                          {evt.old_status && evt.new_status && (
                            <span>{evt.old_status} → <strong className="text-[#8B6508]">{evt.new_status}</strong></span>
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
              <div className="glass-panel-subtle rounded-xl p-4 border border-[#C5A059]/25 bg-white/80">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8B6508] mb-2">
                  Assign Production Lead
                </label>
                <select
                  value={item.assigned_user_id || ''}
                  onChange={(e) => assignUser(item.id, e.target.value)}
                  className="w-full bg-stone-50 border border-[#C5A059]/30 text-xs text-stone-800 rounded-xl p-2.5 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div className="glass-panel-subtle rounded-xl p-4 border border-[#C5A059]/25 flex items-center justify-between bg-white/80">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Workstation Folder Scan</h4>
                  <p className="text-[11px] text-stone-500">Request One Tap bridge to re-evaluate folder rules now</p>
                </div>
                <button
                  type="button"
                  onClick={() => triggerBridgeScan(item.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold glass-pill hover:bg-white text-[#8B6508] flex items-center gap-1.5 cursor-pointer border border-[#C5A059]/30"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#B8860B]" />
                  Scan Now
                </button>
              </div>

              <div className="glass-panel-subtle rounded-xl p-4 border border-[#C5A059]/25 space-y-3 bg-white/80">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Mark Production as Done</h4>
                  <p className="text-[11px] text-stone-500">
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
                      className="w-full bg-stone-50 border border-[#C5A059]/30 text-xs text-stone-800 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => adminMarkDone(item.id, exceptionReason)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
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
        <div className="p-4 border-t border-[#C5A059]/20 bg-stone-100/70 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-stone-600">
            Assigned: <strong className="text-stone-900">{assignedUser?.name || 'Unassigned'}</strong>
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
                className="py-2 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-amber-200 to-amber-300 text-stone-950 border border-amber-500/50 flex items-center gap-2 cursor-pointer shadow-sm animate-pulse"
              >
                <Cpu className="w-3.5 h-3.5 text-[#8A6614]" />
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
                className="py-2 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
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
              className="py-2 px-3.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white text-stone-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
