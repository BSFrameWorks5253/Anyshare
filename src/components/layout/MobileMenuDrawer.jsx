import React from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import UserAvatarWithReflection from '../common/UserAvatarWithReflection';
import {
  LayoutDashboard,
  Layers,
  Briefcase,
  CalendarDays,
  Users,
  ShieldAlert,
  QrCode,
  Cpu,
  Bell,
  Database,
  User,
  Smartphone,
  X,
  Zap,
  ChevronRight,
  Radio,
  ExternalLink
} from 'lucide-react';

export default function MobileMenuDrawer({
  isOpen,
  onClose,
  currentView,
  onNavigate,
  onOpenNotifications,
  onOpenAccount,
  onOpenBridge,
  onOpenQRScanner,
  onOpenDbInspector,
  onOpenLogin
}) {
  const {
    currentUser,
    users,
    isAdmin,
    items,
    notifications,
    safarCampaigns,
    bridge,
    canInstallPWA,
    installPWA
  } = useApp();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(
    n => !n.read_at && (n.recipient_user_id === currentUser.id || n.recipient_user_id === 'all' || isAdmin)
  ).length;

  const correctionCount = items.filter(i => i.status === 'correction_needed').length;

  const handleNavClick = (viewId) => {
    sounds.playTap();
    onNavigate(viewId);
    onClose();
  };

  const handleActionClick = (actionFn) => {
    sounds.playTap();
    onClose();
    if (actionFn) actionFn();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click area */}
      <div 
        className="fixed inset-0 -z-10"
        onClick={() => {
          sounds.playTap();
          onClose();
        }}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div 
        className="w-full max-w-sm h-full bg-white/95 backdrop-blur-2xl border-l border-slate-200/90 shadow-2xl flex flex-col overflow-hidden text-left"
        role="dialog"
        aria-modal="true"
      >
        {/* 1. Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-2xs">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-slate-900 font-sans">
                  AnyShare
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  Nexus
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                One Tap Remote Studio
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close Navigation Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. User & Workstation Status Card */}
        <div className="p-4 border-b border-slate-200/70 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatarWithReflection
                src={currentUser.avatar}
                alt={currentUser.name}
                size="md"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {currentUser.name}
                  </h4>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {isAdmin ? 'Admin' : 'Member'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono truncate">
                  @{currentUser.username || 'editor'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleActionClick(onOpenLogin || onOpenAccount)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 transition-colors shrink-0 cursor-pointer"
            >
              Switch
            </button>
          </div>

          {/* Workstation Node Live Connectivity Pill */}
          <div 
            onClick={() => handleActionClick(onOpenBridge)}
            className="mt-2.5 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer hover:bg-slate-100/70 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${bridge.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="font-semibold text-slate-800">
                {bridge.is_online ? 'Workstation Online' : 'Node Disconnected'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-medium">
              Port 5253
            </span>
          </div>
        </div>

        {/* 3. Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Primary Navigation */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
              Workspace Views
            </div>

            <div className="space-y-1">
              {/* Pipeline Overview */}
              <button
                type="button"
                onClick={() => handleNavClick('overview')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  currentView === 'overview'
                    ? 'bg-slate-950 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${currentView === 'overview' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div>Pipeline Overview</div>
                    <div className={`text-[10px] font-normal ${currentView === 'overview' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Active renders & stage milestones
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${currentView === 'overview' ? 'text-white' : 'text-slate-400'}`} />
              </button>

              {/* Task Tracker */}
              <button
                type="button"
                onClick={() => handleNavClick('tracker')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  currentView === 'tracker'
                    ? 'bg-slate-950 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${currentView === 'tracker' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span>Task Tracker</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                        Nexus
                      </span>
                    </div>
                    <div className={`text-[10px] font-normal ${currentView === 'tracker' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Safar deliverables & workstation stepper
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${currentView === 'tracker' ? 'text-white' : 'text-slate-400'}`} />
              </button>

              {/* Productions Queue */}
              <button
                type="button"
                onClick={() => handleNavClick('work')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  currentView === 'work'
                    ? 'bg-slate-950 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${currentView === 'work' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div>{isAdmin ? 'Production Queue' : 'My Assigned Work'}</div>
                    <div className={`text-[10px] font-normal ${currentView === 'work' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Individual video deliverables
                    </div>
                  </div>
                </div>
                {items.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    currentView === 'work' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {items.length}
                  </span>
                )}
              </button>

              {/* Safar Hub & Upload Matrix */}
              <button
                type="button"
                onClick={() => handleNavClick('safar')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  currentView === 'safar'
                    ? 'bg-slate-950 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${currentView === 'safar' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div>Safar Hub & Matrix</div>
                    <div className={`text-[10px] font-normal ${currentView === 'safar' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Central 4K master uploads & verification
                    </div>
                  </div>
                </div>
                {safarCampaigns.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    currentView === 'safar' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {safarCampaigns.length}
                  </span>
                )}
              </button>

              {/* Team Directory & Editors */}
              <button
                type="button"
                onClick={() => handleNavClick('users')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  currentView === 'users'
                    ? 'bg-slate-950 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${currentView === 'users' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div>Team Directory</div>
                    <div className={`text-[10px] font-normal ${currentView === 'users' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Editors, roles & assignments
                    </div>
                  </div>
                </div>
                {users.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    currentView === 'users' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {users.length}
                  </span>
                )}
              </button>

              {/* Correction Queue (Admin Only) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleNavClick('corrections')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    currentView === 'corrections'
                      ? 'bg-rose-600 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:text-rose-700 hover:bg-rose-50/70 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${currentView === 'corrections' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-600'}`}>
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div>Correction Queue</div>
                      <div className={`text-[10px] font-normal ${currentView === 'corrections' ? 'text-rose-200' : 'text-slate-500'}`}>
                        Flagged items needing changes
                      </div>
                    </div>
                  </div>
                  {correctionCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white">
                      {correctionCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Quick Hardware & Studio Tools */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
              Hardware & Utilities
            </div>

            <div className="space-y-1.5">
              {/* Scan QR */}
              <button
                type="button"
                onClick={() => handleActionClick(onOpenQRScanner)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100/90 border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <span>Pair One Tap Workstation</span>
                </div>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                  Scan QR
                </span>
              </button>

              {/* Workstation Bridge Health */}
              <button
                type="button"
                onClick={() => handleActionClick(onOpenBridge)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span>Bridge Diagnostics</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {bridge.is_online ? 'Port 5253' : 'Offline'}
                </span>
              </button>

              {/* Notifications Alert Center */}
              <button
                type="button"
                onClick={() => handleActionClick(onOpenNotifications)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                    <Bell className="w-4 h-4" />
                  </div>
                  <span>Notifications & Alerts</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Database Inspector */}
              <button
                type="button"
                onClick={() => handleActionClick(onOpenDbInspector)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                    <Database className="w-4 h-4" />
                  </div>
                  <span>Database Inspector</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Supabase
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Drawer Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/70 space-y-2 shrink-0">
          {/* Install Web App Button (if eligible) */}
          {canInstallPWA && (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                installPWA();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Install AnyShare App</span>
            </button>
          )}

          {/* Account Profile Trigger */}
          <button
            type="button"
            onClick={() => handleActionClick(onOpenAccount)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-slate-500" />
              <span>Account & Security</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <div className="pt-1 text-center text-[10px] text-slate-400 font-mono">
            AnyShare Web Portal • One Tap Nexus v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
