import React, { useEffect, useState } from 'react';

export default function GlassShell({ children }) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const range = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(range > 0 ? (window.scrollY / range) * 100 : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div className="studio-shell relative min-h-screen flex flex-col selection:bg-indigo-200 selection:text-slate-950">
      <div className="studio-scroll-progress" style={{ width: `${scrollProgress}%` }} />
      <div className="studio-atmosphere" aria-hidden="true">
        <div className="atmosphere-orb atmosphere-orb-a" />
        <div className="atmosphere-orb atmosphere-orb-b" />
        <div className="atmosphere-orb atmosphere-orb-c" />
        <div className="atmosphere-grain" />
      </div>
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
