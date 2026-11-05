import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import {
  User,
  Shield,
  Database,
  Trash2,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  ExternalLink,
  Code2,
  Edit2,
  Save,
  AtSign,
  Laptop
} from 'lucide-react';

export default function AccountModal({ isOpen, onClose, onOpenDbInspector }) {
  const { currentUser, updateEcosystemUser, runRetentionCleanup, isAdmin } = useApp();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [usernameInput, setUsernameInput] = useState(currentUser.username || '');
  const [nameInput, setNameInput] = useState(currentUser.name || '');
  const [emailInput, setEmailInput] = useState(currentUser.email || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    const cleanUsername = usernameInput.trim().toLowerCase().replace(/[^a-zA-Z0-9_.-]/g, '');

    updateEcosystemUser({
      username: cleanUsername,
      name: nameInput.trim() || currentUser.name,
      email: emailInput.trim() || currentUser.email
    });

    setIsEditingProfile(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRunCleanup = () => {
    const res = runRetentionCleanup();
    setCleanupResult(res);
    sounds.playSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="glass-panel w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden text-left"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-3 bg-gradient-to-r from-indigo-950/40 to-transparent">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
              alt={currentUser.name}
              className="w-12 h-12 rounded-2xl object-cover border border-white/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {currentUser.name}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-indigo-300 font-mono flex items-center gap-1 mt-0.5">
                <AtSign className="w-3 h-3 text-indigo-400" />
                {currentUser.username || 'creator'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Child App Registration Status Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Laptop className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 block">Child App Folder Identity:</span>
                <span className="text-xs font-bold text-white font-mono">Anything share</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Ecosystem Linked
            </span>
          </div>

          {/* Success Banner */}
          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Username updated & synchronized to Anything website and child apps!</span>
            </div>
          )}

          {/* Edit Username / Ecosystem Identity Section */}
          <div className="glass-panel-subtle rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  Anything Website Login Credentials
                </h4>
                <p className="text-[11px] text-slate-400">
                  Set the username you use to log into the Anything website and child apps
                </p>
              </div>

              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setIsEditingProfile(true);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold glass-pill hover:bg-white/10 text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                    Ecosystem Username (@handle)
                  </label>
                  <div className="relative">
                    <AtSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="e.g. burhanuddin or creator_lead"
                      className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="user@anything.local"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setIsEditingProfile(false);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold glass-pill hover:bg-white/10 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-bold glass-button-primary flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save & Sync to Anything</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Username:</span>
                  <span className="font-mono text-indigo-300 font-bold">@{currentUser.username || 'creator'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono text-slate-200">{currentUser.email}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">SSO Storage:</span>
                  <span className="font-mono text-emerald-300">anything_ecosystem_session_v1</span>
                </div>
              </div>
            )}
          </div>

          {/* Retention Policy Section */}
          <div className="glass-panel-subtle rounded-2xl p-4 border border-white/10 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Automated Retention Cleanups
            </h4>
            <div className="space-y-1.5 text-slate-300 text-[11px]">
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Notifications:</span>
                <span className="font-mono text-slate-200">Pruned after 30 days</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Terminal Render Commands:</span>
                <span className="font-mono text-slate-200">Deleted after 7 days</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Completed Work:</span>
                <span className="font-mono text-slate-200">Purged after 90 days</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Account Identity:</span>
                <span className="font-semibold text-emerald-300">Protected (Never auto-deleted)</span>
              </div>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={handleRunCleanup}
                className="w-full mt-2 py-2 rounded-xl text-xs font-semibold glass-pill hover:bg-white/10 text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Test Retention Sweep Now</span>
              </button>
            )}

            {cleanupResult && (
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                Sweep finished: purged {cleanupResult.cleaned_notifications} expired notifications.
              </div>
            )}
          </div>

          {/* Supabase Schema Blueprint Trigger */}
          <div className="glass-panel-subtle rounded-2xl p-4 border border-white/10 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                Supabase Schema Blueprint
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                View DDL schema, tables, and RLS definitions
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onOpenDbInspector();
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white/10 text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Inspect</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold glass-pill hover:bg-white/10 text-slate-300"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
