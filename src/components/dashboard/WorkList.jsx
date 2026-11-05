import React from 'react';
import WorkCard from './WorkCard';
import { Layers, FolderPlus, RefreshCw, Sparkles } from 'lucide-react';
import { sounds } from '../../lib/sound';

export default function WorkList({
  items,
  onInspect,
  onStartRender,
  onReviewCorrection,
  onCreateNew,
  onRefreshScan
}) {
  if (items.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-10 sm:p-14 text-center border border-white/10 my-6 max-w-xl mx-auto space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-cyan-500/30 border border-white/15 text-indigo-300 flex items-center justify-center mx-auto shadow-xl shadow-indigo-950/40">
          <Layers className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white mb-1.5">No Active Production Items</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            There are currently no productions loaded. You can trigger a folder scan from your One Tap workstation or create a new production session directly.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onCreateNew && (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onCreateNew();
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold glass-button-primary flex items-center gap-2 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ New Production Session</span>
            </button>
          )}

          {onRefreshScan && (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onRefreshScan();
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white/10 text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              <span>Scan Workstation</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((item) => (
        <WorkCard
          key={item.id}
          item={item}
          onInspect={onInspect}
          onStartRender={onStartRender}
          onReviewCorrection={onReviewCorrection}
        />
      ))}
    </div>
  );
}
