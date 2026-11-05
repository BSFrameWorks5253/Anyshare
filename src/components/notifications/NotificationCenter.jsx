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
  Clock,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function NotificationCenter({ onSelectItem, onNavigateToTracker }) {
  const {
    notifications,
    currentUser,
    markNotificationRead,
    markAllNotificationsRead,
    items
  } = useApp();

  const [filterKind, setFilterKind] = useState('all');

  // Filter notifications for this user (or all if admin)
  const userNotifications = notifications.filter(
    n => n.recipient_user_id === currentUser.id || n.recipient_user_id === 'all' || currentUser.role === 'admin'
  );

  const filteredNotifications = filterKind === 'all'
    ? userNotifications
    : userNotifications.filter(n => n.kind === filterKind);

  const unreadCount = userNotifications.filter(n => !n.read_at).length;

  const getKindIcon = (kind) => {
    switch (kind) {
      case 'batch_render_completed':
        return <Cpu className="w-4 h-4 text-emerald-600" />;
      case 'render_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'render_started':
        return <Play className="w-4 h-4 text-neutral-800" />;
      case 'correction_needed':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'assigned':
        return <Send className="w-4 h-4 text-[#334155]" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-500" />;
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
      {/* Header card with Supabase Realtime Stream Live Badge */}
      <div className="glass-panel rounded-3xl p-6 border border-[rgba(0,0,0,0.08)]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h2 className="text-xl font-black text-neutral-950 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#334155]" />
              Notifications Inbox
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-200 text-neutral-950 border border-neutral-300">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-700 font-medium">
            Direct real-time notification stream from Supabase. Hardware render completions and preflight flags update automatically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Supabase Live Stream Indicator */}
          <div className="px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-500/30 bg-emerald-50 text-emerald-900 flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Supabase Live Channel</span>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="px-3.5 py-2 rounded-xl text-xs font-bold glass-pill hover:bg-neutral-200 text-neutral-900 flex items-center gap-1.5 cursor-pointer border border-[rgba(0,0,0,0.08)]/30"
            >
              <CheckCheck className="w-4 h-4 text-[#334155]" />
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition-all cursor-pointer capitalize ${
              filterKind === k
                ? 'bg-neutral-950 text-[#F5E6C8] shadow-sm'
                : 'bg-white/80 border border-[rgba(0,0,0,0.08)]/25 text-neutral-700 hover:text-neutral-950 hover:bg-white'
            }`}
          >
            {k === 'all' ? 'All Alerts' : k.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-[rgba(0,0,0,0.08)]/30 bg-white/85 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-[rgba(0,0,0,0.08)]/40 text-[#334155] flex items-center justify-center mx-auto mb-4">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-neutral-950 mb-1">Inbox Zero</h3>
          <p className="text-xs text-neutral-700 max-w-sm mx-auto font-medium">
            You have no notifications in this category. Render completions and correction requests stream here live from Supabase.
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
                className={`card-luxury rounded-2xl p-4 border transition-all cursor-pointer flex items-start gap-4 ${
                  isUnread
                    ? 'border-[rgba(0,0,0,0.08)] bg-neutral-50/80 hover:bg-neutral-100/70 shadow-sm'
                    : 'border-[rgba(0,0,0,0.08)]/25 bg-white/90 hover:bg-white shadow-xs'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-neutral-50 border border-[rgba(0,0,0,0.08)]/30 shrink-0 mt-0.5">
                  {getKindIcon(notif.kind)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-black text-neutral-950 truncate">
                      {notif.title}
                    </h4>
                    <span className="text-[11px] text-[#1e293b] font-bold shrink-0 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-[#0f172a]" />
                      {timeAgo(notif.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-800 font-medium leading-relaxed mb-2">
                    {notif.message}
                  </p>

                  {(notif.safarName || notif.dateFolder) && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                      {notif.safarName && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200/80 font-mono">
                          {notif.safarName}
                        </span>
                      )}
                      {notif.dateFolder && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200/80 font-mono">
                          {notif.dateFolder}
                        </span>
                      )}
                      {notif.batchSize && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          {notif.batchSize} Deliverables
                        </span>
                      )}
                      {onNavigateToTracker && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            sounds.playTap();
                            if (isUnread) markNotificationRead(notif.id);
                            onNavigateToTracker();
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-950 bg-neutral-200/80 hover:bg-neutral-300 px-2 py-0.5 rounded-md transition-colors"
                        >
                          <span>View in Tracker</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-neutral-600 font-semibold">
                    <span>Source: <strong className="text-neutral-950">Supabase Channel</strong></span>
                    {relatedItem && (
                      <span className="text-[#334155] font-mono underline truncate max-w-[200px]">
                        {relatedItem.display_label}
                      </span>
                    )}
                  </div>
                </div>

                {isUnread && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0f172a] shrink-0 mt-2" title="Unread" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
