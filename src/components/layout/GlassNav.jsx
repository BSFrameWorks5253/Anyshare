import React from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import {
  LayoutDashboard,
  Briefcase,
  ShieldAlert,
  Bell,
  Cpu,
  Database,
  QrCode,
  Users,
  CalendarDays
} from 'lucide-react';

export default function GlassNav({
  currentView,
  onNavigate,
  onOpenNotifications,
  onOpenAccount,
  onOpenBridge,
  onOpenDbInspector,
  onOpenQRScanner
}) {
  const { notifications, currentUser, users, isAdmin, items, bridge } = useApp();

  const unreadCount = notifications.filter(
    n => !n.read_at && (n.recipient_user_id === currentUser.id || isAdmin)
  ).length;

  const correctionCount = items.filter(i => i.status === 'correction_needed').length;

  const navItems = [
    {
      id: 'overview',
      label: 'Pipeline Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'tracker',
      label: 'Task Tracker',
      icon: CalendarDays,
      badge: 'Nexus',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
    },
    {
      id: 'work',
      label: isAdmin ? 'Production Queue' : 'My Assigned Work',
      icon: Briefcase,
      badge: items.length
    },
    {
      id: 'safar',
      label: 'Safar Hub & Uploads',
      icon: CalendarDays,
      badge: 'Matrix',
      badgeColor: 'bg-neutral-100 text-neutral-700 border-neutral-200'
    },
    {
      id: 'users',
      label: 'Team Directory',
      icon: Users,
      badge: users.length,
      badgeColor: 'bg-neutral-100 text-neutral-800 border-neutral-200'
    },
    ...(isAdmin ? [{
      id: 'corrections',
      label: 'Correction Queue',
      icon: ShieldAlert,
      badge: correctionCount > 0 ? correctionCount : null,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
    }] : [])
  ];

  return (
    <aside className="studio-sidebar hidden lg:flex flex-col w-64 border-r border-black/[0.06] p-4 shrink-0 select-none bg-white/60 backdrop-blur-2xl">
      {/* Navigation Group */}
      <div className="space-y-1 mb-8">
        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 mb-2">
          Workspace Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                sounds.playTap();
                onNavigate(item.id);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-neutral-950 text-white font-bold shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70 font-semibold'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== null && item.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isActive ? 'bg-neutral-800 text-neutral-200 border-neutral-700' : (item.badgeColor || 'bg-neutral-100 text-neutral-700 border-neutral-200/80')
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Systems & Diagnostics Section */}
      <div className="space-y-1 mb-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 mb-2">
          Systems & Hardware
        </div>

        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            if (onOpenQRScanner) onOpenQRScanner();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-neutral-800 bg-white/80 hover:bg-white border border-black/[0.06] transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <QrCode className="w-4 h-4 text-neutral-700" />
            <span>QR Login & Sync</span>
          </div>
          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200 font-bold">SCAN</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onOpenBridge();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-neutral-500" />
            <span>One Tap Node</span>
          </div>
          <span className={`w-2 h-2 rounded-full ${bridge.is_online ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onOpenNotifications();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-neutral-500" />
            <span>Notifications</span>
          </div>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onOpenDbInspector();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-neutral-500" />
            <span>Supabase Schema</span>
          </div>
        </button>
      </div>

      {/* Footer Workstation Card */}
      <div className="sidebar-node p-3 rounded-xl border border-black/[0.06] text-xs space-y-1 bg-white/70 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-neutral-500 font-medium">Node</span>
          <span className={`text-[10px] font-mono font-bold ${bridge.is_online ? 'text-emerald-600' : 'text-neutral-500'}`}>
            {bridge.is_online ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
        <div className="text-neutral-950 font-bold truncate">{bridge.label?.split(' (')[0] || 'One Tap workstation'}</div>
        <div className="text-[10px] text-neutral-500 truncate">{bridge.last_scan_at ? 'Folder scan connected' : 'Waiting for first scan'}</div>
      </div>
    </aside>
  );
}
