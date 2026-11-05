import React from 'react';

export default function GlassShell({ children }) {
  return (
    <div className="relative min-h-screen bg-[#070a13] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Ambient background glows for Liquid Glass depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-left Indigo Orb */}
        <div 
          className="absolute -top-[12%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-indigo-600/15 via-purple-700/10 to-transparent blur-[120px] ambient-orb" 
        />
        {/* Center-right Cyan Orb */}
        <div 
          className="absolute top-[35%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-cyan-600/12 via-blue-700/8 to-transparent blur-[130px] ambient-orb" 
          style={{ animationDelay: '-6s' }}
        />
        {/* Bottom Emerald/Teal Glow */}
        <div 
          className="absolute -bottom-[15%] left-[20%] w-[60vw] h-[50vw] rounded-full bg-gradient-to-tr from-teal-600/10 via-emerald-800/8 to-transparent blur-[140px] ambient-orb" 
          style={{ animationDelay: '-11s' }}
        />
        {/* Micro-dot grid texture for subtle tactility */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Main App Container */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
