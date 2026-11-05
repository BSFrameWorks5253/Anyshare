import React from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import {
  LayoutDashboard,
  Briefcase,
  ShieldAlert,
  Bell,
  User
} from 'lucide-react';

export default function MobileBottomNav({
  currentView,
  onNavigate,
  onOpenNotifications,
  onOpenAccount
}) {
  const { notifications, currentUser, isAdmin, items } = useApp();

  const unreadCount = notifications.filter(
    n => !n.read_at && (n.recipient_user_id === currentUser.id || isAdmin)
  ).length;

  const correctionCount = items.filter(i => i.status === 'correction_needed').length;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/10 px-3 py-2 pb-safe backdrop-blur-2xl">
      <div className="flex items-center justify-around">
        {/* 1. Overview */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onNavigate('overview');
          }}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
            currentView === 'overview'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Overview</span>
        </button>

        {/* 2. My Work / All Work */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onNavigate('work');
          }}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
            currentView === 'work'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Briefcase className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{isAdmin ? 'Work' : 'My Work'}</span>
        </button>

        {/* 3. Corrections (if admin or if items require review) */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onNavigate('corrections');
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer relative ${
              currentView === 'corrections'
                ? 'text-rose-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <ShieldAlert className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Review</span>
            {correctionCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
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
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer relative ${
            currentView === 'notifications'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Bell className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Alerts</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 min-w-3.5 h-3.5 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
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
          className="flex flex-col items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-200 font-medium transition-all cursor-pointer"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Account</span>
        </button>
      </div>
    </nav>
  );
}
