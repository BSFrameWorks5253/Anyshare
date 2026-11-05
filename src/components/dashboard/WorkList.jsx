import React from 'react';
import WorkCard from './WorkCard';
import { Layers, FolderPlus, RefreshCw } from 'lucide-react';
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
      <div className="rounded-3xl p-10 sm:p-14 text-center border border-black/[0.08] my-6 max-w-xl mx-auto space-y-5 bg-white/80 backdrop-blur-xl shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-black/[0.06] text-neutral-800 flex items-center justify-center mx-auto shadow-2xs">
          <Layers className="w-8 h-8 text-neutral-600" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-neutral-950 mb-1.5">No Active Production Items</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
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
              className="px-5 py-2.5 rounded-xl text-xs font-semibold glass-button-primary flex items-center gap-2 cursor-pointer shadow-xs"
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
              className="px-4 py-2.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white text-neutral-700 flex items-center gap-2 transition-colors cursor-pointer border border-black/[0.08]"
            >
              <RefreshCw className="w-4 h-4 text-neutral-600" />
              <span>Scan Workstation</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="production-work-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
