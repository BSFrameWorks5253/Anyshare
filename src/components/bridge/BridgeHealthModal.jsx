import React from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import {
  Cpu,
  X,
  Wifi,
  WifiOff,
  Activity,
  HardDrive,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Terminal
} from 'lucide-react';

export default function BridgeHealthModal({ isOpen, onClose }) {
  const { bridge, toggleBridgeOnline, triggerBridgeScan, isAdmin } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="glass-panel w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden text-left"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${
              bridge.is_online
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
            }`}>
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                One Tap Node Telemetry
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {bridge.label}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            bridge.is_online
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : 'bg-rose-500/10 border-rose-500/20'
          }`}>
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${bridge.is_online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <div>
                <h4 className={`text-sm font-bold ${bridge.is_online ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {bridge.is_online ? 'Bridge Connected & Listening' : 'Bridge Offline / Standby'}
                </h4>
                <p className="text-xs text-slate-400">
                  {bridge.is_online ? 'Claims render commands via outbound SSL' : 'Render requests will wait until bridge re-establishes'}
                </p>
              </div>
            </div>

            {/* Toggle Online/Offline for realistic testing */}
            <button
              type="button"
              onClick={toggleBridgeOnline}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                bridge.is_online
                  ? 'bg-rose-500/20 border-rose-500/30 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30'
              }`}
            >
              {bridge.is_online ? 'Simulate Disconnect' : 'Reconnect Bridge'}
            </button>
          </div>

          {/* Machine Specs & Metadata */}
          <div className="glass-panel-subtle rounded-2xl p-4 border border-white/10 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">One Tap App Version:</span>
              <span className="font-mono text-slate-200">{bridge.app_version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Workstation Hardware:</span>
              <span className="font-mono text-indigo-300 truncate max-w-[220px]" title={bridge.os}>
                {bridge.os}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">High-Speed NVMe Free:</span>
              <span className="font-mono text-emerald-300 font-semibold">
                {bridge.workstation_storage_free_gb} GB Available
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last Live Heartbeat:</span>
              <span className="font-mono text-slate-200">
                {bridge.last_heartbeat_at ? new Date(bridge.last_heartbeat_at).toLocaleTimeString() : 'Never'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last Folder Scan:</span>
              <span className="font-mono text-slate-200">
                {bridge.last_scan_at ? new Date(bridge.last_scan_at).toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>

          {/* Bridge Security Guarantee */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Security Architecture
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              The One Tap Bridge initiates outward polling to Supabase. No local ports or desktop services are exposed to the public internet. No raw media is transmitted.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between">
          <button
            type="button"
            onClick={() => triggerBridgeScan()}
            className="px-4 py-2 rounded-xl text-xs font-semibold glass-pill hover:bg-white/10 text-indigo-300 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Force Folder Rescan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold glass-pill hover:bg-white/10 text-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
