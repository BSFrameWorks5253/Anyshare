import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import {
  LogIn,
  User,
  AtSign,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  Laptop,
  Smartphone
} from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onOpenQRScanner }) {
  const { currentUser, users, updateEcosystemUser, switchUser } = useApp();

  const [inputUsername, setInputUsername] = useState('');
  const [inputDisplayName, setInputDisplayName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

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
      updateEcosystemUser({
        name,
        username: cleanUsername,
        email: `${cleanUsername}@anything.local`,
        role: cleanUsername === 'admin' ? 'admin' : 'member'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn text-left">
      <div className="w-full max-w-md rounded-3xl border-2 border-[#C5A059] bg-[#FAF8F5] shadow-2xl overflow-hidden">
        {/* Header with Islamic Golden Motif */}
        <div className="p-5 border-b border-[#C5A059]/30 bg-gradient-to-r from-amber-100/90 via-yellow-50/70 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8A6614] flex items-center justify-center text-white shadow-md">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-950 font-serif">Sign In to AnyShare</h3>
              <p className="text-[11px] text-stone-600 font-semibold">Anything Creative Ecosystem Authentication</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-950 hover:bg-stone-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {successMsg ? (
            <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-400 text-emerald-950 text-center space-y-2 animate-fadeIn">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-black">{successMsg}</p>
            </div>
          ) : (
            <>
              {/* Method 1: Log in with Username */}
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-black text-stone-900 mb-1">
                    Enter Your Anything Ecosystem Username
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      autoFocus
                      value={inputUsername}
                      onChange={(e) => setInputUsername(e.target.value)}
                      placeholder="e.g. burhanuddin, admin, or creator"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#C5A059]/40 rounded-xl text-xs text-stone-950 font-black font-mono focus:outline-none focus:border-[#B8860B] shadow-xs"
                    />
                  </div>
                  <p className="text-[11px] text-stone-600 font-medium mt-1">
                    Use the username given by the Anything app or your custom chosen handle.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={inputDisplayName}
                    onChange={(e) => setInputDisplayName(e.target.value)}
                    placeholder="e.g. Master Architect"
                    className="w-full px-3 py-2 bg-white border border-[#C5A059]/30 rounded-xl text-xs text-stone-950 font-bold focus:outline-none focus:border-[#B8860B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-black glass-button-primary shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In with Username</span>
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-stone-300" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Or 1-Tap QR Sync</span>
                <div className="flex-1 h-px bg-stone-300" />
              </div>

              {/* Method 2: Scan Desktop QR */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenQRScanner) onOpenQRScanner();
                }}
                className="w-full py-2.5 rounded-xl text-xs font-black bg-stone-900 text-amber-200 hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <QrCode className="w-4 h-4 text-[#D4AF37]" />
                <span>Scan Desktop QR Code with Camera</span>
              </button>

              {/* Quick Select from Enrolled Profiles */}
              <div className="pt-2 border-t border-stone-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-2">
                  Quick Switch Active Profiles
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickSwitch(u.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                        u.id === currentUser.id
                          ? 'bg-amber-200 text-stone-950 border-amber-400 font-black'
                          : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-300'
                      }`}
                    >
                      <span className="text-[#8A6614] font-mono">@{u.username}</span>
                      <span className="text-[9px] text-stone-500">({u.role})</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
