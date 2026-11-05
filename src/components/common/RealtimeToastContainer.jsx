import React, { useEffect } from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  ArrowRight,
  Cpu,
  Layers,
  FolderCheck
} from 'lucide-react';

export default function RealtimeToastContainer({ onNavigateToTracker }) {
  const { toasts, dismissToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <aside 
      aria-label="Realtime Workstation Alerts"
      className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm sm:max-w-md w-full"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => dismissToast(toast.id)}
          onNavigateToTracker={onNavigateToTracker}
        />
      ))}
    </aside>
  );
}

function ToastItem({ toast, onDismiss, onNavigateToTracker }) {
  useEffect(() => {
    // Auto dismiss after 8 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-indigo-600 shrink-0" />;
      default:
        return <Cpu className="w-5 h-5 text-neutral-800 shrink-0" />;
    }
  };

  return (
    <div className="pointer-events-auto rounded-2xl glass-panel bg-white/95 backdrop-blur-2xl border border-black/[0.08] p-4 shadow-xl shadow-black/10 transition-all transform animate-fadeIn translate-y-0">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-neutral-100 border border-black/[0.04] mt-0.5">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-xs font-bold text-neutral-950 truncate">
              {toast.title}
            </h4>
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onDismiss();
              }}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer transition-colors"
              aria-label="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-neutral-600 font-medium leading-relaxed mb-2.5">
            {toast.message}
          </p>

          {(toast.safarName || toast.dateFolder) && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              {toast.safarName && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200/60 font-mono">
                  {toast.safarName}
                </span>
              )}
              {toast.dateFolder && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200/60 font-mono">
                  {toast.dateFolder}
                </span>
              )}
              {toast.batchSize && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  {toast.batchSize} Deliverables
                </span>
              )}
            </div>
          )}

          {onNavigateToTracker && (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onNavigateToTracker();
                onDismiss();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-950 hover:text-neutral-700 bg-neutral-100/80 hover:bg-neutral-200/80 px-2.5 py-1 rounded-lg border border-black/[0.06] cursor-pointer transition-all"
            >
              <span>View in Tracker</span>
              <ArrowRight className="w-3 h-3 text-neutral-700" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
