import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import {
  Bell,
  CheckCheck,
  BellRing,
  AlertTriangle,
  Play,
  CheckCircle2,
  Sliders,
  Send,
  Trash2,
  Clock
} from 'lucide-react';

export default function NotificationCenter({ onSelectItem }) {
  const {
    notifications,
    currentUser,
    markNotificationRead,
    markAllNotificationsRead,
    pushEnabled,
    setPushEnabled,
    items
  } = useApp();

  const [filterKind, setFilterKind] = useState('all');

  // Filter notifications for this user (or all if admin)
  const userNotifications = notifications.filter(
    n => n.recipient_user_id === currentUser.id || currentUser.role === 'admin'
  );

  const filteredNotifications = filterKind === 'all'
    ? userNotifications
    : userNotifications.filter(n => n.kind === filterKind);

  const unreadCount = userNotifications.filter(n => !n.read_at).length;

  const handleTogglePush = async () => {
    sounds.playTap();
    if (!pushEnabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setPushEnabled(true);
          sounds.playSuccess();
        } else {
          sounds.playAlert();
        }
      } else {
        setPushEnabled(true);
      }
    } else {
      setPushEnabled(false);
    }
  };

  const getKindIcon = (kind) => {
    switch (kind) {
      case 'render_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'render_started':
        return <Play className="w-4 h-4 text-amber-400" />;
      case 'correction_needed':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'assigned':
        return <Send className="w-4 h-4 text-indigo-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header card with Web Push Toggle */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              Notifications Inbox
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Real-time verified status alerts from One Tap workstation. Retained for 30 days.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Push Notifications Toggle */}
          <button
            type="button"
            onClick={handleTogglePush}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
              pushEnabled
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'glass-pill text-slate-400 hover:text-slate-200'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>Web Push: {pushEnabled ? 'Active' : 'Disabled'}</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white/10 text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['all', 'render_completed', 'correction_needed', 'render_started', 'assigned'].map((k) => (
          <button
            key={k}
            onClick={() => {
              sounds.playTap();
              setFilterKind(k);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer capitalize ${
              filterKind === k
                ? 'bg-indigo-600 text-white'
                : 'glass-panel-subtle text-slate-400 hover:text-slate-200'
            }`}
          >
            {k === 'all' ? 'All Alerts' : k.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Inbox Zero</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have no notifications in this category. Render completions and correction requests will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const isUnread = !notif.read_at;
            const relatedItem = items.find(i => i.id === notif.item_id);

            return (
              <div
                key={notif.id}
                onClick={() => {
                  sounds.playTap();
                  if (isUnread) markNotificationRead(notif.id);
                  if (relatedItem && onSelectItem) {
                    onSelectItem(relatedItem);
                  }
                }}
                className={`glass-panel rounded-2xl p-4 border transition-all cursor-pointer flex items-start gap-4 ${
                  isUnread
                    ? 'border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10'
                    : 'border-white/10 hover:bg-white/5 opacity-80'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 shrink-0 mt-0.5">
                  {getKindIcon(notif.kind)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`text-sm font-bold truncate ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {timeAgo(notif.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-2">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="capitalize">Channel: <strong className="text-slate-300">{notif.delivery_state}</strong></span>
                    {relatedItem && (
                      <span className="text-indigo-300 font-mono underline truncate max-w-[200px]">
                        {relatedItem.display_label}
                      </span>
                    )}
                  </div>
                </div>

                {isUnread && (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 mt-2" title="Unread" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
