import React, { useState, useEffect } from 'react';

export default function GlassShell({ children }) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* 24K Platinum & Gold Precision Scroll Indicator Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 z-50 pointer-events-none transition-all duration-150 ease-out"
        style={{
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, #D4AF37 0%, #FFFFFF 50%, #C5A059 100%)',
          boxShadow: '0 0 12px rgba(212, 175, 55, 0.7), 0 0 4px rgba(255, 255, 255, 0.9)'
        }}
      />
      {/* Apple Liquid Glass Atmospheric Mesh Backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-right Ethereal Sky & Platinum Glow */}
        <div 
          className="absolute -top-[15%] -right-[10%] w-[65vw] h-[65vw] rounded-full bg-gradient-to-bl from-amber-300/15 via-sky-200/20 to-transparent blur-[140px] ambient-gold-orb" 
        />
        {/* Center-left Soft Lavender Frost Glow */}
        <div 
          className="absolute top-[30%] -left-[15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-indigo-200/15 via-amber-200/15 to-transparent blur-[150px] ambient-gold-orb" 
          style={{ animationDelay: '-6s' }}
        />
        {/* Bottom Pearl Luster */}
        <div 
          className="absolute -bottom-[20%] left-[25%] w-[70vw] h-[60vw] rounded-full bg-gradient-to-tr from-sky-100/25 via-amber-100/20 to-transparent blur-[160px] ambient-gold-orb" 
          style={{ animationDelay: '-10s' }}
        />

        {/* Authentic Islamic Geometric Lattice Texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025] text-slate-800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-star-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 40,0 L 50,30 L 80,40 L 50,50 L 40,80 L 30,50 L 0,40 L 30,30 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <rect x="25" y="25" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="40" cy="40" r="14" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2,2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-star-pattern)" />
        </svg>

        {/* Fine refractive micro-stippling */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      {/* Main Content Shell */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
