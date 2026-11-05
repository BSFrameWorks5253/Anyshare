import React from 'react';
import { useApp } from '../../lib/store';
import { STAGE_CONFIG } from '../../lib/mockData';
import { sounds } from '../../lib/sound';
import { Search, Filter, UserCheck, X, RefreshCw } from 'lucide-react';

export default function WorkFilters({
  searchQuery,
  onSearchChange,
  selectedAssignee,
  onAssigneeChange,
  activeStage,
  onClearStage,
  isMyWorkOnly,
  onToggleMyWork,
  onRefreshScan
}) {
  const { users, currentUser } = useApp();

  return (
    <div className="glass-panel rounded-2xl p-4 mb-6 border border-[#C5A059]/30 space-y-3 bg-white/75 shadow-xs">
      {/* Top search & quick toggles row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search session, day, or external key..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50/80 border border-[#C5A059]/25 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View mode toggle: All Work vs My Work */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl p-1 bg-stone-100/90 border border-[#C5A059]/25 shrink-0">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onToggleMyWork(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !isMyWorkOnly
                  ? 'bg-gradient-to-r from-[#E6C665] to-[#C5A059] text-stone-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Work
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onToggleMyWork(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isMyWorkOnly
                  ? 'bg-gradient-to-r from-[#E6C665] to-[#C5A059] text-stone-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              My Work
            </button>
          </div>

          {/* Quick Rescan Button */}
          <button
            type="button"
            onClick={onRefreshScan}
            className="p-2.5 rounded-xl glass-pill hover:bg-white text-stone-700 hover:text-stone-900 transition-colors cursor-pointer shrink-0 border border-[#C5A059]/30"
            title="Scan One Tap folders on workstation"
          >
            <RefreshCw className="w-4 h-4 text-[#B8860B]" />
          </button>
        </div>
      </div>

      {/* Second row: Assignee filter & Active stage badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#C5A059]/15">
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            Assignee:
          </span>
          <select
            value={selectedAssignee}
            onChange={(e) => {
              sounds.playTap();
              onAssigneeChange(e.target.value);
            }}
            className="bg-stone-50 border border-[#C5A059]/25 text-xs text-stone-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="all">Everyone (All)</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} {u.id === currentUser.id ? '(You)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Active Stage Filter Badge (if stage selected) */}
        {activeStage && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500 font-medium">Filtering by:</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
              {STAGE_CONFIG[activeStage]?.label || activeStage}
              <button
                onClick={onClearStage}
                className="hover:text-stone-900 cursor-pointer ml-0.5"
                title="Clear filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
