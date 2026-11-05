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
    <section className="production-pipeline space-y-4 text-left">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
            <span>Production sequence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 font-sans">
            Where each cut stands
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
      <div className="pipeline-rail">
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
              className={`pipeline-phase text-left transition-all duration-200 cursor-pointer ${
                selected
                    ? 'is-selected'
                    : ''
              }`}
            >
              <div>
                <div className="pipeline-phase-top">
                  <span>
                    0{index + 1} / {milestone.title.toUpperCase()}
                  </span>
                  <div className={`pipeline-phase-icon ${isLiveRendering ? 'is-live' : ''}`}>
                    <Icon className={`w-4 h-4 ${isLiveRendering ? 'animate-spin' : ''}`} />
                  </div>
                </div>

                <h3>
                  {milestone.title}
                </h3>
                <p>
                  {milestone.description}
                </p>
              </div>

              <div className="pipeline-phase-count">
                <span>
                  {String(count).padStart(2, '0')}
                </span>
                <span>
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
