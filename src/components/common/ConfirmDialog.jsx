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
      return 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/30 border border-amber-500/40';
    }
    return 'glass-button-primary text-white';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div 
        className="glass-panel w-full max-w-md rounded-2xl p-6 relative border border-white/15 shadow-2xl text-left"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={() => {
            sounds.playTap();
            onCancel();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">{title}</h3>
            {itemName && (
              <p className="text-xs font-mono text-indigo-300 mt-0.5 break-all">
                {itemName}
              </p>
            )}
          </div>
        </div>

        {description && (
          <p className="text-sm text-slate-300 mb-5 leading-relaxed">
            {description}
          </p>
        )}

        {children}

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onCancel();
            }}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white glass-pill hover:bg-white/10 transition-colors"
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
