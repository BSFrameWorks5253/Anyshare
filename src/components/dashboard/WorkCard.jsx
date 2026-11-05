import React from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import StatusPill from '../common/StatusPill';
import SourceBadge from '../common/SourceBadge';
import {
  Play,
  FileSearch,
  AlertTriangle,
  Cpu,
  Clock,
  User,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

function timeAgo(dateString) {
  if (!dateString) return 'Never';
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
}

export default function WorkCard({
  item,
  onInspect,
  onStartRender,
  onReviewCorrection,
  onOpenMonitor
}) {
  const { users, currentUser, bridge } = useApp();

  const assignedUser = users.find(u => u.id === item.assigned_user_id);
  const isAssignedToCurrent = item.assigned_user_id === currentUser.id;
  const isEligibleForRender = item.status === 'ready_to_render';
  const isRendering = item.status === 'rendering';
  const isCorrection = item.status === 'correction_needed';
  const isChecking = item.status === 'checking';
  const progressPercent = item.evidence_summary?.render_progress || 0;

  return (
    <div className="production-card rounded-2xl p-5 border border-black/[0.07] relative overflow-hidden flex flex-col justify-between group bg-white/80 hover:bg-white backdrop-blur-xl shadow-xs hover:shadow-md transition-all duration-200 text-left">
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
          className="text-base font-bold text-neutral-950 group-hover:text-neutral-700 transition-colors line-clamp-2 cursor-pointer mb-1 leading-snug"
        >
          {item.display_label}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono font-medium text-neutral-500 truncate max-w-[220px]" title={item.external_key}>
            {item.external_key}
          </span>
          {item.is_stale && (
            <span className="text-[10px] font-bold text-neutral-700 bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded">
              Stale Scan
            </span>
          )}
        </div>

        {/* Evidence preview snippet */}
        <div className="rounded-xl p-3 mb-4 text-xs text-neutral-800 space-y-1.5 bg-neutral-50/80 border border-black/[0.05]">
          {item.evidence_summary?.project_file && (
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">Premiere Project:</span>
              <span className="font-mono text-neutral-900 truncate max-w-[160px] font-bold">
                {item.evidence_summary.project_file}
              </span>
            </div>
          )}

          {item.evidence_summary?.raw_clips_count !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">Raw Media Clips:</span>
              <span className="font-bold text-neutral-900">
                {item.evidence_summary.raw_clips_count} verified clips
              </span>
            </div>
          )}

          {item.evidence_summary?.rendered_file && (
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">Master Output:</span>
              <span className="font-mono text-emerald-800 font-bold truncate max-w-[160px]">
                {item.evidence_summary.rendered_file.split('/').pop()}
              </span>
            </div>
          )}

          {isCorrection && (
            <div className="text-rose-950 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              <p className="font-bold flex items-center gap-1.5 mb-0.5 text-rose-800">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                Action Required
              </p>
              <p className="text-[11px] text-rose-900 font-medium line-clamp-2">
                {item.evidence_summary?.issue_description || 'Preflight detected conflicting project files or missing assets.'}
              </p>
            </div>
          )}

          {/* Active rendering live progress */}
          {isRendering && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-neutral-900 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 animate-spin text-neutral-700" />
                  NVENC GPU Encoding
                </span>
                <span className="font-mono text-neutral-900">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className="h-full bg-neutral-950 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Checking status */}
          {isChecking && (
            <div className="flex items-center gap-2 text-xs text-neutral-700 py-1 font-semibold">
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-neutral-900 border-t-transparent" />
              <span>One Tap Bridge running preflight checks...</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom section: Assignee, Scan Time & Primary Button */}
      <div className="pt-3 border-t border-black/[0.06] space-y-3">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            {assignedUser?.avatar ? (
              <img
                src={assignedUser.avatar}
                alt={assignedUser.name}
                className="w-5 h-5 rounded-full object-cover border border-black/[0.08]"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] text-neutral-600">
                <User className="w-3 h-3" />
              </div>
            )}
            <span className={`truncate max-w-[110px] ${isAssignedToCurrent ? 'text-neutral-950 font-bold' : 'text-neutral-700 font-medium'}`}>
              {assignedUser ? assignedUser.name : 'Unassigned'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-500" title={`Last checked: ${item.last_scanned_at}`}>
            <Clock className="w-3 h-3 text-neutral-400" />
            <span>{timeAgo(item.last_scanned_at)}</span>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center gap-2">
          {/* 1. START RENDER (Apple Obsidian Primary button) */}
          {isEligibleForRender && (
            <button
              type="button"
              disabled={!bridge.is_online}
              onClick={() => {
                sounds.playTap();
                onStartRender(item);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold glass-button-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
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
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{currentUser?.is_admin ? 'Review & Correct' : 'View Issue'}</span>
            </button>
          )}

          {/* 3. RENDERING IN PROGRESS */}
          {isRendering && (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                if (onOpenMonitor) {
                  onOpenMonitor(item);
                } else {
                  onInspect(item);
                }
              }}
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-neutral-900 text-white flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Cpu className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Live Monitor</span>
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
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold glass-pill hover:bg-white text-neutral-800 flex items-center justify-center gap-2 transition-colors cursor-pointer border border-black/[0.08] shadow-2xs"
            >
              <FileSearch className="w-3.5 h-3.5 text-neutral-500" />
              <span>Inspect Details</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
