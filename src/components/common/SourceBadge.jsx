import React from 'react';
import { Cpu, CheckCircle2, Edit3, Shield } from 'lucide-react';

export default function SourceBadge({ source }) {
  if (source === 'onetap_detected' || source === 'onetap') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-100/80 border border-amber-300/80 px-2 py-0.5 rounded-md">
        <Cpu className="w-3 h-3 text-[#B8860B]" />
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
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-950 bg-amber-200/70 border border-amber-400 px-2 py-0.5 rounded-md">
        <Edit3 className="w-3 h-3 text-amber-700" />
        Admin Corrected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-700 bg-stone-100 border border-stone-300 px-2 py-0.5 rounded-md">
      <Shield className="w-3 h-3 text-stone-500" />
      System
    </span>
  );
}
