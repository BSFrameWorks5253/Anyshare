import React from 'react';
import { useApp } from '../../lib/store';
import { Activity, AlertCircle, Wifi, WifiOff } from 'lucide-react';

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
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold glass-pill transition-all cursor-pointer hover:border-amber-400 text-stone-800 bg-white/80 border border-[#C5A059]/30"
      title={`Bridge: ${bridge.label} (${bridge.is_online ? 'Connected' : 'Offline'})`}
    >
      <span className="relative flex h-2 w-2">
        {bridge.is_online ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </>
        ) : (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        )}
      </span>

      <span className="flex items-center gap-1.5">
        {bridge.is_online ? (
          <span className="text-emerald-900 font-bold">Bridge Online</span>
        ) : (
          <span className="text-rose-800 font-bold">Bridge Offline</span>
        )}
      </span>

      {showDetail && (
        <span className="text-[10px] text-stone-500 border-l border-amber-300 pl-1.5 hidden sm:inline font-mono">
          Scan: {timeAgo(bridge.last_scan_at)}
        </span>
      )}
    </button>
  );
}
