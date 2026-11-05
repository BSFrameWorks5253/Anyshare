import React from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import StatusPill from '../common/StatusPill';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Edit3,
  RefreshCw,
  FolderTree,
  ArrowRight
} from 'lucide-react';

export default function CorrectionQueue({ onReviewItem }) {
  const { items, triggerBridgeScan, isAdmin } = useApp();

  const correctionItems = items.filter(i => i.status === 'correction_needed');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-rose-500/25 relative overflow-hidden bg-rose-50/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rose-100 border border-rose-300 text-rose-700 shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Evidence Resolution Gateway
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  {correctionItems.length} Pending
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-neutral-900">
                Admin Correction Queue
              </h2>
              <p className="text-xs text-neutral-600 mt-1 max-w-xl leading-relaxed">
                One Tap halted automatic progression because of ambiguous files, missing audio, or preflight failures. Deterministic safety protocol prohibits silent guesses. Review evidence and confirm or correct.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => triggerBridgeScan()}
            className="self-start sm:self-center px-4 py-2.5 rounded-xl text-xs font-semibold glass-pill hover:bg-[rgba(0,0,0,0.08)]/15 text-[#334155] flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Scan Workstation</span>
          </button>
        </div>
      </div>

      {/* List of items needing correction */}
      {correctionItems.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-[rgba(0,0,0,0.08)]/25 bg-white/80">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-500/25 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 mb-1">All Clear! No Corrections Needed</h3>
          <p className="text-xs text-neutral-600 max-w-sm mx-auto">
            All workstation folder structures and preflight checks match deterministic One Tap rules.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {correctionItems.map((item) => {
            const evidence = item.evidence_summary || {};
            return (
              <div
                key={item.id}
                className="glass-panel rounded-2xl p-5 border border-rose-300/60 bg-white/90 space-y-4 hover:border-rose-400 transition-colors shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <StatusPill status={item.status} size="sm" />
                      <span className="text-xs font-mono text-neutral-500">{item.external_key}</span>
                    </div>
                    <h3 className="text-base font-bold text-neutral-900">{item.display_label}</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      onReviewItem(item);
                    }}
                    className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>{isAdmin ? 'Review & Resolve' : 'Inspect Details'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Conflict description */}
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  <div className="font-semibold mb-1 flex items-center gap-1.5 text-rose-700">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Detected Issue:
                  </div>
                  <p>{evidence.issue_description || 'Preflight failure detected'}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
