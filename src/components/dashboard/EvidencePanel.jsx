import React from 'react';
import SourceBadge from '../common/SourceBadge';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FolderTree,
  FileCode,
  Cpu,
  Clock,
  HardDrive,
  FileCheck
} from 'lucide-react';

export default function EvidencePanel({ item }) {
  if (!item) return null;

  const evidence = item.evidence_summary || {};
  const checks = evidence.preflight_results?.checks || [];

  return (
    <div className="space-y-4">
      {/* Rule header card */}
      <div className="glass-panel-subtle rounded-xl p-4 border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Rule Identifier</span>
          <span className="text-xs font-mono text-indigo-300 font-semibold">
            {item.rule_id || 'onetap_canonical_v2'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Rule Engine Version</span>
          <span className="text-xs font-mono text-slate-300">
            One Tap {item.rule_version || '2.4.1'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Scan Timestamp</span>
          <span className="text-xs font-mono text-slate-300">
            {item.last_scanned_at ? new Date(item.last_scanned_at).toLocaleString() : 'Pending'}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <span className="text-xs text-slate-400">Provenance</span>
          <SourceBadge source={item.status_source} />
        </div>
      </div>

      {/* Preflight Checks Breakdown */}
      {checks.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Local Preflight Verifications
          </h4>
          <div className="space-y-2">
            {checks.map((check) => (
              <div
                key={check.id}
                className={`p-3 rounded-xl border flex items-start gap-3 ${
                  check.passed
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                }`}
              >
                {check.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <div className="font-semibold text-slate-200">{check.name}</div>
                  <div className="text-slate-400 mt-0.5 font-mono">{check.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matched safe folders list */}
      {evidence.matched_folders && evidence.matched_folders.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
            Verified Folder Structures
          </h4>
          <div className="glass-panel-subtle rounded-xl p-3 border border-white/10 space-y-1.5">
            {evidence.matched_folders.map((folder, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <span className="text-indigo-400">✓</span>
                <span className="truncate">{folder}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output verification record if rendered */}
      {evidence.rendered_file && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5" />
            Verified Output Artifact
          </h4>
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 text-xs space-y-1.5 font-mono">
            <div className="text-emerald-200 break-all font-semibold">{evidence.rendered_file}</div>
            {evidence.checksum && (
              <div className="text-slate-400 text-[11px]">Checksum: {evidence.checksum}</div>
            )}
            {evidence.file_size_gb && (
              <div className="text-slate-400 text-[11px]">Master Size: {evidence.file_size_gb} GB</div>
            )}
          </div>
        </div>
      )}

      {/* Issue details if correction needed */}
      {evidence.issue_description && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-xs mb-1">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Preflight Failure Summary
          </div>
          <p className="text-xs text-rose-200 mb-2 leading-relaxed">
            {evidence.issue_description}
          </p>
          {evidence.rule_finding && (
            <div className="p-2.5 rounded-lg bg-black/40 border border-rose-500/20 text-[11px] font-mono text-rose-300">
              {evidence.rule_finding}
            </div>
          )}
          {evidence.recommended_action && (
            <p className="text-[11px] text-amber-300 mt-2 font-medium">
              💡 Action: {evidence.recommended_action}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
