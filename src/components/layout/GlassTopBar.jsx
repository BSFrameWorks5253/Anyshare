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
  AtSign,
  QrCode,
  Smartphone
} from 'lucide-react';

export default function GlassTopBar({
  onOpenNotifications,
  onOpenAccount,
  onOpenBridge,
  onOpenQRScanner,
  currentView,
  onNavigate
}) {
  const { currentUser, notifications, isAdmin, items, canInstallPWA, installPWA } = useApp();

  const unreadCount = notifications.filter(
    n => !n.read_at && (n.recipient_user_id === currentUser.id || isAdmin)
  ).length;

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-[#C5A059]/35 px-4 sm:px-8 py-3 transition-all backdrop-blur-2xl bg-white/90 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo with Islamic Khatam Star Crest */}
        <div 
          onClick={() => {
            sounds.playTap();
            onNavigate('overview');
          }}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          {/* Islamic Golden AnyShare Monogram with animated Khatam star */}
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D4AF37] via-[#F7E7A9] to-[#8A6614] p-0.5 shadow-md shadow-amber-900/15 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-[#FAF8F5] rounded-[14px] flex items-center justify-center relative overflow-hidden border border-[#D4AF37]/40">
              {/* Islamic 8-pointed star rotating watermark */}
              <svg className="absolute inset-0 w-full h-full p-1 opacity-25 animate-khatam-spin text-[#8A6614]" viewBox="0 0 100 100" fill="currentColor">
                <rect x="25" y="25" width="50" height="50" transform="rotate(0 50 50)" />
                <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)" />
              </svg>
              <Zap className="w-4 h-4 text-[#8A6614] fill-[#D4AF37] relative z-10" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-stone-950 group-hover:text-[#8A6614] transition-colors font-serif">
                AnyShare
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-stone-950 border border-amber-300 font-extrabold">
                One Tap Nexus
              </span>
            </div>
            <p className="text-[11px] text-stone-600 font-medium hidden sm:block">
              One Tap production status & remote render bridge
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
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold glass-pill hover:bg-white text-stone-900 transition-colors cursor-pointer border border-[#C5A059]/40 shadow-xs"
            title="Ecosystem Identity & Username Settings"
          >
            <AtSign className="w-3.5 h-3.5 text-[#8A6614]" />
            <span className="font-mono text-[#785005] font-extrabold">@{currentUser.username || 'creator'}</span>
            <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${
              isAdmin ? 'bg-amber-200 text-stone-950 border border-amber-400' : 'bg-stone-200 text-stone-900'
            }`}>
              {isAdmin ? 'Admin' : 'Member'}
            </span>
          </button>

          {/* QR Login & Sync Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onOpenQRScanner();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-stone-950 transition-colors cursor-pointer border border-[#C5A059]/50 shadow-xs"
            title="Scan One Tap App QR Code to Log In & Sync Workstation"
          >
            <QrCode className="w-3.5 h-3.5 text-[#8A6614]" />
            <span className="hidden sm:inline">QR Login</span>
          </button>

          {/* Install PWA Button (when installable) */}
          {canInstallPWA && (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                installPWA();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-stone-900 text-[#FAF8F5] hover:bg-stone-800 transition-colors cursor-pointer border border-[#C5A059]/60 shadow-xs animate-bounce"
              title="Install AnyShare to Home Screen"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Notifications Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onOpenNotifications();
            }}
            className="relative p-2.5 rounded-xl glass-pill hover:bg-white text-stone-800 hover:text-stone-950 transition-colors cursor-pointer border border-[#C5A059]/40 shadow-xs"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-[#8A6614]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
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
