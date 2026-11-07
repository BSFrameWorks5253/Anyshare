import React from 'react';

/**
 * High-performance Glassmorphic Skeleton Loader for AnyShare Companion
 * Provides smooth shimmering placeholders to eliminate UI freezing/hanging.
 */
export default function SkeletonLoader({ variant = 'kanban', count = 3, message = 'Syncing workstation pipeline...' }) {
  if (variant === 'kanban') {
    return (
      <div className="w-full space-y-6 animate-pulse select-none">
        {/* Header Skeleton */}
        <div className="p-6 rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-xl shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2.5">
              <div className="h-6 w-64 bg-slate-200/80 rounded-lg"></div>
              <div className="h-4 w-40 bg-slate-200/60 rounded-md"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-28 bg-slate-200/80 rounded-xl"></div>
              <div className="h-9 w-32 bg-slate-200/80 rounded-xl"></div>
            </div>
          </div>
          {/* Progress bar placeholder */}
          <div className="mt-5 w-full bg-slate-200/60 h-2.5 rounded-full overflow-hidden">
            <div className="bg-slate-300 h-full w-2/5 rounded-full"></div>
          </div>
        </div>

        {/* 4-Column Kanban Columns Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Stage 1: In Editing', color: 'bg-amber-100/80 border-amber-200/60' },
            { label: 'Stage 2: Rendered', color: 'bg-blue-100/80 border-blue-200/60' },
            { label: 'Stage 3: Uploaded', color: 'bg-emerald-100/80 border-emerald-200/60' },
            { label: 'Stage 4: Submitted', color: 'bg-purple-100/80 border-purple-200/60' }
          ].map((col, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-2xl border border-slate-200/70 bg-slate-50/70 backdrop-blur-md p-3.5 min-h-[420px]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.color.split(' ')[0]}`}></div>
                  <span className="text-xs font-semibold text-slate-700">{col.label}</span>
                </div>
                <div className="h-4 w-6 bg-slate-200/80 rounded-full"></div>
              </div>

              {/* Shimmering Card Placeholders */}
              <div className="space-y-3 flex-1">
                {[1, 2].map((cardIdx) => (
                  <div
                    key={cardIdx}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-white/80 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-28 bg-slate-200/90 rounded-md"></div>
                      <div className="h-4 w-12 bg-slate-200/60 rounded-md"></div>
                    </div>
                    <div className="h-3 w-44 bg-slate-200/50 rounded-md"></div>
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <div className="h-3 w-16 bg-slate-200/60 rounded-md"></div>
                      <div className="h-6 w-16 bg-slate-200/80 rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {message && (
          <div className="text-center pt-2 text-xs font-medium text-slate-500 animate-pulse">
            {message}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className="w-full space-y-6 animate-pulse select-none">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200/80 bg-white/80 space-y-2">
              <div className="h-3.5 w-20 bg-slate-200 rounded"></div>
              <div className="h-6 w-14 bg-slate-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Generic Row/Table Skeleton
  return (
    <div className="w-full space-y-3 animate-pulse select-none">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-slate-100/90 border border-slate-200/70 p-4 flex items-center justify-between">
          <div className="h-4 w-48 bg-slate-200 rounded"></div>
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}
