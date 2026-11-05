import React from 'react';
import { useApp } from '../../lib/store';
import { PIPELINE_MILESTONES } from '../../lib/mockData';
import { sounds } from '../../lib/sound';
import { ArrowUpRight, CheckCircle2, Cpu, FileClock, Layers } from 'lucide-react';

const PHASE_ICONS = [FileClock, Cpu, CheckCircle2];

export default function StageSummary({ activeMilestone, onSelectMilestone }) {
  const { items } = useApp();
  const milestoneCounts = PIPELINE_MILESTONES.reduce((counts, milestone) => {
    counts[milestone.key] = items.filter((item) => milestone.statuses.includes(item.status)).length;
    return counts;
  }, {});
  const totalActive = items.filter((item) => !['done', 'cancelled'].includes(item.status)).length;
  const isRendering = (milestoneCounts.rendering || 0) > 0;

  const selectPhase = (key) => {
    sounds.playTap();
    onSelectMilestone(activeMilestone === key ? null : key);
    const list = document.getElementById('work-list-section');
    if (list) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="space-y-4 text-left">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
            <span>Pipeline Progression</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 font-sans">
            Executive Production Stages
          </h2>
          <p className="text-xs text-neutral-500 font-medium">
            {totalActive} active of {items.length} sessions across hardware workstations
          </p>
        </div>

        <button
          type="button"
          onClick={() => { sounds.playTap(); onSelectMilestone(null); }}
          className={`self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            activeMilestone === null
              ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
              : 'bg-white/80 hover:bg-white text-neutral-700 border-black/[0.08]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Productions</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeMilestone === null ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-700'
          }`}>
            {items.length}
          </span>
        </button>
      </div>

      {/* 3 Step Stage Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {PIPELINE_MILESTONES.map((milestone, index) => {
          const Icon = PHASE_ICONS[index] || Layers;
          const count = milestoneCounts[milestone.key] || 0;
          const selected = activeMilestone === milestone.key;
          const isLiveRendering = milestone.key === 'rendering' && isRendering;

          return (
            <button
              key={milestone.key}
              type="button"
              aria-pressed={selected}
              onClick={() => selectPhase(milestone.key)}
              className={`p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
                selected
                  ? 'bg-white border-neutral-950 shadow-md ring-2 ring-neutral-950/20 translate-y-[-2px]'
                  : 'bg-white/75 hover:bg-white border-black/[0.07] hover:border-black/[0.15] shadow-xs hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-neutral-400 uppercase">
                    STEP 0{index + 1}
                  </span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors ${
                    isLiveRendering 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-neutral-100 text-neutral-700 border-black/[0.04]'
                  }`}>
                    <Icon className={`w-4 h-4 ${isLiveRendering ? 'animate-spin' : ''}`} />
                  </div>
                </div>

                <h3 className="text-base font-bold text-neutral-950 mb-1">
                  {milestone.title}
                </h3>
                <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed font-normal mb-4">
                  {milestone.description}
                </p>
              </div>

              <div className="pt-3 border-t border-black/[0.06] flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-neutral-950">
                  {String(count).padStart(2, '0')}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600">
                  <span>{count === 1 ? 'production' : 'productions'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
