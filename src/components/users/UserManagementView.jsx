import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { sounds } from '../../lib/sound';
import UserAvatarWithReflection from '../common/UserAvatarWithReflection';
import {
  Users,
  UserCheck,
  UserPlus,
  ArrowRightLeft,
  AtSign,
  Mail,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  Video,
  Activity,
  Edit3,
  Search,
  Filter,
  Trash2,
  X
} from 'lucide-react';

export default function UserManagementView({ onSelectUserForFilter, onNavigateToWork }) {
  const {
    currentUser,
    users,
    switchUser,
    addTeamUser,
    updateTeamUser,
    removeTeamUser,
    updateEcosystemUser,
    items,
    isAdmin
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditingSelf, setIsEditingSelf] = useState(false);

  // Edit current user state
  const [selfUsername, setSelfUsername] = useState(currentUser.username || '');
  const [selfName, setSelfName] = useState(currentUser.name || '');
  const [selfEmail, setSelfEmail] = useState(currentUser.email || '');

  // New user state
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('member');

  // Edit any user state
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('member');

  // Delete user state
  const [userToDelete, setUserToDelete] = useState(null);

  const startEditUser = (user) => {
    sounds.playTap();
    setEditingUser(user);
    setEditName(user.name || '');
    setEditUsername(user.username || '');
    setEditEmail(user.email || '');
    setEditRole(user.role || 'member');
  };

  const handleSaveEditedUser = (e) => {
    e.preventDefault();
    if (!editingUser || !editUsername.trim()) return;

    updateTeamUser(editingUser.id, {
      name: editName.trim() || editUsername.trim(),
      username: editUsername.trim(),
      email: editEmail.trim(),
      role: editRole
    });

    setEditingUser(null);
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    removeTeamUser(userToDelete.id);
    setUserToDelete(null);
  };

  const handleSaveSelf = (e) => {
    e.preventDefault();
    if (!selfUsername.trim()) return;

    const clean = selfUsername.trim().toLowerCase().replace(/[^a-zA-Z0-9_.-]/g, '');
    updateEcosystemUser({
      username: clean,
      name: selfName.trim() || currentUser.name,
      email: selfEmail.trim() || currentUser.email
    });
    setIsEditingSelf(false);
    sounds.playSuccess();
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserUsername.trim()) return;

    const clean = newUserUsername.trim().toLowerCase().replace(/[^a-zA-Z0-9_.-]/g, '');
    addTeamUser({
      name: newUserName.trim() || clean,
      username: clean,
      email: newUserEmail.trim() || `${clean}@anything.local`,
      role: newUserRole,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newUserName.trim() || cleanUsername)}&backgroundColor=0f172a&textColor=ffffff`
    });

    setNewUserName('');
    setNewUserUsername('');
    setNewUserEmail('');
    setShowAddModal(false);
    sounds.playSuccess();
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q);
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate statistics across all users
  const totalProductions = items.length;
  const totalAssigned = items.filter(i => i.assigned_user_id).length;
  const totalDelivered = items.filter(i => i.status === 'delivered' || i.status === 'done').length;

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[rgba(0,0,0,0.08)]/40 relative overflow-hidden bg-gradient-to-r from-neutral-100/80 via-neutral-50 to-white shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black glass-pill text-[#1e293b] border border-neutral-300 bg-white/95 mb-3 shadow-xs">
              <Users className="w-3.5 h-3.5 text-[#0f172a]" />
              <span>Anything Ecosystem Team Directory</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight font-sans">
              Team Members & Production Analytics
            </h2>

            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-semibold mt-1 max-w-2xl">
              Inspect user production assignments, view screen stay time, switch active session identities, or register new video editors into the Anything ecosystem.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setShowAddModal(true);
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold glass-button-primary flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-950/10"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Enroll Team Member</span>
            </button>
          </div>
        </div>

        {/* Global Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[rgba(0,0,0,0.08)]/25">
          <div className="p-3.5 rounded-2xl bg-white/95 border border-[rgba(0,0,0,0.08)]/40 shadow-xs">
            <span className="text-xs font-bold text-neutral-800 block">Enrolled Users</span>
            <span className="text-2xl font-black text-neutral-950 font-sans">{users.length} Creators</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/95 border border-[rgba(0,0,0,0.08)]/40 shadow-xs">
            <span className="text-xs font-bold text-neutral-800 block">Assigned Work</span>
            <span className="text-2xl font-black text-[#1e293b] font-sans">{totalAssigned} Productions</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/95 border border-[rgba(0,0,0,0.08)]/40 shadow-xs">
            <span className="text-xs font-bold text-neutral-800 block">Delivered Final</span>
            <span className="text-2xl font-black text-emerald-900 font-sans">{totalDelivered} Masters</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/95 border border-[rgba(0,0,0,0.08)]/40 shadow-xs">
            <span className="text-xs font-bold text-neutral-800 block">Active Identity</span>
            <span className="text-base font-black text-neutral-950 font-mono truncate block">@{currentUser.username || 'creator'}</span>
          </div>
        </div>
      </div>

      {/* Active User Card & Inline Quick Editor */}
      <div className="glass-panel rounded-3xl p-6 border-2 border-[rgba(0,0,0,0.08)]/40 bg-white/95 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(0,0,0,0.08)]/20 pb-4">
          <div className="flex items-center gap-4">
            <UserAvatarWithReflection
              src={currentUser.avatar}
              alt={currentUser.name}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-neutral-950">{currentUser.name}</h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-900 text-white">
                  {currentUser.role}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950 border border-emerald-400">
                  Active Session
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-[#1e293b] mt-0.5 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-[#334155]" />
                {currentUser.username || 'creator'} • <span className="text-neutral-600">{currentUser.email}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setIsEditingSelf(!isEditingSelf);
            }}
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-black glass-pill hover:bg-neutral-100 text-neutral-900 border border-[rgba(0,0,0,0.08)]/40 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#334155]" />
            <span>{isEditingSelf ? 'Cancel Editing' : 'Change My Ecosystem Username'}</span>
          </button>
        </div>

        {isEditingSelf && (
          <form onSubmit={handleSaveSelf} className="p-4 rounded-2xl bg-neutral-50/80 border border-[rgba(0,0,0,0.08)]/40 space-y-3 animate-fadeIn">
            <h4 className="text-xs font-black text-neutral-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#334155]" />
              Update Your Anything Ecosystem Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-neutral-800 mb-1">Ecosystem Handle (@username)</label>
                <input
                  type="text"
                  required
                  value={selfUsername}
                  onChange={(e) => setSelfUsername(e.target.value)}
                  placeholder="e.g. burhanuddin"
                  className="w-full px-3 py-2 bg-white border border-[rgba(0,0,0,0.08)]/40 rounded-xl text-xs text-neutral-950 font-black font-mono focus:outline-none focus:border-[#0f172a]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-neutral-800 mb-1">Display Name</label>
                <input
                  type="text"
                  value={selfName}
                  onChange={(e) => setSelfName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 bg-white border border-[rgba(0,0,0,0.08)]/40 rounded-xl text-xs text-neutral-950 font-bold focus:outline-none focus:border-[#0f172a]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-neutral-800 mb-1">Email Address</label>
                <input
                  type="email"
                  value={selfEmail}
                  onChange={(e) => setSelfEmail(e.target.value)}
                  placeholder="user@anything.local"
                  className="w-full px-3 py-2 bg-white border border-[rgba(0,0,0,0.08)]/40 rounded-xl text-xs text-neutral-950 font-bold font-mono focus:outline-none focus:border-[#0f172a]"
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-black glass-button-primary shadow-xs cursor-pointer"
              >
                Save & Synchronize to Anything Apps
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Team Roster Grid with Search and Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h3 className="text-base font-black text-neutral-950 font-sans">All Team Users & Workload Distribution</h3>
            <p className="text-xs text-neutral-600 font-semibold">
              Showing {filteredUsers.length} of {users.length} enrolled members
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or handle..."
                className="pl-8 pr-3 py-1.5 bg-white border border-[rgba(0,0,0,0.08)]/35 rounded-xl text-xs text-neutral-950 font-bold focus:outline-none focus:border-[#0f172a] w-48 sm:w-60"
              />
            </div>

            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[rgba(0,0,0,0.08)]/35 rounded-xl text-xs text-neutral-950 font-bold focus:outline-none focus:border-[#0f172a]"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins / Directors</option>
              <option value="member">Editors / Members</option>
            </select>
          </div>
        </div>

        {/* User Data Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => {
            const isCurrent = user.id === currentUser.id;
            const assignedItems = items.filter(i => i.assigned_user_id === user.id);
            const renderingCount = assignedItems.filter(i => i.status === 'rendering').length;
            const completedCount = assignedItems.filter(i => i.status === 'delivered' || i.status === 'done').length;

            return (
              <div
                key={user.id}
                className={`card-luxury rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-neutral-50/80 border-[#0f172a] ring-2 ring-[#0f172a]/40 shadow-md'
                    : 'bg-white/95 border-[rgba(0,0,0,0.08)]/35 hover:border-[#0f172a]/60 shadow-xs'
                }`}
              >
                <div>
                  {/* Top user badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-[rgba(0,0,0,0.08)]/50 shadow-xs"
                      />
                      <div>
                        <h4 className="text-sm font-black text-neutral-950 leading-tight">{user.name}</h4>
                        <span className="font-mono text-xs text-[#1e293b] font-black block mt-0.5">
                          @{user.username || 'creator'}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      user.role === 'admin'
                        ? 'bg-neutral-950 text-white border-neutral-900'
                        : 'bg-neutral-100 text-neutral-800 border-neutral-200'
                    }`}>
                      {user.role}
                    </span>
                  </div>

                  {/* Email & Account Details */}
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-stone-200 text-[11px] space-y-1 mb-4 font-mono text-neutral-700">
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-sans">Email:</span>
                      <span className="font-bold text-neutral-900 truncate max-w-[170px]">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-sans">SSO Sync:</span>
                      <span className="text-emerald-800 font-bold">anything.local</span>
                    </div>
                  </div>

                  {/* User Workload Metrics */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-[rgba(0,0,0,0.08)]/20 text-center mb-4">
                    <div className="p-2 rounded-xl bg-neutral-50/80 border border-[rgba(0,0,0,0.08)]/20">
                      <span className="text-[10px] font-bold text-neutral-600 block">Assigned</span>
                      <span className="text-base font-black text-neutral-950">{assignedItems.length}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-50/80 border border-[rgba(0,0,0,0.08)]/20">
                      <span className="text-[10px] font-bold text-neutral-600 block">Rendering</span>
                      <span className={`text-base font-black ${renderingCount > 0 ? 'text-neutral-600 animate-pulse' : 'text-neutral-950'}`}>
                        {renderingCount}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-50/80 border border-[rgba(0,0,0,0.08)]/20">
                      <span className="text-[10px] font-bold text-neutral-600 block">Delivered</span>
                      <span className="text-base font-black text-emerald-800">{completedCount}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      if (onSelectUserForFilter) onSelectUserForFilter(user.id);
                      if (onNavigateToWork) onNavigateToWork();
                    }}
                    className="flex-1 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Work ({assignedItems.length})</span>
                  </button>

                  {/* Edit Editor Button */}
                  <button
                    type="button"
                    onClick={() => startEditUser(user)}
                    className="p-1.5 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors shadow-2xs"
                    title={`Edit name or handle for ${user.name}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Editor Button */}
                  {isAdmin && (
                    <button
                      type="button"
                      disabled={users.length <= 1}
                      onClick={() => {
                        sounds.playTap();
                        setUserToDelete(user);
                      }}
                      className="p-1.5 rounded-xl text-rose-600 hover:text-rose-900 hover:bg-rose-50 border border-rose-200 cursor-pointer transition-colors shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                      title={users.length <= 1 ? 'Cannot delete last user' : `Remove ${user.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isCurrent ? (
                    <span className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playTap();
                        switchUser(user.id);
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>Switch</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border-2 border-[rgba(0,0,0,0.08)] bg-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)]/30 pb-3">
              <h3 className="text-base font-black text-neutral-950 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#334155]" />
                Enroll New Anything Team Member
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-900 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-[11px] font-black text-neutral-800 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Tariq Director"
                  className="w-full px-3 py-2 bg-neutral-50 border border-[rgba(0,0,0,0.08)]/40 rounded-xl text-xs text-neutral-950 font-bold focus:outline-none focus:border-[#0f172a]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-neutral-800 mb-1">Ecosystem Handle (@username)</label>
                <input
                  type="text"
                  required
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  placeholder="e.g. tariq_cuts"
                  className="w-full px-3 py-2 bg-neutral-50 border border-[rgba(0,0,0,0.08)]/40 rounded-xl text-xs text-neutral-950 font-black font-mono focus:outline-none focus:border-[#0f172a]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-neutral-800 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="tariq@anything.local"
                  className="w-full px-3 py-2 bg-neutral-50 border border-[rgba(0,0,0,0.08)]/40 rounded-xl text-xs text-neutral-950 font-bold font-mono focus:outline-none focus:border-[#0f172a]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-neutral-800 mb-1">Role / Permissions</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-[rgba(0,0,0,0.08)]/40 rounded-xl text-xs text-neutral-950 font-bold focus:outline-none focus:border-[#0f172a]"
                >
                  <option value="member">Member / Video Editor</option>
                  <option value="admin">Admin / Lead Director</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold glass-pill hover:bg-neutral-200 text-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black glass-button-primary shadow-xs cursor-pointer"
                >
                  Add Creator & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-200 bg-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                Edit Editor: @{editingUser.username}
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-950 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Full Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Murtaza Cutter"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Handle (@username)</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                  placeholder="e.g. murtaza_edit"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="editor@anything.local"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Role / Permissions</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="member">Member / Video Editor</option>
                  <option value="admin">Admin / Director</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold glass-pill hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs transition-colors"
                >
                  Save Editor Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete User Dialog */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 border border-rose-200 bg-white shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Remove Editor?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to remove <strong>{userToDelete.name}</strong> (@{userToDelete.username}) from the active team roster?
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold glass-pill hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs transition-colors"
              >
                Yes, Remove Editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
