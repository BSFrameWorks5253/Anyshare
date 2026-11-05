import React from 'react';

/**
 * UserAvatarWithReflection
 * 
 * Clean, modern executive avatar with subtle rim reflection.
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
      container: 'w-7 h-7',
      img: 'w-7 h-7',
      badge: 'w-2 h-2 bottom-0 right-0'
    },
    md: {
      container: 'w-9 h-9',
      img: 'w-9 h-9',
      badge: 'w-2.5 h-2.5 bottom-0 right-0'
    },
    lg: {
      container: 'w-14 h-14',
      img: 'w-14 h-14',
      badge: 'w-3.5 h-3.5 bottom-0.5 right-0.5'
    },
    xl: {
      container: 'w-20 h-20',
      img: 'w-20 h-20',
      badge: 'w-4 h-4 bottom-1 right-1'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const avatarUrl = src || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';

  return (
    <div 
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 group select-none ${currentSize.container} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Crisp Avatar Frame */}
      <div className={`relative z-10 rounded-full border border-slate-200/80 shadow-2xs overflow-hidden bg-slate-100 flex items-center justify-center ${currentSize.img}`}>
        <img
          src={avatarUrl}
          alt={alt}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
        />
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
