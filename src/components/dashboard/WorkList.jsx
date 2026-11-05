import React from 'react';
import WorkCard from './WorkCard';
import { Layers, FolderPlus, RefreshCw, Sparkles } from 'lucide-react';
import { sounds } from '../../lib/sound';

export default function WorkList({
  items,
  onInspect,
  onStartRender,
  onReviewCorrection,
  onOpenMonitor,
  onCreateNew,
  onRefreshScan
}) {
  if (items.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-10 sm:p-14 text-center border border-[#C5A059]/30 my-6 max-w-xl mx-auto space-y-5 bg-white/80 shadow-sm">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#D4AF37]/25 via-amber-100 to-amber-50 border border-[#C5A059]/40 text-[#997328] flex items-center justify-center mx-auto shadow-md">
          <Layers className="w-8 h-8 text-[#997328]" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-stone-900 mb-1.5">No Active Production Items</h3>
          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
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
              className="px-4 py-2.5 rounded-xl text-xs font-semibold glass-pill hover:bg-stone-200 text-stone-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#997328]" />
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
          onOpenMonitor={onOpenMonitor}
        />
      ))}
    </div>
  );
}
