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
  ExternalLink
} from 'lucide-react';

export default function GlassNav({
  currentView,
  onNavigate,
  onOpenNotifications,
  onOpenAccount,
  onOpenBridge,
  onOpenDbInspector
}) {
  const { notifications, currentUser, isAdmin, items, bridge } = useApp();

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
    ...(isAdmin ? [{
      id: 'corrections',
      label: 'Correction Queue',
      icon: ShieldAlert,
      badge: correctionCount > 0 ? correctionCount : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    }] : [])
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 glass-panel border-r border-white/10 p-5 shrink-0 select-none">
      {/* Navigation Group */}
      <div className="space-y-1 mb-8">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
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
                  ? 'bg-indigo-600/25 text-white border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== null && item.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  item.badgeColor || 'bg-slate-800 text-slate-300 border-white/5'
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
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
          Systems & Hardware
        </div>

        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onOpenBridge();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>One Tap Node</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onOpenNotifications();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-indigo-400" />
            <span>Notification Feed</span>
          </div>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
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
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Supabase DDL</span>
          </div>
        </button>
      </div>

      {/* Footer Workstation Card */}
      <div className="p-3 rounded-2xl glass-panel-subtle border border-white/5 text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Node</span>
          <span className="text-[10px] font-mono text-emerald-300 font-bold">ONLINE</span>
        </div>
        <div className="text-white font-bold truncate">Studio-PC-01</div>
        <div className="text-[10px] text-slate-400 truncate">NVENC 4K UHD Encoder</div>
      </div>
    </aside>
  );
}
