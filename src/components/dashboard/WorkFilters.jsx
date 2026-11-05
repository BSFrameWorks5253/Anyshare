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
    <div className="glass-panel rounded-2xl p-4 mb-6 border border-white/10 space-y-3">
      {/* Top search & quick toggles row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search session, day, or external key..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View mode toggle: All Work vs My Work */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl p-1 bg-slate-900/70 border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onToggleMyWork(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isMyWorkOnly
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isMyWorkOnly
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My Work
            </button>
          </div>

          {/* Quick Rescan Button */}
          <button
            type="button"
            onClick={onRefreshScan}
            className="p-2.5 rounded-xl glass-pill hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Scan One Tap folders on workstation"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Second row: Assignee filter & Active stage badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            Assignee:
          </span>
          <select
            value={selectedAssignee}
            onChange={(e) => {
              sounds.playTap();
              onAssigneeChange(e.target.value);
            }}
            className="bg-slate-900/60 border border-white/10 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
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
            <span className="text-xs text-slate-400">Filtering by:</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {STAGE_CONFIG[activeStage]?.label || activeStage}
              <button
                onClick={onClearStage}
                className="hover:text-white cursor-pointer ml-0.5"
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
