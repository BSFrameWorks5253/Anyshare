import React from 'react';
import { useApp } from '../../lib/store';
import StatusPill from '../common/StatusPill';
import SourceBadge from '../common/SourceBadge';
import { sounds } from '../../lib/sound';
import {
  Play,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Clock,
  Sparkles,
  User,
  ArrowRight
} from 'lucide-react';

export default function WorkCard({ item, onInspect, onStartRender, onReviewCorrection }) {
  const { users, bridge, isAdmin, currentUser } = useApp();

  const assignedUser = users.find(u => u.id === item.assigned_user_id);
  const isAssignedToCurrent = currentUser.id === item.assigned_user_id;

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Never';
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const isEligibleForRender = item.status === 'ready_to_render';
  const isRendering = item.status === 'rendering';
  const isChecking = item.status === 'checking' || item.status === 'render_requested';
  const isCorrection = item.status === 'correction_needed';

  const progressPercent = item.evidence_summary?.render_progress || 0;

  return (
    <div className="glass-card rounded-2xl p-5 border border-[#C5A059]/25 relative overflow-hidden flex flex-col justify-between group bg-white/80 shadow-sm hover:shadow-md transition-all">
      {/* Top row: Status & Source */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <StatusPill status={item.status} size="sm" />
          <SourceBadge source={item.status_source} />
        </div>

        {/* Title & Stable key */}
        <h3 
          onClick={() => {
            sounds.playTap();
            onInspect(item);
          }}
          className="text-base font-extrabold text-stone-900 group-hover:text-[#996515] transition-colors line-clamp-2 cursor-pointer mb-1 leading-snug"
        >
          {item.display_label}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono text-stone-500 truncate max-w-[220px]" title={item.external_key}>
            {item.external_key}
          </span>
          {item.is_stale && (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
              Stale Scan
            </span>
          )}
        </div>

        {/* Evidence preview snippet */}
        <div className="glass-panel-subtle rounded-xl p-3 mb-4 text-xs text-stone-700 space-y-1.5 bg-amber-50/40 border border-[#C5A059]/15">
          {item.evidence_summary?.project_file && (
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Premiere Project:</span>
              <span className="font-mono text-stone-800 truncate max-w-[160px] font-medium">
                {item.evidence_summary.project_file}
              </span>
            </div>
          )}

          {item.evidence_summary?.raw_clips_count !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Raw Media Clips:</span>
              <span className="font-semibold text-stone-800">
                {item.evidence_summary.raw_clips_count} verified clips
              </span>
            </div>
          )}

          {item.evidence_summary?.rendered_file && (
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Master Output:</span>
              <span className="font-mono text-emerald-800 font-semibold truncate max-w-[160px]">
                {item.evidence_summary.rendered_file.split('/').pop()}
              </span>
            </div>
          )}

          {isCorrection && (
            <div className="text-rose-900 bg-rose-50 p-2.5 rounded-lg border border-rose-300">
              <p className="font-bold flex items-center gap-1.5 mb-0.5 text-rose-800">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                Action Required
              </p>
              <p className="text-[11px] text-rose-800 line-clamp-2">
                {item.evidence_summary?.issue_description || 'Preflight detected conflicting project files or missing assets.'}
              </p>
            </div>
          )}

          {/* Active rendering live progress */}
          {isRendering && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-amber-800 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  NVENC GPU Encoding
                </span>
                <span className="font-mono text-amber-900">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden border border-amber-300/40">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Checking status */}
          {isChecking && (
            <div className="flex items-center gap-2 text-xs text-amber-800 py-1 font-semibold">
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-amber-600 border-t-transparent" />
              <span>One Tap Bridge running preflight checks...</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom section: Assignee, Scan Time & Primary Button */}
      <div className="pt-3 border-t border-[#C5A059]/20 space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            {assignedUser?.avatar ? (
              <img
                src={assignedUser.avatar}
                alt={assignedUser.name}
                className="w-5 h-5 rounded-full object-cover border border-amber-300"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-[10px] text-stone-600">
                <User className="w-3 h-3" />
              </div>
            )}
            <span className={`truncate max-w-[110px] ${isAssignedToCurrent ? 'text-amber-900 font-bold' : 'text-stone-700'}`}>
              {assignedUser ? assignedUser.name : 'Unassigned'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px]" title={`Last checked: ${item.last_scanned_at}`}>
            <Clock className="w-3 h-3 text-stone-400" />
            <span>{timeAgo(item.last_scanned_at)}</span>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center gap-2">
          {/* 1. START RENDER (Islamic Royal Gold button) */}
          {isEligibleForRender && (
            <button
              type="button"
              disabled={!bridge.is_online}
              onClick={() => {
                sounds.playTap();
                onStartRender(item);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold glass-button-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title={!bridge.is_online ? 'Disabled: One Tap Bridge workstation is offline' : 'Start One Tap Render'}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{!bridge.is_online ? 'Bridge Offline' : 'Start Render'}</span>
            </button>
          )}

          {/* 2. CORRECTION NEEDED REVIEW */}
          {isCorrection && (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onReviewCorrection(item);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Review & Correct' : 'View Issue'}</span>
            </button>
          )}

          {/* 3. RENDERING IN PROGRESS */}
          {isRendering && (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onInspect(item);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 animate-pulse text-amber-700" />
              <span>View Progress</span>
            </button>
          )}

          {/* 4. COMPLETED OR INSPECT */}
          {!isEligibleForRender && !isCorrection && !isRendering && (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onInspect(item);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold glass-pill hover:bg-white text-stone-800 flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#C5A059]/30"
            >
              <FileSearch className="w-3.5 h-3.5 text-[#B8860B]" />
              <span>Inspect Details</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
