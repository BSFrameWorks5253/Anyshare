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
  User,
  ExternalLink,
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
      badgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 font-black'
    },
    {
      id: 'users',
      label: 'Team & User Intelligence',
      icon: Users,
      badge: users.length,
      badgeColor: 'bg-amber-100 text-[#785005] border-amber-300'
    },
    ...(isAdmin ? [{
      id: 'corrections',
      label: 'Correction Queue',
      icon: ShieldAlert,
      badge: correctionCount > 0 ? correctionCount : null,
      badgeColor: 'bg-rose-500/15 text-rose-800 border-rose-400/40'
    }] : [])
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 glass-panel border-r border-[#C5A059]/25 p-5 shrink-0 select-none bg-white/70">
      {/* Navigation Group */}
      <div className="space-y-1.5 mb-8">
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-3 mb-2">
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
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-100/90 to-amber-50/70 text-[#785406] border border-amber-400/50 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#B8860B]' : 'text-stone-500'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== null && item.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  item.badgeColor || 'bg-stone-200/80 text-stone-700 border-stone-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Systems & Diagnostics Section */}
      <div className="space-y-1.5 mb-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-3 mb-2">
          Systems & Hardware
        </div>

        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            if (onOpenQRScanner) onOpenQRScanner();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#8A6614] bg-amber-100/70 hover:bg-amber-100 border border-amber-300 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-3">
            <QrCode className="w-4 h-4 text-[#8A6614]" />
            <span>QR Login & Sync</span>
          </div>
          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-white text-stone-900 border border-amber-300 font-black">SCAN</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onOpenBridge();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100/60 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>One Tap Node</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onOpenNotifications();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100/60 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-[#B8860B]" />
            <span>Notification Feed</span>
          </div>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-800 border border-rose-300">
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
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100/60 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-amber-700" />
            <span>Supabase DDL</span>
          </div>
        </button>
      </div>

      {/* Footer Workstation Card */}
      <div className="p-3.5 rounded-2xl glass-panel-subtle border border-[#C5A059]/20 text-xs space-y-1 bg-amber-50/50">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-stone-500 font-medium">Node</span>
          <span className="text-[10px] font-mono text-emerald-700 font-bold">ONLINE</span>
        </div>
        <div className="text-stone-900 font-bold truncate">Studio-PC-01</div>
        <div className="text-[10px] text-stone-500 truncate">NVENC 4K UHD Master Encoder</div>
      </div>
    </aside>
  );
}
