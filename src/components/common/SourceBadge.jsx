import React from 'react';
import { Cpu, CheckCircle2, Edit3, Shield } from 'lucide-react';

export default function SourceBadge({ source }) {
  if (source === 'onetap_detected' || source === 'onetap') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-900 bg-neutral-100/80 border border-neutral-300 px-2 py-0.5 rounded-md">
        <Cpu className="w-3 h-3 text-[#0f172a]" />
        One Tap Detected
      </span>
    );
  }

  if (source === 'admin_confirmed') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-900 bg-emerald-100/80 border border-emerald-300/80 px-2 py-0.5 rounded-md">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        Admin Confirmed
      </span>
    );
  }

  if (source === 'admin_corrected') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-950 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
        <Edit3 className="w-3 h-3 text-indigo-700" />
        Admin Corrected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-700 bg-neutral-100 border border-stone-300 px-2 py-0.5 rounded-md">
      <Shield className="w-3 h-3 text-neutral-500" />
      System
    </span>
  );
}
