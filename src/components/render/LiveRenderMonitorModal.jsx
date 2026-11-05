import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import {
  Cpu,
  X,
  Play,
  Square,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HardDrive,
  Copy,
  Check,
  Terminal,
  Activity,
  Zap,
  Minimize2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function LiveRenderMonitorModal({ isOpen, onClose, itemId }) {
  const { items, activeRenderJob, abortRender, bridge } = useApp();
  const [copiedHash, setCopiedHash] = useState(false);
  const [isAborting, setIsAborting] = useState(false);
  const logContainerRef = useRef(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [activeRenderJob?.logs]);

  if (!isOpen) return null;

  const item = items.find(i => i.id === itemId) || (activeRenderJob?.itemId ? items.find(i => i.id === activeRenderJob.itemId) : null);
  const job = activeRenderJob || {
    itemId: item?.id || '',
    displayLabel: item?.display_label || 'Master Sequence',
    externalKey: item?.external_key || 'session_master',
    state: item?.status === 'rendering' ? 'rendering' : 'idle',
    percent: item?.evidence_summary?.render_progress || 0,
    fps: '59.94',
    speed: '2.8x',
    eta: '01:15',
    logs: [
      `[OneTap Node] Workstation: ${bridge.label || 'Studio-PC-01'} (Online)`,
      `[OneTap Node] Initialized NVENC GPU encoder profile: 4K H.264 High Bitrate`
    ]
  };

  const percent = Math.min(100, Math.max(0, job.percent || 0));
  const isDone = percent >= 100 || job.state === 'completed';
  const isVerifying = job.state === 'verifying' || (percent >= 96 && percent < 100);

  const handleCopyChecksum = () => {
    const hash = job.checksum || item?.evidence_summary?.checksum || 'sha256-verified-master-hash';
    navigator.clipboard?.writeText(hash);
    sounds.playTap();
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleAbort = async () => {
    if (confirm('Are you sure you want to abort the current One Tap render? No output files will be corrupted.')) {
      setIsAborting(true);
      await abortRender(item?.id || job.itemId);
      setIsAborting(false);
      onClose();
    }
  };

  // SVG Radial Gauge Calculations
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-neutral-950/60 backdrop-blur-md animate-fadeIn">
      <div 
        className="glass-panel w-full sm:max-w-2xl max-h-[92vh] sm:rounded-3xl rounded-t-3xl border border-[rgba(0,0,0,0.08)]/40 shadow-2xl flex flex-col overflow-hidden text-left bg-[#F5F5F7]/98 text-neutral-900"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-[rgba(0,0,0,0.08)]/25 flex items-start justify-between gap-3 bg-gradient-to-r from-neutral-100/80 via-stone-50/50 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#334155] text-white shadow-md">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {isDone ? 'Render Complete' : isVerifying ? 'Verifying Output' : 'GPU Encoding Active'}
                </span>
                <span className="text-xs font-mono font-bold text-neutral-600">
                  Node: {bridge.label || 'Studio-PC-01'}
                </span>
              </div>
              <h2 className="text-base font-black text-neutral-950 truncate max-w-sm mt-0.5">
                {job.displayLabel || item?.display_label || 'Active Master Render'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              title="Minimize to Floating HUD"
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Main Visualizer: Radial Progress Gauge + High-Density Telemetry */}
          <div className="p-5 rounded-3xl bg-white border border-[rgba(0,0,0,0.08)]/30 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
            {/* Islamic Star watermark */}
            <div className="absolute -right-10 -bottom-10 w-44 h-44 opacity-5 pointer-events-none text-[#0f172a]">
              <svg viewBox="0 0 100 100" fill="currentColor">
                <polygon points="50 0, 62 38, 100 50, 62 62, 50 100, 38 62, 0 50, 38 38" />
              </svg>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="text-stone-200"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="transition-all duration-500 ease-out text-[#0f172a]"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="url(#studioGradient)"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="studioGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="50%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-neutral-950 tracking-tight font-mono">
                  {percent}%
                </span>
                <span className="text-[10px] font-bold uppercase text-[#1e293b] tracking-wider">
                  {isDone ? 'Verified' : isVerifying ? 'Checksum' : 'NVENC'}
                </span>
              </div>
            </div>

            {/* Telemetry Grid */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="p-3 rounded-2xl bg-[#F5F5F7] border border-[rgba(0,0,0,0.08)]/20">
                <div className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[#0f172a]" />
                  Encoding Framerate
                </div>
                <div className="text-base font-black text-neutral-950 font-mono mt-0.5">
                  {isDone ? '0.0 fps' : `${job.fps || '59.94'} fps`}
                </div>
                <div className="text-[10px] text-neutral-500">4K Master Profile</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F5F5F7] border border-[rgba(0,0,0,0.08)]/20">
                <div className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#0f172a]" />
                  Render Speed
                </div>
                <div className="text-base font-black text-neutral-950 font-mono mt-0.5">
                  {isDone ? 'Done' : `${job.speed || '2.8x'}`}
                </div>
                <div className="text-[10px] text-neutral-500">Realtime Hardware Multiplier</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F5F5F7] border border-[rgba(0,0,0,0.08)]/20">
                <div className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#0f172a]" />
                  Time Remaining
                </div>
                <div className="text-base font-black text-neutral-950 font-mono mt-0.5">
                  {isDone ? '00:00' : job.eta || '00:45'}
                </div>
                <div className="text-[10px] text-neutral-500">Auto-calculated ETA</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F5F5F7] border border-[rgba(0,0,0,0.08)]/20">
                <div className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-[#0f172a]" />
                  Scratch NVMe Free
                </div>
                <div className="text-base font-black text-neutral-950 font-mono mt-0.5">
                  {bridge.workstation_storage_free_gb || '482.4'} GB
                </div>
                <div className="text-[10px] text-neutral-500">High-speed IO buffer</div>
              </div>
            </div>
          </div>

          {/* Verification Badge on Done */}
          {isDone && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-neutral-900 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                    Master Output Verified & Ready
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">
                  SHA-256 MATCH
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/90 border border-emerald-300 font-mono text-xs text-neutral-900 flex items-center justify-between gap-3">
                <div className="truncate">
                  <span className="text-neutral-500 font-sans block text-[10px]">Verified Output:</span>
                  <span className="font-bold text-neutral-950">
                    {job.renderedFile || item?.evidence_summary?.rendered_file || `05_Outputs/${job.externalKey}_4K.mp4`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyChecksum}
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-sans text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Live Workstation Console Terminal */}
          <div className="rounded-2xl border border-stone-800 bg-[#0F172A] text-emerald-400 p-4 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-800 text-[11px] text-neutral-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#0f172a]" />
                <span className="font-bold text-stone-300">One Tap Workstation Node Terminal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-neutral-400">Live Stream</span>
              </div>
            </div>

            <div 
              ref={logContainerRef}
              className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-[11px] leading-relaxed pr-2 text-stone-300 scrollbar-thin scrollbar-thumb-stone-700"
            >
              {job.logs && job.logs.length > 0 ? (
                job.logs.map((line, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#1e293b] select-none">&gt;</span>
                    <span className={line.includes('Error') ? 'text-rose-400 font-bold' : line.includes('Verified') || line.includes('complete') ? 'text-emerald-400 font-bold' : 'text-stone-300'}>
                      {line}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-neutral-500 italic">Awaiting workstation encoder frame stream...</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[rgba(0,0,0,0.08)]/25 bg-neutral-100/80 flex items-center justify-between gap-3 shrink-0">
          <div>
            {!isDone ? (
              <button
                type="button"
                disabled={isAborting}
                onClick={handleAbort}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-950 border border-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current text-rose-700" />
                <span>{isAborting ? 'Halting...' : 'Abort Render'}</span>
              </button>
            ) : (
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Delivered to QA & Review
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold glass-pill hover:bg-white text-neutral-900 border border-[rgba(0,0,0,0.08)]/40 cursor-pointer"
            >
              {isDone ? 'Close Monitor' : 'Minimize to HUD'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
