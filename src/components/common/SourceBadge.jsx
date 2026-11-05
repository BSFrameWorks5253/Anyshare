import React from 'react';
import { Cpu, CheckCircle2, Edit3, Shield } from 'lucide-react';

export default function SourceBadge({ source }) {
  if (source === 'onetap_detected' || source === 'onetap') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
        <Cpu className="w-3 h-3 text-indigo-400" />
        Detected by One Tap
      </span>
    );
  }

  if (source === 'admin_confirmed') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        Admin Confirmed
      </span>
    );
  }

  if (source === 'admin_corrected') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
        <Edit3 className="w-3 h-3 text-amber-400" />
        Admin Corrected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800/40 border border-slate-700/50 px-2 py-0.5 rounded-md">
      <Shield className="w-3 h-3 text-slate-400" />
      System
    </span>
  );
}
