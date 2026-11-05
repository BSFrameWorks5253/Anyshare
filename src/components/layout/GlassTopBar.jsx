import React from 'react';
import { useApp } from '../../lib/store';
import BridgeHealthBadge from '../common/BridgeHealthBadge';
import UserAvatarWithReflection from '../common/UserAvatarWithReflection';
import { sounds } from '../../lib/sound';
import {
  Bell,
  Zap,
  AtSign,
  QrCode,
  Smartphone,
  CalendarDays,
  Users,
  Briefcase,
  Layers
} from 'lucide-react';

export default function GlassTopBar({
  onOpenNotifications,
  onOpenAccount,
  onOpenBridge,
  onOpenQRScanner,
  onOpenLogin,
  currentView,
  onNavigate
}) {
  const { currentUser, users, notifications, isAdmin, items, canInstallPWA, installPWA } = useApp();

  const unreadCount = notifications.filter(
    n => !n.read_at && (n.recipient_user_id === currentUser.id || isAdmin)
  ).length;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-black/[0.06] px-4 sm:px-8 py-2.5 transition-all backdrop-blur-2xl bg-white/80 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div 
          onClick={() => {
            sounds.playTap();
            onNavigate('overview');
          }}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          {/* Apple-style Obsidian Mark */}
          <div className="w-9 h-9 rounded-xl bg-neutral-950 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 fill-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-neutral-950 font-sans">
                AnyShare
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/80 font-semibold">
                One Tap Nexus
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium hidden sm:block">
              Workstation status & remote render bridge
            </p>
          </div>
        </div>

        {/* Center: Top Navigation Tabs + Bridge Health */}
        <div className="flex items-center gap-3">
          <nav className="hidden lg:flex items-center gap-1 bg-neutral-100/80 p-1 rounded-xl border border-black/[0.04]">
            <button
              type="button"
              onClick={() => { sounds.playTap(); onNavigate('overview'); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'overview'
                  ? 'bg-white text-neutral-950 shadow-xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/60'
              }`}
            >
              Pipeline
            </button>
            <button
              type="button"
              onClick={() => { sounds.playTap(); onNavigate('work'); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'work'
                  ? 'bg-white text-neutral-950 shadow-xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/60'
              }`}
            >
              <span>Productions</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 text-neutral-800 font-bold">
                {items.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => { sounds.playTap(); onNavigate('tracker'); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'tracker'
                  ? 'bg-white text-neutral-950 shadow-xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-neutral-600" />
              <span>Task Tracker</span>
            </button>
            <button
              type="button"
              onClick={() => { sounds.playTap(); onNavigate('safar'); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'safar'
                  ? 'bg-white text-neutral-950 shadow-xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/60'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-neutral-600" />
              <span>Safar Hub</span>
            </button>
            <button
              type="button"
              onClick={() => { sounds.playTap(); onNavigate('users'); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'users'
                  ? 'bg-white text-neutral-950 shadow-xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/60'
              }`}
            >
              <span>Team</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 text-neutral-800 font-bold">
                {users.length}
              </span>
            </button>
          </nav>

          <BridgeHealthBadge onClick={onOpenBridge} showDetail={true} />
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Active Username / Sign In Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              if (onOpenLogin) {
                onOpenLogin();
              } else {
                onOpenAccount();
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white text-neutral-800 transition-colors cursor-pointer border border-black/[0.08] shadow-xs"
            title="Log In or Switch Ecosystem Account"
          >
            <AtSign className="w-3.5 h-3.5 text-neutral-500" />
            <span className="font-mono text-neutral-900 font-bold">@{currentUser.username || 'creator'}</span>
            <span className={`hidden sm:inline-block text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
              isAdmin ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white text-neutral-800 transition-colors cursor-pointer border border-black/[0.08] shadow-xs"
            title="Scan One Tap App QR Code to Log In & Sync Workstation"
          >
            <QrCode className="w-3.5 h-3.5 text-neutral-700" />
            <span className="hidden sm:inline font-medium">QR Login</span>
          </button>

          {/* Install PWA Button (when installable) */}
          {canInstallPWA && (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                installPWA();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
              title="Install AnyShare to Home Screen"
            >
              <Smartphone className="w-3.5 h-3.5 text-neutral-200" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* Notifications Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onOpenNotifications();
            }}
            className="relative p-2 rounded-xl glass-pill hover:bg-white text-neutral-700 hover:text-neutral-950 transition-colors cursor-pointer border border-black/[0.08] shadow-xs"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-neutral-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Account Profile Trigger with Apple Liquid Glass DP Light Reflection ONLY */}
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onOpenAccount();
            }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full glass-pill hover:bg-white transition-all cursor-pointer border border-black/[0.08] shadow-xs"
            title="Open Account Profile & Settings"
          >
            <UserAvatarWithReflection
              src={currentUser.avatar}
              alt={currentUser.name}
              size="sm"
            />
            <span className="text-xs font-semibold text-neutral-900 hidden md:inline truncate max-w-[90px]">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
