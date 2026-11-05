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
  const isDone = item.status === 'done';

  const progressPercent = item.evidence_summary?.render_progress || 0;

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden flex flex-col justify-between group">
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
          className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 cursor-pointer mb-1 leading-snug"
        >
          {item.display_label}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono text-slate-400 truncate max-w-[220px]" title={item.external_key}>
            {item.external_key}
          </span>
          {item.is_stale && (
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
              Stale Scan
            </span>
          )}
        </div>

        {/* Evidence preview snippet */}
        <div className="glass-panel-subtle rounded-xl p-3 mb-4 text-xs text-slate-300 space-y-1.5">
          {item.evidence_summary?.project_file && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Premiere Project:</span>
              <span className="font-mono text-slate-200 truncate max-w-[160px]">
                {item.evidence_summary.project_file}
              </span>
            </div>
          )}

          {item.evidence_summary?.raw_clips_count !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Raw Media Clips:</span>
              <span className="font-semibold text-slate-200">
                {item.evidence_summary.raw_clips_count} verified clips
              </span>
            </div>
          )}

          {item.evidence_summary?.rendered_file && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Master Output:</span>
              <span className="font-mono text-emerald-300 truncate max-w-[160px]">
                {item.evidence_summary.rendered_file.split('/').pop()}
              </span>
            </div>
          )}

          {isCorrection && (
            <div className="text-rose-300 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
              <p className="font-semibold flex items-center gap-1.5 mb-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                Action Required
              </p>
              <p className="text-[11px] text-rose-200 line-clamp-2">
                {item.evidence_summary?.issue_description || 'Preflight detected conflicting project files or missing assets.'}
              </p>
            </div>
          )}

          {/* Active rendering live progress */}
          {isRendering && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-amber-300 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  NVENC GPU Encoding
                </span>
                <span className="font-mono text-amber-200">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Checking status */}
          {isChecking && (
            <div className="flex items-center gap-2 text-xs text-indigo-300 py-1">
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-indigo-400 border-t-transparent" />
              <span>One Tap Bridge running preflight checks...</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom section: Assignee, Scan Time & Primary Button */}
      <div className="pt-3 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          {/* Assigned user avatar & name */}
          <div className="flex items-center gap-2">
            {assignedUser?.avatar ? (
              <img
                src={assignedUser.avatar}
                alt={assignedUser.name}
                className="w-5 h-5 rounded-full object-cover border border-white/20"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-300">
                <User className="w-3 h-3" />
              </div>
            )}
            <span className={`truncate max-w-[110px] ${isAssignedToCurrent ? 'text-indigo-300 font-semibold' : 'text-slate-300'}`}>
              {assignedUser ? assignedUser.name : 'Unassigned'}
            </span>
          </div>

          {/* Freshness / Scan age */}
          <div className="flex items-center gap-1 text-[11px]" title={`Last checked: ${item.last_scanned_at}`}>
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{timeAgo(item.last_scanned_at)}</span>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center gap-2">
          {/* 1. START RENDER (The prominent One Tap mobile trigger) */}
          {isEligibleForRender && (
            <button
              type="button"
              disabled={!bridge.is_online}
              onClick={() => {
                sounds.playTap();
                onStartRender(item);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold glass-button-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:border-slate-700"
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
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 animate-pulse" />
              <span>View Progress</span>
            </button>
          )}

          {/* 4. COMPLETED OR OTHER STAGE */}
          {!isEligibleForRender && !isCorrection && !isRendering && (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onInspect(item);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold glass-pill hover:bg-white/10 text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FileSearch className="w-3.5 h-3.5 text-indigo-400" />
              <span>Inspect Details</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
