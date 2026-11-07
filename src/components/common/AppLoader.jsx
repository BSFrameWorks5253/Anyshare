import React from 'react';
import { Zap, Sparkles } from 'lucide-react';

/**
 * Luxury App Loader with Emil-grade micro-interactions & glassmorphic styling
 * Displayed during initial boot, data sync, or view transitions.
 */
export default function AppLoader({
  message = 'Connecting to One Tap Workstation & Cloud Drive...',
  subtext = 'Syncing real-time Safar campaigns, render queues and photo deliverables'
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl animate-fadeIn select-none"
    >
      {/* Radial soft glow behind the modal */}
      <div className="absolute w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none animate-pulse"></div>

      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-8 shadow-2xl flex flex-col items-center text-center space-y-5">
        
        {/* Animated Brand Crest with Orbiting Spinner */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Outer Pulsing Glow */}
          <div className="absolute inset-0 rounded-2xl bg-indigo-600/20 blur-md animate-pulse"></div>
          
          {/* Rotating Gradient Ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-indigo-600 border-r-indigo-400 animate-spin"></div>

          {/* Central Logo Box */}
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="w-7 h-7 fill-white text-white animate-bounce" />
          </div>

          {/* Micro Sparkle Accents */}
          <span className="absolute -top-1 -right-1 text-indigo-400">
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping"></span>
            AnyShare Nexus Live
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {message}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            {subtext}
          </p>
        </div>

        {/* Micro Shimmer Loading Track */}
        <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 w-1/2 rounded-full animate-progressShimmer"></div>
        </div>

        {/* Status Pill */}
        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          One Tap Workstation Bridge &middot; Port 5253 &middot; Supabase Nexus
        </div>
      </div>
    </div>
  );
}
