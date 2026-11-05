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
      <div className="glass-panel rounded-3xl p-6 border border-rose-500/25 relative overflow-hidden bg-rose-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Evidence Resolution Gateway
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300">
                  {correctionItems.length} Pending
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white">
                Admin Correction Queue
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                One Tap halted automatic progression because of ambiguous files, missing audio, or preflight failures. Deterministic safety protocol prohibits silent guesses. Review evidence and confirm or correct.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => triggerBridgeScan()}
            className="self-start sm:self-center px-4 py-2.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white/10 text-indigo-300 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Scan Workstation</span>
          </button>
        </div>
      </div>

      {/* List of items needing correction */}
      {correctionItems.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">All Clear! No Corrections Needed</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
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
                className="glass-panel rounded-2xl p-5 border border-rose-500/25 space-y-4 hover:border-rose-500/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <StatusPill status={item.status} size="sm" />
                      <span className="text-xs font-mono text-slate-400">{item.external_key}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{item.display_label}</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      onReviewItem(item);
                    }}
                    className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>{isAdmin ? 'Review & Resolve' : 'Inspect Details'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Conflict description */}
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200">
                  <div className="font-semibold mb-1 flex items-center gap-1.5 text-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
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
