import React from 'react';
import { STAGE_CONFIG } from '../../lib/mockData';
import {
  Clock,
  FileEdit,
  Layers,
  Sliders,
  Zap,
  Send,
  ShieldAlert,
  Cpu,
  CheckCircle2,
  UploadCloud,
  CheckCheck,
  UserCheck,
  Sparkles,
  AlertTriangle,
  XCircle,
  Ban
} from 'lucide-react';

const ICON_MAP = {
  Clock,
  FileEdit,
  Layers,
  Sliders,
  Zap,
  Send,
  ShieldAlert,
  Cpu,
  CheckCircle2,
  UploadCloud,
  CheckCheck,
  UserCheck,
  Sparkles,
  AlertTriangle,
  XCircle,
  Ban
};

export default function StatusPill({ status, size = 'sm', className = '' }) {
  const config = STAGE_CONFIG[status] || {
    label: status || 'Unknown',
    border: 'border-slate-500/30',
    bg: 'bg-slate-500/10',
    text: 'text-slate-300',
    dot: 'bg-slate-400',
    icon: 'Clock'
  };

  const IconComponent = ICON_MAP[config.icon] || Clock;

  const sizeClasses = size === 'xs'
    ? 'text-[11px] px-2 py-0.5 gap-1.5'
    : size === 'lg'
    ? 'text-sm px-3.5 py-1.5 gap-2 font-medium'
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md shadow-xs transition-colors ${config.bg} ${config.border} ${config.text} ${sizeClasses} ${className}`}
      title={`Stage: ${config.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      <IconComponent className={size === 'lg' ? 'w-4 h-4 shrink-0' : 'w-3 h-3 shrink-0'} />
      <span className="truncate">{config.label}</span>
    </span>
  );
}
