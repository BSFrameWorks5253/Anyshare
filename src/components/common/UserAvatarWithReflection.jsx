import React, { useState } from 'react';

/**
 * UserAvatarWithReflection
 * 
 * Clean, modern executive avatar with subtle rim reflection and automatic initials fallback.
 */
export default function UserAvatarWithReflection({
  src,
  alt = 'Burhanuddin',
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showStatus = false,
  isOnline = true,
  className = '',
  onClick
}) {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: {
      container: 'w-7 h-7',
      img: 'w-7 h-7',
      badge: 'w-2 h-2 bottom-0 right-0',
      text: 'text-[10px]'
    },
    md: {
      container: 'w-9 h-9',
      img: 'w-9 h-9',
      badge: 'w-2.5 h-2.5 bottom-0 right-0',
      text: 'text-xs'
    },
    lg: {
      container: 'w-14 h-14',
      img: 'w-14 h-14',
      badge: 'w-3.5 h-3.5 bottom-0.5 right-0.5',
      text: 'text-base'
    },
    xl: {
      container: 'w-20 h-20',
      img: 'w-20 h-20',
      badge: 'w-4 h-4 bottom-1 right-1',
      text: 'text-xl'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const initial = (alt && alt.trim() ? alt.trim().charAt(0) : 'B').toUpperCase();
  const defaultInitialsUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(alt || 'Burhanuddin')}&backgroundColor=0f172a&textColor=ffffff`;
  const avatarUrl = (src && !imgError) ? src : defaultInitialsUrl;

  return (
    <div 
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 group select-none ${currentSize.container} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Crisp Avatar Frame */}
      <div className={`relative z-10 rounded-full border border-slate-200/80 shadow-2xs overflow-hidden bg-slate-900 flex items-center justify-center ${currentSize.img}`}>
        {imgError ? (
          <span className={`font-bold font-mono text-white ${currentSize.text}`}>
            {initial}
          </span>
        ) : (
          <img
            src={avatarUrl}
            alt={alt}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
          />
        )}
      </div>

      {/* Online indicator */}
      {showStatus && (
        <span 
          className={`absolute z-20 rounded-full border-2 border-white ${currentSize.badge} ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
        />
      )}
    </div>
  );
}
