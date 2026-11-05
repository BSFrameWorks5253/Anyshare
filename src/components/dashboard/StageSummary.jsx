import React, { useRef } from 'react';
import { useApp } from '../../lib/store';
import { STAGE_CONFIG } from '../../lib/mockData';
import { sounds } from '../../lib/sound';
import {
  Clock,
  FileEdit,
  Layers,
  Sliders,
  Zap,
  Send,
  ShieldAlert,
  Cpu,
  CheckCircle2,
  UploadCloud,
  CheckCheck,
  UserCheck,
  Sparkles,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ICON_MAP = {
  Clock,
  FileEdit,
  Layers,
  Sliders,
  Zap,
  Send,
  ShieldAlert,
  Cpu,
  CheckCircle2,
  UploadCloud,
  CheckCheck,
  UserCheck,
  Sparkles,
  AlertTriangle
};

const ORDERED_STAGES = [
  'pending_edit_1',
  'edit_1',
  'pending_edit_2',
  'edit_2',
  'ready_to_render',
  'rendering',
  'rendered',
  'pending_upload',
  'uploaded',
  'given_to_jamey',
  'correction_needed',
  'done'
];

export default function StageSummary({ activeStage, onSelectStage }) {
  const { items } = useApp();
  const scrollContainerRef = useRef(null);

  // Compute live counts derived from records
  const counts = ORDERED_STAGES.reduce((acc, stage) => {
    acc[stage] = items.filter(item => item.status === stage).length;
    return acc;
  }, {});

  const totalActive = items.filter(item => item.status !== 'done' && item.status !== 'cancelled').length;

  const scroll = (direction) => {
    sounds.playTap();
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleStageClick = (stageKey) => {
    sounds.playTap();
    if (activeStage === stageKey) {
      onSelectStage(null); // toggle off
    } else {
      onSelectStage(stageKey);
      // Smooth scroll to work list
      const listEl = document.getElementById('work-list-section');
      if (listEl) {
        listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section className="relative mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
            Pipeline Pulse
          </h2>
          <p className="text-xs text-slate-500">
            {totalActive} active productions in One Tap lifecycle
          </p>
        </div>

        {/* Scroll helper buttons for desktop / tablet */}
        <div className="flex items-center gap-1.5 hidden md:flex">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg glass-pill hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg glass-pill hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Area with edge shadows and smooth touch momentum */}
      <div className="relative group">
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 px-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {/* All Stages Pill */}
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onSelectStage(null);
            }}
            className={`snap-start shrink-0 min-w-[130px] p-3 rounded-2xl text-left transition-all border cursor-pointer ${
              activeStage === null
                ? 'bg-indigo-600/25 border-indigo-500/60 shadow-lg shadow-indigo-950/40'
                : 'glass-panel-subtle hover:bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-slate-400">Total</span>
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">{items.length}</div>
            <div className="text-[11px] text-slate-400 truncate">All Records</div>
          </button>

          {ORDERED_STAGES.map((stageKey) => {
            const config = STAGE_CONFIG[stageKey];
            const count = counts[stageKey] || 0;
            const Icon = ICON_MAP[config.icon] || Clock;
            const isSelected = activeStage === stageKey;

            return (
              <button
                key={stageKey}
                type="button"
                onClick={() => handleStageClick(stageKey)}
                className={`snap-start shrink-0 min-w-[145px] p-3 rounded-2xl text-left transition-all border cursor-pointer relative overflow-hidden group/item ${
                  isSelected
                    ? `${config.bg} ${config.border} ring-2 ring-indigo-500/40 shadow-lg`
                    : 'glass-card border-white/10'
                } ${stageKey === 'correction_needed' && count > 0 ? 'border-rose-500/40 bg-rose-500/10' : ''}`}
              >
                {/* Visual glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-lg ${config.bg} ${config.text}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                </div>

                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span className={`text-2xl font-extrabold ${count > 0 ? 'text-white' : 'text-slate-500'}`}>
                    {count}
                  </span>
                  {stageKey === 'rendering' && count > 0 && (
                    <span className="text-[10px] text-amber-400 font-mono animate-pulse">Live</span>
                  )}
                  {stageKey === 'correction_needed' && count > 0 && (
                    <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">Alert</span>
                  )}
                </div>

                <div className="text-xs font-semibold text-slate-300 truncate" title={config.label}>
                  {config.shortLabel || config.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
