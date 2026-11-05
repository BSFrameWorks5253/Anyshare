import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import {
  FolderPlus,
  X,
  FileVideo,
  Layers,
  Cpu,
  Check,
  Sparkles
} from 'lucide-react';

export default function NewProductionModal({ isOpen, onClose }) {
  const { createNewProductionItem, currentUser, isAdmin } = useApp();
  const [displayLabel, setDisplayLabel] = useState('');
  const [externalKey, setExternalKey] = useState('');
  const [rawClipsCount, setRawClipsCount] = useState('32');
  const [targetPreset, setTargetPreset] = useState('YouTube 4K UHD 59.94fps Master Rec.709');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!displayLabel.trim()) return;

    createNewProductionItem({
      displayLabel: displayLabel.trim(),
      externalKey: externalKey.trim() || displayLabel.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'),
      assignedUserId: currentUser.id,
      targetPreset,
      rawClipsCount: parseInt(rawClipsCount, 10) || 24
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="glass-panel w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden text-left"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                New Production Session
              </h2>
              <p className="text-xs text-slate-400">
                Register a verified Safar or editing session
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Production Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={displayLabel}
              onChange={(e) => {
                setDisplayLabel(e.target.value);
                if (!externalKey) {
                  setExternalKey(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                }
              }}
              placeholder="e.g. Safar 2026 — Karbala Day 01 (Grand Procession)"
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Stable Folder Identifier / External Key
            </label>
            <input
              type="text"
              value={externalKey}
              onChange={(e) => setExternalKey(e.target.value)}
              placeholder="e.g. safar_2026_karbala_day01"
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Verified Raw Clips
              </label>
              <input
                type="number"
                value={rawClipsCount}
                onChange={(e) => setRawClipsCount(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Assigned Lead
              </label>
              <div className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-300 truncate">
                {currentUser.name}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Render Output Preset
            </label>
            <select
              value={targetPreset}
              onChange={(e) => setTargetPreset(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="YouTube 4K UHD 59.94fps Master Rec.709">YouTube 4K UHD 59.94fps Master Rec.709</option>
              <option value="ProRes 422 HQ Master Archive">ProRes 422 HQ Master Archive</option>
              <option value="1080p Broadcast Delivery H.264">1080p Broadcast Delivery H.264</option>
              <option value="Social Vertical 9:16 4K 60fps">Social Vertical 9:16 4K 60fps</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white/10 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold glass-button-primary flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Production Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
