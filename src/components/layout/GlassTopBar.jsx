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
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/10 px-4 sm:px-8 py-3 transition-all backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div 
          onClick={() => {
            sounds.playTap();
            onNavigate('overview');
          }}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          {/* Custom AnyShare Icon */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-950/50 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-[#080d1a] rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/30" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                AnyShare
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                One Tap Bridge
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
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
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold glass-pill hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
            title="Ecosystem Identity & Username Settings"
          >
            <AtSign className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-cyan-300">{currentUser.username || 'creator'}</span>
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
              isAdmin ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700/50 text-slate-300'
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
            className="relative p-2 rounded-xl glass-pill hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-indigo-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
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
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl glass-pill hover:bg-white/10 transition-colors cursor-pointer"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
              alt={currentUser.name}
              className="w-6 h-6 rounded-lg object-cover border border-white/20"
            />
            <span className="text-xs font-medium text-slate-200 hidden md:inline truncate max-w-[90px]">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
