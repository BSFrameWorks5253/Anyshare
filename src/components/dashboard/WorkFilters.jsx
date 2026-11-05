import React from 'react';
import { useApp } from '../../lib/store';
import { STAGE_CONFIG, PIPELINE_MILESTONES } from '../../lib/mockData';
import { sounds } from '../../lib/sound';
import { Search, Filter, X, RefreshCw } from 'lucide-react';

export default function WorkFilters({
  searchQuery,
  onSearchChange,
  selectedAssignee,
  onAssigneeChange,
  activeMilestone,
  onClearMilestone,
  activeStage,
  onClearStage,
  isMyWorkOnly,
  onToggleMyWork,
  onRefreshScan
}) {
  const { users, currentUser } = useApp();

  const currentMilestoneObj = PIPELINE_MILESTONES.find(m => m.key === activeMilestone);

  return (
    <div className="production-filters rounded-2xl p-4 mb-6 border border-black/[0.07] space-y-3 bg-white/80 backdrop-blur-xl shadow-xs">
      {/* Top search & quick toggles row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search production session, day number, or external key..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-black/[0.08] text-sm text-neutral-900 font-medium placeholder-neutral-400 focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View mode toggle: All Work vs My Work */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl p-1 bg-neutral-100 border border-black/[0.04] shrink-0">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onToggleMyWork(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isMyWorkOnly
                  ? 'bg-neutral-950 text-white shadow-xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-950'
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
                  ? 'bg-neutral-950 text-white shadow-xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              My Work
            </button>
          </div>

          {/* Quick Rescan Button */}
          <button
            type="button"
            onClick={onRefreshScan}
            className="p-2.5 rounded-xl glass-pill hover:bg-white text-neutral-700 hover:text-neutral-950 transition-colors cursor-pointer shrink-0 border border-black/[0.08] shadow-2xs"
            title="Scan One Tap folders on workstation"
          >
            <RefreshCw className="w-4 h-4 text-neutral-600" />
          </button>
        </div>
      </div>

      {/* Second row: Assignee filter & Active stage badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-600 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            Assignee:
          </span>
          <select
            value={selectedAssignee}
            onChange={(e) => {
              sounds.playTap();
              onAssigneeChange(e.target.value);
            }}
            className="bg-white border border-black/[0.08] text-xs text-neutral-900 font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-950 cursor-pointer"
          >
            <option value="all">Everyone (All)</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} {u.id === currentUser.id ? '(You)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {activeMilestone && currentMilestoneObj && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-500 font-medium">Phase:</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-lg bg-neutral-950 text-white border border-neutral-900 shadow-2xs">
                <span>{currentMilestoneObj.title}</span>
                <button
                  onClick={onClearMilestone}
                  className="hover:text-neutral-300 cursor-pointer ml-1"
                  title="Clear milestone filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}

          {activeStage && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-500 font-medium">Stage:</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-800 border border-neutral-200">
                {STAGE_CONFIG[activeStage]?.label || activeStage}
                <button
                  onClick={onClearStage}
                  className="hover:text-neutral-950 cursor-pointer ml-0.5"
                  title="Clear stage filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
