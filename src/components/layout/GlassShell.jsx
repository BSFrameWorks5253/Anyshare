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
    <div className="relative min-h-screen bg-[#FAF8F5] text-stone-950 flex flex-col selection:bg-amber-400 selection:text-stone-950 font-sans">
      {/* 24K Islamic Gold Scroll Indicator Bar at Top of Viewport */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 z-50 pointer-events-none transition-all duration-150 ease-out"
        style={{
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, #D4AF37 0%, #F5E6C8 50%, #B8860B 100%)',
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.8), 0 0 4px rgba(212, 175, 55, 0.4)'
        }}
      />
      {/* Ambient background glows & Islamic Geometric Watermark */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-right Warm 24K Gold Ambient Lighting */}
        <div 
          className="absolute -top-[15%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-bl from-amber-400/25 via-yellow-500/15 to-transparent blur-[130px] ambient-gold-orb" 
        />
        {/* Center-left Champagne Glow */}
        <div 
          className="absolute top-[35%] -left-[15%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-yellow-600/15 via-amber-300/20 to-transparent blur-[140px] ambient-gold-orb" 
          style={{ animationDelay: '-6s' }}
        />
        {/* Bottom Warm Gold Luster */}
        <div 
          className="absolute -bottom-[20%] left-[20%] w-[65vw] h-[55vw] rounded-full bg-gradient-to-tr from-amber-500/15 via-yellow-200/25 to-transparent blur-[150px] ambient-gold-orb" 
          style={{ animationDelay: '-10s' }}
        />

        {/* Authentic Islamic Khatam 8-Point Star Geometric Lattice Texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035] text-[#8A6614]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-star-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 40,0 L 50,30 L 80,40 L 50,50 L 40,80 L 30,50 L 0,40 L 30,30 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <rect x="25" y="25" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="40" cy="40" r="14" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2,2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-star-pattern)" />
        </svg>

        {/* Fine gold micro-stippling */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(197,160,89,0.12)_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />
      </div>

      {/* Main Content Shell */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
