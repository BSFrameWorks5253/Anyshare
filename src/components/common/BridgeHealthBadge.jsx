import React from 'react';
import { useApp } from '../../lib/store';

export default function BridgeHealthBadge({ onClick, showDetail = false }) {
  const { bridge } = useApp();

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Never';
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 shadow-2xs"
      title={`Workstation: ${bridge.label} (${bridge.is_online ? 'Connected' : 'Offline'})`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {bridge.is_online ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </>
        ) : (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400" />
        )}
      </span>

      <span className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
        <span>{bridge.is_online ? 'Node Online' : 'Node Offline'}</span>
      </span>

      {showDetail && (
        <span className="text-[10px] text-slate-400 border-l border-slate-200 pl-1.5 hidden xl:inline font-mono">
          {timeAgo(bridge.last_scan_at)}
        </span>
      )}
    </button>
  );
}
