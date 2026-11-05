import React from 'react';
import { useApp } from '../../lib/store';
import { STAGE_CONFIG, PIPELINE_MILESTONES } from '../../lib/mockData';
import { sounds } from '../../lib/sound';
import { Search, Filter, UserCheck, X, RefreshCw, Layers } from 'lucide-react';

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
    <div className="glass-panel rounded-2xl p-4 mb-6 border border-[#C5A059]/35 space-y-3 bg-white/85 shadow-sm">
      {/* Top search & quick toggles row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search production session, day number, or external key..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#C5A059]/35 text-sm text-stone-950 font-medium placeholder-stone-400 focus:outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-900"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View mode toggle: All Work vs My Work */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl p-1 bg-amber-50/80 border border-[#C5A059]/30 shrink-0">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onToggleMyWork(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                !isMyWorkOnly
                  ? 'bg-stone-900 text-[#F5E6C8] shadow-xs'
                  : 'text-stone-700 hover:text-stone-950'
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
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                isMyWorkOnly
                  ? 'bg-stone-900 text-[#F5E6C8] shadow-xs'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              My Work
            </button>
          </div>

          {/* Quick Rescan Button */}
          <button
            type="button"
            onClick={onRefreshScan}
            className="p-2.5 rounded-xl glass-pill hover:bg-white text-stone-800 hover:text-stone-950 transition-colors cursor-pointer shrink-0 border border-[#C5A059]/40 shadow-xs"
            title="Scan One Tap folders on workstation"
          >
            <RefreshCw className="w-4 h-4 text-[#8A6614]" />
          </button>
        </div>
      </div>

      {/* Second row: Assignee filter & Active stage badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#C5A059]/20">
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-700 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#8A6614]" />
            Assignee:
          </span>
          <select
            value={selectedAssignee}
            onChange={(e) => {
              sounds.playTap();
              onAssigneeChange(e.target.value);
            }}
            className="bg-white border border-[#C5A059]/35 text-xs text-stone-950 font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#B8860B]"
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
              <span className="text-xs text-stone-600 font-semibold">Phase:</span>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-stone-900 text-[#F5E6C8] border border-stone-800 shadow-xs">
                <span>{currentMilestoneObj.title}</span>
                <button
                  onClick={onClearMilestone}
                  className="hover:text-amber-300 cursor-pointer ml-1"
                  title="Clear milestone filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}

          {activeStage && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-600 font-semibold">Stage:</span>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-lg bg-amber-200 text-stone-950 border border-amber-400">
                {STAGE_CONFIG[activeStage]?.label || activeStage}
                <button
                  onClick={onClearStage}
                  className="hover:text-stone-900 cursor-pointer ml-0.5"
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
