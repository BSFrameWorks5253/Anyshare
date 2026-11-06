import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import UserAvatarWithReflection from '../common/UserAvatarWithReflection';
import {
  User,
  Users,
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
  Laptop,
  UserCheck,
  UserPlus,
  ArrowRightLeft,
  Mail,
  ShieldCheck,
  Search,
  QrCode,
  Zap
} from 'lucide-react';

export default function AccountModal({ isOpen, onClose, onOpenDbInspector, onOpenQRScanner }) {
  const {
    currentUser,
    users,
    switchUser,
    addTeamUser,
    items,
    updateEcosystemUser,
    runRetentionCleanup,
    isAdmin,
    syncWithOneTapNode
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'team'
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [usernameInput, setUsernameInput] = useState(currentUser.username || '');
  const [nameInput, setNameInput] = useState(currentUser.name || '');
  const [emailInput, setEmailInput] = useState(currentUser.email || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);
  const [syncingOneTap, setSyncingOneTap] = useState(false);

  const handleSyncFromOneTap = async () => {
    setSyncingOneTap(true);
    sounds.playTap();
    await syncWithOneTapNode();
    setSyncingOneTap(false);
  };

  // New user form state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('member');
  const [userSearch, setUserSearch] = useState('');

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

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserUsername.trim()) return;

    addTeamUser({
      name: newUserName.trim() || newUserUsername.trim(),
      username: newUserUsername.trim(),
      email: newUserEmail.trim() || `${newUserUsername.trim()}@anything.local`,
      role: newUserRole
    });

    setNewUserName('');
    setNewUserUsername('');
    setNewUserEmail('');
    setShowAddUser(false);
  };

  const handleRunCleanup = () => {
    const res = runRetentionCleanup();
    setCleanupResult(res);
    sounds.playSuccess();
  };

  const filteredUsers = (users || []).filter(u => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-neutral-950/50 backdrop-blur-md animate-fadeIn">
      <div 
        className="glass-panel w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl border border-[rgba(0,0,0,0.08)]/40 shadow-2xl flex flex-col overflow-hidden text-left bg-white/95"
        role="dialog"
      >
        {/* Header with Clean Studio Styling */}
        <div className="p-5 border-b border-[rgba(0,0,0,0.08)]/30 flex items-start justify-between gap-3 bg-gradient-to-r from-neutral-100/80 via-neutral-50 to-white">
          <div className="flex items-center gap-4">
            <UserAvatarWithReflection
              src={currentUser.avatar}
              alt={currentUser.name}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-neutral-950 font-sans">
                  {currentUser.name}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-[#1e293b] font-mono font-bold flex items-center gap-1 mt-0.5">
                <AtSign className="w-3.5 h-3.5 text-indigo-600" />
                {currentUser.username || 'creator'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-950 hover:bg-[rgba(0,0,0,0.08)]/15 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs: My Profile vs Team Directory */}
        <div className="flex border-b border-[rgba(0,0,0,0.08)]/20 bg-neutral-50/80 p-1 px-4 gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setActiveTab('profile');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-neutral-950 text-white shadow-sm'
                : 'text-neutral-700 hover:text-neutral-950 hover:bg-white/80'
            }`}
          >
            <User className="w-4 h-4 text-neutral-700" />
            <span>My Account & Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setActiveTab('team');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'team'
                ? 'bg-neutral-950 text-white shadow-sm'
                : 'text-neutral-700 hover:text-neutral-950 hover:bg-white/80'
            }`}
          >
            <Users className="w-4 h-4 text-neutral-700" />
            <span>Team & Users Directory ({users.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          
          {/* TAB 1: MY PROFILE & SSO CREDENTIALS */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Child App Registration Status Banner */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border-2 border-[rgba(0,0,0,0.08)]/50 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <Laptop className="w-4 h-4 text-[#334155] shrink-0" />
                  <div>
                    <span className="text-[11px] text-neutral-800 font-extrabold block">Child App Folder Identity:</span>
                    <span className="text-xs font-black text-neutral-950 font-mono">Anything share</span>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-emerald-200 text-emerald-950 border border-emerald-500 shadow-xs">
                  Ecosystem Linked
                </span>
              </div>

              {/* Success Banner */}
              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-950 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                  <span>Username updated & synchronized to Anything website and child apps!</span>
                </div>
              )}

              {/* Edit Username / Ecosystem Identity Section */}
              <div className="rounded-2xl p-4 border border-[rgba(0,0,0,0.08)]/30 bg-white/95 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-neutral-950 text-sm flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#334155]" />
                      Anything Website Login Credentials
                    </h4>
                    <p className="text-[11px] text-neutral-600 font-semibold">
                      Set the username you use to log into the master Anything website and child apps
                    </p>
                  </div>

                  {!isEditingProfile && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={syncingOneTap}
                        onClick={handleSyncFromOneTap}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                        title="Pull real profile from One Tap node"
                      >
                        <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                        <span>{syncingOneTap ? 'Syncing...' : 'Sync from Node'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playTap();
                          setIsEditingProfile(true);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-black glass-pill hover:bg-neutral-100 text-neutral-900 border border-[rgba(0,0,0,0.08)]/40 flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#334155]" />
                        <span>Edit</span>
                      </button>
                    </div>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 border-t border-[rgba(0,0,0,0.08)]/20">
                    <div>
                      <label className="block text-[11px] text-neutral-900 font-black mb-1">
                        Ecosystem Username (@handle)
                      </label>
                      <div className="relative">
                        <AtSign className="w-3.5 h-3.5 text-neutral-600 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          placeholder="e.g. burhanuddin or creator_lead"
                          className="w-full pl-8 pr-3 py-2 bg-neutral-50 border border-[rgba(0,0,0,0.08)]/40 rounded-xl text-xs text-neutral-950 font-bold focus:outline-none focus:border-[#0f172a] font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-900 font-black mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-3 py-2 bg-neutral-50 border border-[rgba(0,0,0,0.08)]/40 rounded-xl text-xs text-neutral-950 font-bold focus:outline-none focus:border-[#0f172a]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-900 font-black mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="user@anything.local"
                        className="w-full px-3 py-2 bg-neutral-50 border border-[rgba(0,0,0,0.08)]/40 rounded-xl text-xs text-neutral-950 font-bold focus:outline-none focus:border-[#0f172a] font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playTap();
                          setIsEditingProfile(false);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold glass-pill hover:bg-neutral-200 text-neutral-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl text-xs font-black glass-button-primary flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save & Sync to Anything</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[rgba(0,0,0,0.08)]/25">
                      <span className="text-neutral-900 font-extrabold">Username:</span>
                      <span className="font-mono text-[#1e293b] font-black text-sm">@{currentUser.username || 'creator'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[rgba(0,0,0,0.08)]/25">
                      <span className="text-neutral-900 font-extrabold">Email:</span>
                      <span className="font-mono text-neutral-950 font-black">{currentUser.email}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-neutral-900 font-extrabold">SSO Universal Session:</span>
                      <span className="font-mono text-emerald-950 font-black bg-emerald-200 px-2 py-0.5 rounded border border-emerald-400">
                        anything_ecosystem_session_v1
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* One-Time QR Login & One Tap Desktop Node Sync Card */}
              <div className="rounded-2xl p-4 border border-[rgba(0,0,0,0.08)]/40 bg-gradient-to-r from-neutral-50/80 via-white to-neutral-50 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-[#0f172a] to-[#334155] text-white">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-neutral-950 text-xs">One-Time QR Login & Node Sync</h4>
                      <p className="text-[11px] text-neutral-600 font-medium">Sync with One Tap desktop app for 1-tap renders</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 font-black">
                    SYNC READY
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[rgba(0,0,0,0.08)]/30 text-[11px] text-neutral-900 space-y-1 font-mono shadow-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-800 font-sans font-bold">Active Workstation:</span>
                    <span className="font-black text-neutral-950">Studio-PC-01 (Port 5253)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-800 font-sans font-bold">Ecosystem State:</span>
                    <span className="text-emerald-800 font-black">Synchronized with Anything Session</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    if (onOpenQRScanner) {
                      onOpenQRScanner();
                    }
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-black glass-button-primary shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Open QR Scanner / View App Pairing</span>
                </button>
              </div>
              <div className="rounded-2xl p-4 border border-[rgba(0,0,0,0.08)]/30 bg-white/95 space-y-2 shadow-xs">
                <h4 className="font-black text-neutral-950 text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#334155]" />
                  Automated Retention Cleanups
                </h4>
                <div className="space-y-2 text-neutral-950 text-xs">
                  <div className="flex justify-between py-1 border-b border-[rgba(0,0,0,0.08)]/20">
                    <span className="text-neutral-800 font-bold">Notifications:</span>
                    <span className="font-mono text-neutral-950 font-black">Pruned after 30 days</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[rgba(0,0,0,0.08)]/20">
                    <span className="text-neutral-800 font-bold">Terminal Render Commands:</span>
                    <span className="font-mono text-neutral-950 font-black">Deleted after 7 days</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[rgba(0,0,0,0.08)]/20">
                    <span className="text-neutral-800 font-bold">Completed Work:</span>
                    <span className="font-mono text-neutral-950 font-black">Purged after 90 days</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-800 font-bold">Account Identity:</span>
                    <span className="font-black text-emerald-950 bg-emerald-200 px-2 py-0.5 rounded border border-emerald-400">
                      Protected (Never auto-deleted)
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleRunCleanup}
                    className="w-full mt-2 py-2 rounded-xl text-xs font-bold glass-pill hover:bg-neutral-100 text-neutral-900 flex items-center justify-center gap-1.5 cursor-pointer border border-[rgba(0,0,0,0.08)]/40 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Test Retention Sweep Now</span>
                  </button>
                )}

                {cleanupResult && (
                  <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold">
                    Sweep finished: purged {cleanupResult.cleaned_notifications} expired notifications.
                  </div>
                )}
              </div>

              {/* Supabase Schema Blueprint Trigger */}
              <div className="rounded-2xl p-4 border border-[rgba(0,0,0,0.08)]/30 bg-white/95 flex items-center justify-between shadow-xs">
                <div>
                  <h4 className="font-black text-neutral-950 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-[#334155]" />
                    Supabase Schema Blueprint
                  </h4>
                  <p className="text-[11px] text-neutral-600 font-semibold mt-0.5">
                    View DDL schema, tables, and RLS definitions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    onOpenDbInspector();
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-black glass-pill hover:bg-neutral-100 text-neutral-900 flex items-center gap-1.5 cursor-pointer border border-[rgba(0,0,0,0.08)]/40 shadow-xs"
                >
                  <Code2 className="w-3.5 h-3.5 text-[#334155]" />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TEAM & USER DIRECTORY */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              {/* Search & Add User Row */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name, handle, or email..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[rgba(0,0,0,0.08)]/35 rounded-xl text-xs text-neutral-950 font-bold focus:outline-none focus:border-[#0f172a]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setShowAddUser(!showAddUser);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-black glass-button-primary flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{showAddUser ? 'Close Form' : '+ New User'}</span>
                </button>
              </div>

              {/* Add User Form Drawer */}
              {showAddUser && (
                <form onSubmit={handleCreateUser} className="p-4 rounded-2xl bg-neutral-50/80 border border-[rgba(0,0,0,0.08)]/40 space-y-3 shadow-xs animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-neutral-950 text-xs flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-[#334155]" />
                      Enroll Team Member into Ecosystem
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="e.g. Tariq Editor"
                        className="w-full px-3 py-1.5 bg-white border border-[rgba(0,0,0,0.08)]/30 rounded-xl text-xs text-neutral-950 font-bold focus:outline-none focus:border-[#0f172a]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">@Username</label>
                      <input
                        type="text"
                        required
                        value={newUserUsername}
                        onChange={(e) => setNewUserUsername(e.target.value)}
                        placeholder="e.g. tariq_cuts"
                        className="w-full px-3 py-1.5 bg-white border border-[rgba(0,0,0,0.08)]/30 rounded-xl text-xs text-neutral-950 font-bold font-mono focus:outline-none focus:border-[#0f172a]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="tariq@anything.local"
                        className="w-full px-3 py-1.5 bg-white border border-[rgba(0,0,0,0.08)]/30 rounded-xl text-xs text-neutral-950 font-bold font-mono focus:outline-none focus:border-[#0f172a]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">Role Permission</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[rgba(0,0,0,0.08)]/30 rounded-xl text-xs text-neutral-950 font-bold focus:outline-none focus:border-[#0f172a]"
                      >
                        <option value="member">Member / Video Editor</option>
                        <option value="admin">Admin / Lead Director</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-black glass-button-primary shadow-xs cursor-pointer"
                    >
                      Add & Register User
                    </button>
                  </div>
                </form>
              )}

              {/* User Directory Cards */}
              <div className="space-y-2.5">
                {filteredUsers.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  const assignedCount = (items || []).filter(i => i.assigned_user_id === user.id).length;

                  return (
                    <div
                      key={user.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-neutral-100/70 border-[#0f172a] ring-1 ring-[#0f172a]/40 shadow-xs'
                          : 'bg-white/95 border-[rgba(0,0,0,0.08)]/30 hover:border-[#0f172a]/60 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[rgba(0,0,0,0.08)]/40 shadow-xs"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-neutral-950">
                              {user.name}
                            </h4>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              user.role === 'admin'
                                ? 'bg-neutral-950 text-white border-neutral-900'
                                : 'bg-neutral-100 text-neutral-800 border-neutral-200'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[#1e293b] font-black text-[11px]">
                              @{user.username || 'creator'}
                            </span>
                            <span className="text-neutral-400">•</span>
                            <span className="font-mono text-neutral-600 text-[11px] truncate max-w-[150px]">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[rgba(0,0,0,0.08)]/15">
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-900 border border-stone-200">
                          {assignedCount} Assigned
                        </span>

                        {isCurrent ? (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => switchUser(user.id)}
                            className="px-3 py-1 rounded-xl text-xs font-semibold glass-pill hover:bg-neutral-200 text-neutral-900 flex items-center gap-1 cursor-pointer border border-[rgba(0,0,0,0.08)]/40 shadow-xs"
                          >
                            <ArrowRightLeft className="w-3 h-3 text-neutral-600" />
                            <span>Switch Identity</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(0,0,0,0.08)]/25 bg-neutral-50/80 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-neutral-950 text-white hover:bg-neutral-800 transition-all border border-neutral-800 shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
