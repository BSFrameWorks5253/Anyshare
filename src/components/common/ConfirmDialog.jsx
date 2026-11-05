import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { sounds } from '../../lib/sound';

export default function ConfirmDialog({
  isOpen,
  title,
  itemName,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary', // primary, danger, warning
  onConfirm,
  onCancel,
  children
}) {
  if (!isOpen) return null;

  const getConfirmStyle = () => {
    if (confirmVariant === 'danger') {
      return 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 border border-rose-500/40';
    }
    if (confirmVariant === 'warning') {
      return 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/30 border border-indigo-500/40';
    }
    return 'glass-button-primary text-white';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-md animate-fadeIn">
      <div 
        className="glass-panel w-full max-w-md rounded-2xl p-6 relative border border-[rgba(0,0,0,0.08)]/30 shadow-2xl text-left bg-white/95"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={() => {
            sounds.playTap();
            onCancel();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-[rgba(0,0,0,0.08)]/10 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div className="p-2.5 rounded-xl bg-neutral-50 border border-[rgba(0,0,0,0.08)]/30 text-[#334155] shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
            {itemName && (
              <p className="text-xs font-mono text-[#334155] mt-0.5 break-all font-semibold">
                {itemName}
              </p>
            )}
          </div>
        </div>

        {description && (
          <p className="text-sm text-neutral-600 mb-5 leading-relaxed">
            {description}
          </p>
        )}

        {children}

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[rgba(0,0,0,0.08)]/20">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onCancel();
            }}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-700 hover:text-neutral-900 glass-pill hover:bg-neutral-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${getConfirmStyle()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
