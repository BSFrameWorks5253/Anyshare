import React from 'react';
import SourceBadge from '../common/SourceBadge';
import {
  CheckCircle2,
  XCircle,
  FolderTree,
  FileCheck
} from 'lucide-react';

export default function EvidencePanel({ item }) {
  if (!item) return null;

  const evidence = item.evidence_summary || {};
  const checks = evidence.preflight_results?.checks || [];

  return (
    <div className="space-y-4 text-left">
      {/* Rule header card */}
      <div className="rounded-xl p-4 border border-black/[0.06] space-y-2 bg-neutral-50/80">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500 font-medium">Rule Identifier</span>
          <span className="text-xs font-mono text-neutral-900 font-bold">
            {item.rule_id || 'onetap_canonical_v2'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500 font-medium">Rule Engine Version</span>
          <span className="text-xs font-mono text-neutral-800 font-semibold">
            One Tap {item.rule_version || '2.4.1'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500 font-medium">Scan Timestamp</span>
          <span className="text-xs font-mono text-neutral-800">
            {item.last_scanned_at ? new Date(item.last_scanned_at).toLocaleString() : 'Pending'}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-black/[0.05]">
          <span className="text-xs text-neutral-500 font-medium">Provenance</span>
          <SourceBadge source={item.status_source} />
        </div>
      </div>

      {/* Preflight Checks Breakdown */}
      {checks.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
            Local Preflight Verifications
          </h4>
          <div className="space-y-2">
            {checks.map((check) => (
              <div
                key={check.id}
                className={`p-3 rounded-xl border flex items-start gap-3 ${
                  check.passed
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                {check.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <div className="font-bold text-neutral-900">{check.name}</div>
                  <div className="text-neutral-600 mt-0.5 font-mono">{check.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matched safe folders list */}
      {evidence.matched_folders && evidence.matched_folders.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-neutral-600" />
            Verified Folder Structures
          </h4>
          <div className="rounded-xl p-3 border border-black/[0.06] space-y-1.5 bg-neutral-50/80">
            {evidence.matched_folders.map((folder, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-mono text-neutral-800">
                <span className="text-neutral-900 font-bold">✓</span>
                <span className="truncate">{folder}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output verification record if rendered */}
      {evidence.rendered_file && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Output Artifact
          </h4>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-1.5 font-mono">
            <div className="text-emerald-950 break-all font-bold">{evidence.rendered_file}</div>
            {evidence.checksum && (
              <div className="text-neutral-600 text-[11px]">Checksum: {evidence.checksum}</div>
            )}
            {evidence.file_size_gb && (
              <div className="text-neutral-600 text-[11px]">Size: {evidence.file_size_gb} GB</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
