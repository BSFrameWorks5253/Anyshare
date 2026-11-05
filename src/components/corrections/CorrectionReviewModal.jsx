import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { STAGE_CONFIG } from '../../lib/mockData';
import StatusPill from '../common/StatusPill';
import { sounds } from '../../lib/sound';
import {
  AlertTriangle,
  X,
  CheckCircle2,
  Edit3,
  RefreshCw,
  FileQuestion,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function CorrectionReviewModal({ item, isOpen, onClose }) {
  const { adminConfirmStatus, adminCorrectStatus, triggerBridgeScan, isAdmin } = useApp();
  const [selectedStatus, setSelectedStatus] = useState(item?.status || 'ready_to_render');
  const [reason, setReason] = useState('');
  const [actionTab, setActionTab] = useState('confirm'); // 'confirm' | 'correct'
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !item) return null;

  const evidence = item.evidence_summary || {};

  const handleConfirm = () => {
    adminConfirmStatus(item.id);
    onClose();
  };

  const handleCorrect = () => {
    if (!reason || reason.trim().length === 0) {
      setErrorMsg('A mandatory reason is required to correct a workflow state.');
      sounds.playAlert();
      return;
    }
    const res = adminCorrectStatus(item.id, selectedStatus, reason);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleRescan = () => {
    triggerBridgeScan(item.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="glass-panel w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl border border-rose-500/30 shadow-2xl flex flex-col overflow-hidden text-left"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-3 bg-rose-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Admin Correction Review
              </h2>
              <p className="text-xs text-rose-300 font-mono truncate max-w-[260px]">
                {item.display_label}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Finding explanation */}
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              One Tap Rule Finding
            </div>
            <p className="text-xs text-rose-200 leading-relaxed font-medium">
              {evidence.issue_description || 'Preflight checks detected ambiguous or conflicting file structures.'}
            </p>
            {evidence.rule_finding && (
              <div className="p-2.5 rounded-xl bg-black/50 border border-rose-500/20 text-xs font-mono text-rose-300">
                {evidence.rule_finding}
              </div>
            )}
          </div>

          {/* Action selection tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 rounded-2xl border border-white/5">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setActionTab('confirm');
                setErrorMsg('');
              }}
              className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                actionTab === 'confirm'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Confirm & Resolve
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setActionTab('correct');
                setErrorMsg('');
              }}
              className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                actionTab === 'correct'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Correct Status Manually
            </button>
          </div>

          {/* TAB 1: Confirm Details */}
          {actionTab === 'confirm' && (
            <div className="glass-panel-subtle rounded-2xl p-4 border border-white/10 space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed">
                Confirming indicates you have manually verified the workstation folder assets and wish to approve this item as valid.
              </p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Next state will transition to: <strong>Ready to Render</strong></span>
              </div>
            </div>
          )}

          {/* TAB 2: Correct Status with Mandatory Reason */}
          {actionTab === 'correct' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Select Target Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="pending_edit_1">Pending Edit 1</option>
                  <option value="edit_1">Edit 1</option>
                  <option value="pending_edit_2">Pending Edit 2</option>
                  <option value="edit_2">Edit 2</option>
                  <option value="ready_to_render">Ready to Render</option>
                  <option value="pending_upload">Pending Upload</option>
                  <option value="uploaded">Uploaded</option>
                  <option value="given_to_jamey">Given to Jamey</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Mandatory Audit Reason <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  rows={3}
                  placeholder="Explain why this status is being corrected (e.g., 'Deleted obsolete duplicate prproj and verified audio files on drive D')..."
                  className="w-full bg-slate-900 border border-white/10 text-xs text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleRescan}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white/10 text-indigo-300 flex items-center gap-1.5 cursor-pointer"
            title="Request fresh scan from One Tap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Request Scan</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white/10 text-slate-300"
            >
              Cancel
            </button>

            {actionTab === 'confirm' ? (
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Finding</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCorrect}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Apply Correction</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
