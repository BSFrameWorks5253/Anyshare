import React from 'react';
import { useApp } from '../../lib/store';
import { PIPELINE_MILESTONES, getMilestoneForStatus } from '../../lib/mockData';
import { sounds } from '../../lib/sound';
import {
  FileEdit,
  Zap,
  Cpu,
  ShieldCheck,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';

const MILESTONE_ICONS = {
  FileEdit,
  Zap,
  Cpu,
  ShieldCheck,
  Sparkles
};

export default function StageSummary({ activeMilestone, onSelectMilestone }) {
  const { items } = useApp();

  // Calculate count per milestone
  const milestoneCounts = PIPELINE_MILESTONES.reduce((acc, milestone) => {
    acc[milestone.key] = items.filter(item => milestone.statuses.includes(item.status)).length;
    return acc;
  }, {});

  const totalActive = items.filter(item => item.status !== 'done' && item.status !== 'cancelled').length;
  const isAnyRendering = (milestoneCounts['rendering'] || 0) > 0;

  const handleMilestoneClick = (milestoneKey) => {
    sounds.playTap();
    if (activeMilestone === milestoneKey) {
      onSelectMilestone(null);
    } else {
      onSelectMilestone(milestoneKey);
      const listEl = document.getElementById('work-list-section');
      if (listEl) {
        listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section className="relative mb-8">
      {/* Masthead Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B8860B] animate-pulse" />
            <h2 className="text-xs font-extrabold tracking-widest uppercase text-[#785005] font-mono">
              Workstation Pipeline Pulse
            </h2>
            {isAnyRendering && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-stone-950 shadow-sm animate-pulse">
                Node GPU Active
              </span>
            )}
          </div>
          <p className="text-xs text-stone-800 font-semibold mt-0.5">
            <strong className="text-stone-950 font-black">{totalActive} Active</strong> of {items.length} total productions across 3 executive studio phases
          </p>
        </div>

        {/* Reset / All filter button */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onSelectMilestone(null);
          }}
          className={`self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer flex items-center gap-1.5 ${
            activeMilestone === null
              ? 'bg-stone-900 text-[#F5E6C8] border-stone-800 shadow-md'
              : 'bg-white/95 text-stone-900 border-[#C5A059]/40 hover:bg-white hover:text-black shadow-xs'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#B8860B]" />
          <span>Show All Productions ({items.length})</span>
        </button>
      </div>

      {/* 3-Step Streamlined Luxury Pipeline Grid */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 border-2 border-[#C5A059]/45 bg-white/95 shadow-md relative overflow-hidden">
        {/* Continuous Golden Laser Connector Line (visible on desktop) */}
        <div className="hidden lg:block absolute top-[45px] left-16 right-16 h-1 bg-gradient-to-r from-amber-300 via-[#C5A059]/50 to-emerald-300 z-0">
          {isAnyRendering && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-gold-beam" />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {PIPELINE_MILESTONES.map((milestone, idx) => {
            const count = milestoneCounts[milestone.key] || 0;
            const Icon = MILESTONE_ICONS[milestone.icon] || FileEdit;
            const isSelected = activeMilestone === milestone.key;
            const isRenderPhase = milestone.key === 'rendering';
            const hasActiveWork = count > 0;

            return (
              <div
                key={milestone.key}
                onClick={() => handleMilestoneClick(milestone.key)}
                className={`card-luxury rounded-2xl p-4 text-left transition-all border cursor-pointer flex flex-col justify-between select-none ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-50 via-white to-amber-100/60 border-[#B8860B] ring-2 ring-[#B8860B]/40 shadow-lg -translate-y-1'
                    : 'bg-white/90 border-[#C5A059]/25 hover:border-[#B8860B]/60 hover:bg-white hover:-translate-y-0.5 shadow-xs'
                } ${isRenderPhase && hasActiveWork ? 'ring-2 ring-amber-400/80 bg-amber-50/90' : ''}`}
              >
                {/* Header: Step Number & Icon */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-[#8A6614] bg-amber-100/80 px-2 py-0.5 rounded-md border border-[#C5A059]/30">
                      STEP {milestone.stepNumber}
                    </span>
                  </div>

                  <div className={`p-2 rounded-xl transition-colors ${
                    isRenderPhase && hasActiveWork
                      ? 'bg-amber-400 text-stone-950 animate-bounce'
                      : isSelected
                        ? 'bg-[#8A6614] text-amber-100'
                        : 'bg-amber-50 text-[#8A6614] border border-[#C5A059]/30'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Milestone Title & Description */}
                <div className="mb-3">
                  <h3 className="text-sm font-black text-stone-950 tracking-tight flex items-center gap-1.5">
                    {milestone.title}
                  </h3>
                  <p className="text-xs text-stone-800 font-bold truncate mt-0.5">
                    {milestone.description}
                  </p>
                </div>

                {/* Bottom Row: Item Count Pill */}
                <div className="pt-2.5 border-t border-[#C5A059]/25 flex items-center justify-between">
                  <span className={`text-2xl font-black ${hasActiveWork ? 'text-stone-950 font-serif' : 'text-stone-500 font-serif'}`}>
                    {count}
                  </span>

                  <span className={`text-xs font-black px-3 py-1 rounded-full border transition-all ${
                    hasActiveWork
                      ? milestone.badgeClass
                      : 'bg-stone-100 text-stone-800 border-stone-300 font-bold'
                  }`}>
                    {count === 1 ? '1 Job' : `${count} Jobs`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
