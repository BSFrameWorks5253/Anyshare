import React from 'react';

export default function GlassShell({ children }) {
  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col selection:bg-amber-400/30 selection:text-amber-950 font-sans">
      {/* Ambient background glows for Islamic Golden & White Liquid Glass */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-right Warm 24K Gold Orb */}
        <div 
          className="absolute -top-[12%] -right-[10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-bl from-amber-400/20 via-yellow-500/12 to-transparent blur-[120px] ambient-gold-orb" 
        />
        {/* Center-left Champagne Glow */}
        <div 
          className="absolute top-[30%] -left-[15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-yellow-600/12 via-amber-300/15 to-transparent blur-[130px] ambient-gold-orb" 
          style={{ animationDelay: '-5s' }}
        />
        {/* Bottom Warm Ivory / Gold Luster */}
        <div 
          className="absolute -bottom-[15%] left-[25%] w-[60vw] h-[50vw] rounded-full bg-gradient-to-tr from-amber-500/12 via-yellow-200/20 to-transparent blur-[140px] ambient-gold-orb" 
          style={{ animationDelay: '-9s' }}
        />
        {/* Subtle geometric star watermark lattice texture */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(197,160,89,0.08)_1px,transparent_1px)] [background-size:28px_28px] opacity-75" />
      </div>

      {/* Main Content Shell */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
