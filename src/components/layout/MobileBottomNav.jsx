import React from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import {
  LayoutDashboard,
  Layers,
  CalendarDays,
  Bell,
  Menu
} from 'lucide-react';

export default function MobileBottomNav({
  currentView,
  onNavigate,
  onOpenNotifications,
  onOpenMobileMenu
}) {
  const { notifications, currentUser, isAdmin } = useApp();

  const unreadCount = notifications.filter(
    n => !n.read_at && (n.recipient_user_id === currentUser.id || n.recipient_user_id === 'all' || isAdmin)
  ).length;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 px-3 py-1.5 pb-safe backdrop-blur-2xl bg-white/95 shadow-lg select-none">
      <div className="grid grid-cols-5 items-center justify-items-center h-12">
        {/* 1. Pipeline Overview */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onNavigate('overview');
          }}
          className={`w-full flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            currentView === 'overview'
              ? 'text-slate-950 font-bold'
              : 'text-slate-400 hover:text-slate-700 font-medium'
          }`}
          aria-label="Pipeline Overview"
        >
          <div className="relative">
            <LayoutDashboard className={`w-5 h-5 transition-transform ${currentView === 'overview' ? 'scale-110 text-slate-950' : 'text-slate-400'}`} />
            {currentView === 'overview' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-slate-950" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Pipeline</span>
        </button>

        {/* 2. Task Tracker */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onNavigate('tracker');
          }}
          className={`w-full flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            currentView === 'tracker'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-400 hover:text-slate-700 font-medium'
          }`}
          aria-label="Task Tracker"
        >
          <div className="relative">
            <Layers className={`w-5 h-5 transition-transform ${currentView === 'tracker' ? 'scale-110 text-indigo-600' : 'text-slate-400'}`} />
            {currentView === 'tracker' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Tracker</span>
        </button>

        {/* 3. Safar Matrix */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onNavigate('safar');
          }}
          className={`w-full flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            currentView === 'safar'
              ? 'text-slate-950 font-bold'
              : 'text-slate-400 hover:text-slate-700 font-medium'
          }`}
          aria-label="Safar Matrix"
        >
          <div className="relative">
            <CalendarDays className={`w-5 h-5 transition-transform ${currentView === 'safar' ? 'scale-110 text-slate-950' : 'text-slate-400'}`} />
            {currentView === 'safar' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-slate-950" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Safar</span>
        </button>

        {/* 4. Alerts / Notifications */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            if (onOpenNotifications) onOpenNotifications();
          }}
          className="w-full flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-700 font-medium transition-all cursor-pointer relative"
          aria-label="Notifications"
        >
          <div className="relative">
            <Bell className="w-5 h-5 text-slate-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-3.5 h-3.5 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Alerts</span>
        </button>

        {/* 5. Hamburger Menu */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            if (onOpenMobileMenu) onOpenMobileMenu();
          }}
          className="w-full flex flex-col items-center justify-center py-1 text-slate-700 hover:text-slate-950 font-semibold transition-all cursor-pointer"
          aria-label="Menu"
        >
          <div className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
            <Menu className="w-4 h-4 text-slate-800" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold text-slate-800">Menu</span>
        </button>
      </div>
    </nav>
  );
}
