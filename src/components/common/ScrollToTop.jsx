import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { sounds } from '../../lib/sound';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    sounds.playTap();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      type="button"
      className="fixed bottom-20 md:bottom-8 right-6 z-40 p-3 rounded-full glass-panel hover:border-indigo-400/50 shadow-xl text-slate-200 hover:text-white transition-all transform hover:-translate-y-1 active:translate-y-0"
      aria-label="Scroll back to top"
    >
      <ChevronUp className="w-5 h-5 text-indigo-400" />
    </button>
  );
}
