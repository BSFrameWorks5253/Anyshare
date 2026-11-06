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
  Layers,
  ChevronDown,
  Menu
} from 'lucide-react';

export default function GlassTopBar({
  onOpenNotifications,
  onOpenAccount,
  onOpenBridge,
  onOpenQRScanner,
  onOpenLogin,
  onOpenMobileMenu,
  currentView,
  onNavigate
}) {
  const { currentUser, users, notifications, isAdmin, items, canInstallPWA, installPWA } = useApp();

  const unreadCount = notifications.filter(
    n => !n.read_at && (n.recipient_user_id === currentUser.id || n.recipient_user_id === 'all' || isAdmin)
  ).length;

  return (
    <header className="sticky top-0 z-30 w-full h-14 border-b border-slate-200/80 px-4 sm:px-6 transition-all backdrop-blur-xl bg-white/90 shadow-2xs flex items-center">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand + Workstation Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div 
            onClick={() => {
              sounds.playTap();
              onNavigate('overview');
            }}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            {/* Minimalist Studio Logo Tile */}
            <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center text-white shadow-2xs group-hover:bg-indigo-600 transition-colors">
              <Zap className="w-3.5 h-3.5 fill-white" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-slate-900 font-sans">
                AnyShare
              </span>
            </div>
          </div>

          <span className="h-4 w-px bg-slate-200/80 hidden sm:block" />

          {/* Workstation Node Live Status Badge */}
          <BridgeHealthBadge onClick={onOpenBridge} showDetail={true} />
        </div>

        {/* Center: Clean Segmented Navigation (Linear/Apple Studio Style) */}
        <nav className="hidden lg:flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/70 shadow-2xs">
          <button
            type="button"
            onClick={() => { sounds.playTap(); onNavigate('overview'); }}
            className={`h-7 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === 'overview'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>Pipeline</span>
          </button>

          <button
            type="button"
            onClick={() => { sounds.playTap(); onNavigate('tracker'); }}
            className={`h-7 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === 'tracker'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Task Tracker</span>
          </button>

          <button
            type="button"
            onClick={() => { sounds.playTap(); onNavigate('work'); }}
            className={`h-7 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              currentView === 'work'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>Productions</span>
            {items.length > 0 && (
              <span className="text-[10px] font-mono text-slate-400 font-medium ml-0.5">
                {items.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => { sounds.playTap(); onNavigate('safar'); }}
            className={`h-7 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === 'safar'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
            <span>Safar Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => { sounds.playTap(); onNavigate('users'); }}
            className={`h-7 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              currentView === 'users'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>Team</span>
            {users.length > 0 && (
              <span className="text-[10px] font-mono text-slate-400 font-medium ml-0.5">
                {users.length}
              </span>
            )}
          </button>
        </nav>

        {/* Right: Consolidated Action Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* QR Scanner Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onOpenQRScanner();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-100/90 border border-slate-200/80 transition-colors cursor-pointer shadow-2xs"
            title="Scan One Tap App QR Code to Link Workstation"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>

          {/* Install PWA Button (when installable) */}
          {canInstallPWA && (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                installPWA();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-100/90 border border-slate-200/80 transition-colors cursor-pointer shadow-2xs"
              title="Install to Desktop / Mobile"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-600" />
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
            className="relative p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100/90 border border-slate-200/80 transition-colors cursor-pointer shadow-2xs"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                {unreadCount}
              </span>
            )}
          </button>

          <span className="h-4 w-px bg-slate-200/80 mx-0.5" />

          {/* Account Profile Trigger */}
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
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100/90 border border-transparent hover:border-slate-200/80 transition-all cursor-pointer group"
            title="Account & Settings"
          >
            <UserAvatarWithReflection
              src={currentUser.avatar}
              alt={currentUser.name}
              size="sm"
            />
            <div className="flex items-center gap-1.5 hidden md:flex">
              <span className="text-xs font-semibold text-slate-800 font-mono">
                @{currentUser.username || 'creator'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {isAdmin ? 'Admin' : 'Member'}
              </span>
            </div>
          </button>

          {/* Mobile Hamburger Menu Trigger */}
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              if (onOpenMobileMenu) onOpenMobileMenu();
            }}
            className="lg:hidden p-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100/90 border border-slate-200/80 transition-colors cursor-pointer shadow-2xs ml-0.5"
            aria-label="Open Navigation Menu"
            title="Open Menu"
          >
            <Menu className="w-4 h-4 text-slate-800" />
          </button>
        </div>
      </div>
    </header>
  );
}
