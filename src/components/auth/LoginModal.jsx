import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import {
  LogIn,
  Zap,
  AtSign,
  QrCode,
  CheckCircle2,
  X,
  ArrowRight
} from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onOpenQRScanner }) {
  const { currentUser, users, updateEcosystemUser, switchUser, syncWithOneTapNode } = useApp();

  const [inputUsername, setInputUsername] = useState('');
  const [inputDisplayName, setInputDisplayName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleOneClickSync = async () => {
    setIsSyncing(true);
    setErrorMsg('');
    sounds.playTap();
    try {
      const res = await syncWithOneTapNode();
      if (res?.success && res.user) {
        setSuccessMsg(`Synchronized! Logged in as ${res.user.name} (@${res.user.username}) with ${res.user.role.toUpperCase()} privileges.`);
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res?.error || 'Could not connect to One Tap desktop bridge on port 5253. Make sure One Tap is running.');
      }
    } catch (e) {
      setErrorMsg('Sync error: ' + (e?.message || 'Connection failed'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!inputUsername.trim()) return;

    const cleanUsername = inputUsername.trim().toLowerCase().replace(/[^a-zA-Z0-9_.-]/g, '');

    // Check if user already exists in roster
    const existing = users.find(u => u.username?.toLowerCase() === cleanUsername);

    if (existing) {
      switchUser(existing.id);
      setSuccessMsg(`Welcome back, ${existing.name}! Logged in as @${existing.username}.`);
    } else {
      // Create or update active user identity
      const name = inputDisplayName.trim() || cleanUsername;
      const isUserAdmin = cleanUsername === 'admin' || cleanUsername === 'burhanuddin';
      updateEcosystemUser({
        name,
        username: cleanUsername,
        email: `${cleanUsername}@anything.local`,
        role: isUserAdmin ? 'admin' : 'member'
      });
      setSuccessMsg(`Account synchronized! You are now logged in as @${cleanUsername}.`);
    }

    sounds.playSuccess();
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleQuickSwitch = (userId) => {
    sounds.playTap();
    switchUser(userId);
    const u = users.find(x => x.id === userId);
    setSuccessMsg(`Switched identity to @${u?.username || 'user'}`);
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn text-left">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-2xs">
              <LogIn className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans">Sign In to AnyShare</h3>
              <p className="text-[11px] text-slate-500 font-medium">Workstation & Team Identity Authentication</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {successMsg ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-center space-y-2 animate-fadeIn">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold">{successMsg}</p>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Method 1: Instant 1-Click Sync from One Tap Desktop */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono">
                    Instant Workstation Sync
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                    Port 5253
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Zap className="w-4 h-4 fill-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">Sync Burhanuddin Workstation</h4>
                    <p className="text-[11px] text-slate-600 truncate">Pulls profile, email, admin role & node</p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleOneClickSync}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs disabled:opacity-60"
                >
                  {isSyncing ? (
                    <span>Connecting to Node...</span>
                  ) : (
                    <>
                      <span>1-Click Connect & Sync</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Or Manual / QR</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Method 2: Log in with Username */}
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Enter Username
                  </label>
                  <div className="relative">
                    <AtSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={inputUsername}
                      onChange={(e) => setInputUsername(e.target.value)}
                      placeholder="e.g. burhanuddin or creator"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold font-mono focus:outline-none focus:border-indigo-600 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={inputDisplayName}
                    onChange={(e) => setInputDisplayName(e.target.value)}
                    placeholder="e.g. Burhanuddin"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In with Username</span>
                </button>
              </form>

              {/* Method 3: Scan QR Code */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenQRScanner) onOpenQRScanner();
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-slate-700" />
                <span>Scan One Tap App QR Code</span>
              </button>

              {/* Quick switch between known team members */}
              {users.length > 0 && (
                <div className="pt-2 border-t border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Available Team Profiles
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {users.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleQuickSwitch(u.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                          currentUser.id === u.id
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>@{u.username}</span>
                        {u.role === 'admin' && (
                          <span className="text-[9px] px-1 rounded bg-indigo-100 text-indigo-700 font-bold uppercase">
                            Admin
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
