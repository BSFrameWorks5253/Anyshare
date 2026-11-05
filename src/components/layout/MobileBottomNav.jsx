import React from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import {
  LayoutDashboard,
  Briefcase,
  ShieldAlert,
  Bell,
  User,
  QrCode,
  Users,
  CalendarDays,
  Layers
} from 'lucide-react';

export default function MobileBottomNav({
  currentView,
  onNavigate,
  onOpenNotifications,
  onOpenAccount,
  onOpenQRScanner
}) {
  const { notifications, currentUser, isAdmin, items } = useApp();

  const unreadCount = notifications.filter(
    n => !n.read_at && (n.recipient_user_id === currentUser.id || isAdmin)
  ).length;

  const correctionCount = items.filter(i => i.status === 'correction_needed').length;

  return (
    <nav className="studio-mobile-dock sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-black/[0.06] px-2 py-1.5 pb-safe backdrop-blur-2xl bg-white/85 shadow-lg">
      <div className="flex items-center justify-around">
        {/* 1. Overview */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onNavigate('overview');
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
            currentView === 'overview'
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-500 hover:text-neutral-800 font-medium'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Overview</span>
        </button>

        {/* 1.5 Task Tracker */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onNavigate('tracker');
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
            currentView === 'tracker'
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-500 hover:text-neutral-800 font-medium'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Tracker</span>
        </button>

        {/* 2. My Work / All Work */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onNavigate('work');
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
            currentView === 'work'
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-500 hover:text-neutral-800 font-medium'
          }`}
        >
          <Briefcase className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{isAdmin ? 'Work' : 'My Work'}</span>
        </button>

        {/* 2.5 Safar Hub */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onNavigate('safar');
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
            currentView === 'safar'
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-500 hover:text-neutral-800 font-medium'
          }`}
        >
          <CalendarDays className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Safar</span>
        </button>

        {/* Center: Quick QR Scan Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            if (onOpenQRScanner) onOpenQRScanner();
          }}
          className="flex flex-col items-center justify-center -mt-3.5 p-2 px-3 rounded-2xl bg-neutral-950 text-white shadow-md border border-neutral-700 cursor-pointer active:scale-95 transition-transform"
          title="Scan One Tap App QR"
        >
          <QrCode className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">Scan</span>
        </button>

        {/* 2.6 Team & Users */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onNavigate('users');
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
            currentView === 'users'
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-500 hover:text-neutral-800 font-medium'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Team</span>
        </button>

        {/* 3. Corrections / Review */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onNavigate('corrections');
            }}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer relative ${
              currentView === 'corrections'
                ? 'text-rose-600 font-bold'
                : 'text-neutral-500 hover:text-neutral-800 font-medium'
            }`}
          >
            <ShieldAlert className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Review</span>
            {correctionCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>
        )}

        {/* 4. Notifications */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onOpenNotifications();
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer relative ${
            currentView === 'notifications'
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-500 hover:text-neutral-800 font-medium'
          }`}
        >
          <Bell className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Alerts</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1.5 min-w-3.5 h-3.5 px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* 5. Account */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onOpenAccount();
          }}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-neutral-500 hover:text-neutral-800 font-medium transition-all cursor-pointer"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Account</span>
        </button>
      </div>
    </nav>
  );
}
