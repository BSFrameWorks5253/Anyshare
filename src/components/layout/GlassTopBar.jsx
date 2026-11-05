import React from 'react';
import { useApp } from '../../lib/store';
import BridgeHealthBadge from '../common/BridgeHealthBadge';
import { sounds } from '../../lib/sound';
import {
  Bell,
  User,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
  Zap,
  AtSign
} from 'lucide-react';

export default function GlassTopBar({
  onOpenNotifications,
  onOpenAccount,
  onOpenBridge,
  currentView,
  onNavigate
}) {
  const { currentUser, notifications, isAdmin, items } = useApp();

  const unreadCount = notifications.filter(
    n => !n.read_at && (n.recipient_user_id === currentUser.id || isAdmin)
  ).length;

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-[#C5A059]/25 px-4 sm:px-8 py-3 transition-all backdrop-blur-2xl bg-white/80 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div 
          onClick={() => {
            sounds.playTap();
            onNavigate('overview');
          }}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          {/* Islamic Golden AnyShare Monogram */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D4AF37] via-[#F7E7A9] to-[#B8860B] p-0.5 shadow-md shadow-amber-900/15 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-[#FAF8F5] rounded-[10px] flex items-center justify-center relative overflow-hidden border border-[#D4AF37]/30">
              <Zap className="w-4 h-4 text-[#B8860B] fill-[#D4AF37]/40" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-stone-900 tracking-tight group-hover:text-[#B8860B] transition-colors">
                AnyShare
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-[#8B6508] border border-amber-300/60 font-bold">
                One Tap Bridge
              </span>
            </div>
            <p className="text-[10px] text-stone-500 hidden sm:block">
              One Tap production status & remote render command hub
            </p>
          </div>
        </div>

        {/* Center: Bridge Health Status (interactive) */}
        <div className="flex items-center gap-2">
          <BridgeHealthBadge onClick={onOpenBridge} showDetail={true} />
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Username Pill */}
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onOpenAccount();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white text-stone-800 transition-colors cursor-pointer border border-[#C5A059]/30"
            title="Ecosystem Identity & Username Settings"
          >
            <AtSign className="w-3.5 h-3.5 text-[#B8860B]" />
            <span className="font-mono text-[#8B6508] font-bold">@{currentUser.username || 'creator'}</span>
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
              isAdmin ? 'bg-amber-500/20 text-[#8B6508]' : 'bg-stone-200 text-stone-700'
            }`}>
              {isAdmin ? 'Admin' : 'Member'}
            </span>
          </button>

          {/* Notifications Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onOpenNotifications();
            }}
            className="relative p-2 rounded-xl glass-pill hover:bg-white text-stone-700 hover:text-stone-900 transition-colors cursor-pointer border border-[#C5A059]/30"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-[#B8860B]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Account Profile Trigger */}
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onOpenAccount();
            }}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl glass-pill hover:bg-white transition-colors cursor-pointer border border-[#C5A059]/30"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
              alt={currentUser.name}
              className="w-6 h-6 rounded-lg object-cover border border-amber-400/40"
            />
            <span className="text-xs font-semibold text-stone-800 hidden md:inline truncate max-w-[90px]">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
