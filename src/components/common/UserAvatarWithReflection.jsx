import React from 'react';

/**
 * UserAvatarWithReflection
 * 
 * Apple Liquid Glass Profile Picture Chamber:
 * Projects a soft, dynamic liquid light reflection of the user's active DP (avatar)
 * behind the portrait with specular rim highlights.
 * Exclusively active for the PFP section.
 */
export default function UserAvatarWithReflection({
  src,
  alt = 'User Avatar',
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showStatus = false,
  isOnline = true,
  className = '',
  onClick
}) {
  const sizeMap = {
    sm: {
      container: 'w-8 h-8',
      img: 'w-7 h-7',
      blur: 'blur-md -inset-1',
      badge: 'w-2 h-2 bottom-0 right-0'
    },
    md: {
      container: 'w-11 h-11',
      img: 'w-9 h-9',
      blur: 'blur-lg -inset-1.5',
      badge: 'w-2.5 h-2.5 bottom-0.5 right-0.5'
    },
    lg: {
      container: 'w-16 h-16',
      img: 'w-14 h-14',
      blur: 'blur-xl -inset-2',
      badge: 'w-3.5 h-3.5 bottom-1 right-1'
    },
    xl: {
      container: 'w-24 h-24',
      img: 'w-20 h-20',
      blur: 'blur-2xl -inset-3',
      badge: 'w-4 h-4 bottom-1.5 right-1.5'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const avatarUrl = src || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';

  return (
    <div 
      onClick={onClick}
      className={`relative inline-flex items-center justify-center pfp-liquid-chamber group select-none ${currentSize.container} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* 1. Dynamic Liquid Light Reflection (Paints avatar colors as radiant backlight) */}
      <div 
        className={`absolute rounded-full pointer-events-none opacity-80 group-hover:opacity-100 transition-all duration-700 ease-out transform group-hover:scale-115 ${currentSize.blur}`}
        style={{
          backgroundImage: `url(${avatarUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(14px) saturate(190%) brightness(1.15)',
        }}
        aria-hidden="true"
      />

      {/* 2. Frosted Liquid Glass Polished Rim */}
      <div className={`relative z-10 rounded-2xl sm:rounded-full p-0.5 bg-gradient-to-b from-white/90 via-white/40 to-white/10 backdrop-blur-xl border border-white/60 shadow-[0_4px_16px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105 ${currentSize.img}`}>
        {/* Actual Avatar Image */}
        <img
          src={avatarUrl}
          alt={alt}
          className="w-full h-full object-cover rounded-xl sm:rounded-full relative z-10"
          loading="lazy"
        />

        {/* Apple Liquid Glass Specular Gleam Sweep across PFP edge */}
        <div 
          className="absolute inset-0 z-20 pointer-events-none rounded-xl sm:rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, transparent 45%, rgba(255,255,255,0.3) 100%)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8)'
          }}
        />
      </div>

      {/* Optional Online Badge */}
      {showStatus && (
        <span 
          className={`absolute z-30 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-110 ${currentSize.badge} ${
            isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
          }`} 
        />
      )}
    </div>
  );
}
