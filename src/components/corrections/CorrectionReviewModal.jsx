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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/40 backdrop-blur-md animate-fadeIn">
      <div 
        className="glass-panel w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl border border-rose-500/30 shadow-2xl flex flex-col overflow-hidden text-left bg-white/95"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#C5A059]/20 flex items-start justify-between gap-3 bg-gradient-to-r from-rose-50/70 to-amber-50/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-100 border border-rose-300 text-rose-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Admin Correction Review
              </h2>
              <p className="text-xs text-rose-700 font-mono truncate max-w-[260px] font-semibold">
                {item.display_label}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-[#C5A059]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Finding explanation */}
          <div className="bg-rose-50/80 border border-rose-300/60 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              One Tap Rule Finding
            </div>
            <p className="text-xs text-rose-900 leading-relaxed font-medium">
              {evidence.issue_description || 'Preflight checks detected ambiguous or conflicting file structures.'}
            </p>
            {evidence.rule_finding && (
              <div className="p-2.5 rounded-xl bg-white border border-rose-200 text-xs font-mono text-rose-800 shadow-sm">
                {evidence.rule_finding}
              </div>
            )}
          </div>

          {/* Action selection tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-amber-50/70 rounded-2xl border border-[#C5A059]/30">
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
                  : 'text-stone-600 hover:text-stone-900'
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
                  ? 'bg-[#997328] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Correct Status Manually
            </button>
          </div>

          {/* TAB 1: Confirm Details */}
          {actionTab === 'confirm' && (
            <div className="bg-white/80 rounded-2xl p-4 border border-[#C5A059]/20 space-y-3 text-xs text-stone-700">
              <p className="leading-relaxed">
                Confirming indicates you have manually verified the workstation folder assets and wish to approve this item as valid.
              </p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-500/25 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Next state will transition to: <strong>Ready to Render</strong></span>
              </div>
            </div>
          )}

          {/* TAB 2: Correct Status with Mandatory Reason */}
          {actionTab === 'correct' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Select Target Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-white border border-[#C5A059]/30 text-xs text-stone-900 rounded-xl p-2.5 focus:outline-none focus:border-[#C5A059]"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Mandatory Audit Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  rows={3}
                  placeholder="Explain why this status is being corrected (e.g., 'Deleted obsolete duplicate prproj and verified audio files on drive D')..."
                  className="w-full bg-white border border-[#C5A059]/30 text-xs text-stone-900 rounded-xl p-3 focus:outline-none focus:border-[#C5A059] placeholder-stone-400"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#C5A059]/20 bg-amber-50/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleRescan}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold glass-pill hover:bg-[#C5A059]/15 text-[#997328] flex items-center gap-1.5 cursor-pointer"
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
              className="px-4 py-2.5 rounded-xl text-xs font-semibold glass-pill hover:bg-stone-200 text-stone-700"
            >
              Cancel
            </button>

            {actionTab === 'confirm' ? (
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Finding</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCorrect}
                className="px-5 py-2.5 rounded-xl text-xs font-bold glass-button-primary text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
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
