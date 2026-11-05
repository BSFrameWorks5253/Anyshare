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
  Filter
} from 'lucide-react';

export default function UserManagementView({ onSelectUserForFilter, onNavigateToWork }) {
  const {
    currentUser,
    users,
    switchUser,
    addTeamUser,
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
      avatar: `https://images.unsplash.com/photo-${1534528741775 + users.length * 1000}?auto=format&fit=crop&w=120&q=80`
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
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#C5A059]/40 relative overflow-hidden bg-gradient-to-r from-amber-100/90 via-yellow-50/70 to-white shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black glass-pill text-[#785005] border border-amber-400 bg-white/95 mb-3 shadow-xs">
              <Users className="w-3.5 h-3.5 text-[#B8860B]" />
              <span>Anything Ecosystem Team Directory</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight font-serif">
              Team Members & Production Analytics
            </h2>

            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-semibold mt-1 max-w-2xl">
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
              className="px-5 py-2.5 rounded-xl text-xs font-black glass-button-primary flex items-center gap-2 cursor-pointer shadow-md shadow-amber-900/15"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Enroll Team Member</span>
            </button>
          </div>
        </div>

        {/* Global Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#C5A059]/25">
          <div className="p-3.5 rounded-2xl bg-white/95 border border-[#C5A059]/40 shadow-xs">
            <span className="text-xs font-bold text-stone-800 block">Enrolled Users</span>
            <span className="text-2xl font-black text-stone-950 font-serif">{users.length} Creators</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/95 border border-[#C5A059]/40 shadow-xs">
            <span className="text-xs font-bold text-stone-800 block">Assigned Work</span>
            <span className="text-2xl font-black text-[#785005] font-serif">{totalAssigned} Productions</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/95 border border-[#C5A059]/40 shadow-xs">
            <span className="text-xs font-bold text-stone-800 block">Delivered Final</span>
            <span className="text-2xl font-black text-emerald-900 font-serif">{totalDelivered} Masters</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/95 border border-[#C5A059]/40 shadow-xs">
            <span className="text-xs font-bold text-stone-800 block">Active Identity</span>
            <span className="text-base font-black text-stone-950 font-mono truncate block">@{currentUser.username || 'creator'}</span>
          </div>
        </div>
      </div>

      {/* Active User Card & Inline Quick Editor */}
      <div className="glass-panel rounded-3xl p-6 border-2 border-[#C5A059]/40 bg-white/95 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C5A059]/20 pb-4">
          <div className="flex items-center gap-4">
            <UserAvatarWithReflection
              src={currentUser.avatar}
              alt={currentUser.name}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-stone-950">{currentUser.name}</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-stone-950 border border-amber-400">
                  {currentUser.role}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950 border border-emerald-400">
                  Active Session
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-[#785005] mt-0.5 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-[#8A6614]" />
                {currentUser.username || 'creator'} • <span className="text-stone-600">{currentUser.email}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setIsEditingSelf(!isEditingSelf);
            }}
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-black glass-pill hover:bg-stone-100 text-stone-900 border border-[#C5A059]/40 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#8A6614]" />
            <span>{isEditingSelf ? 'Cancel Editing' : 'Change My Ecosystem Username'}</span>
          </button>
        </div>

        {isEditingSelf && (
          <form onSubmit={handleSaveSelf} className="p-4 rounded-2xl bg-amber-50/80 border border-[#C5A059]/40 space-y-3 animate-fadeIn">
            <h4 className="text-xs font-black text-stone-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8A6614]" />
              Update Your Anything Ecosystem Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-stone-800 mb-1">Ecosystem Handle (@username)</label>
                <input
                  type="text"
                  required
                  value={selfUsername}
                  onChange={(e) => setSelfUsername(e.target.value)}
                  placeholder="e.g. burhanuddin"
                  className="w-full px-3 py-2 bg-white border border-[#C5A059]/40 rounded-xl text-xs text-stone-950 font-black font-mono focus:outline-none focus:border-[#B8860B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-stone-800 mb-1">Display Name</label>
                <input
                  type="text"
                  value={selfName}
                  onChange={(e) => setSelfName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 bg-white border border-[#C5A059]/40 rounded-xl text-xs text-stone-950 font-bold focus:outline-none focus:border-[#B8860B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-stone-800 mb-1">Email Address</label>
                <input
                  type="email"
                  value={selfEmail}
                  onChange={(e) => setSelfEmail(e.target.value)}
                  placeholder="user@anything.local"
                  className="w-full px-3 py-2 bg-white border border-[#C5A059]/40 rounded-xl text-xs text-stone-950 font-bold font-mono focus:outline-none focus:border-[#B8860B]"
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
            <h3 className="text-base font-black text-stone-950 font-serif">All Team Users & Workload Distribution</h3>
            <p className="text-xs text-stone-600 font-semibold">
              Showing {filteredUsers.length} of {users.length} enrolled members
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or handle..."
                className="pl-8 pr-3 py-1.5 bg-white border border-[#C5A059]/35 rounded-xl text-xs text-stone-950 font-bold focus:outline-none focus:border-[#B8860B] w-48 sm:w-60"
              />
            </div>

            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[#C5A059]/35 rounded-xl text-xs text-stone-950 font-bold focus:outline-none focus:border-[#B8860B]"
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
                    ? 'bg-amber-50/90 border-[#B8860B] ring-2 ring-[#B8860B]/40 shadow-md'
                    : 'bg-white/95 border-[#C5A059]/35 hover:border-[#B8860B]/60 shadow-xs'
                }`}
              >
                <div>
                  {/* Top user badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-[#C5A059]/50 shadow-xs"
                      />
                      <div>
                        <h4 className="text-sm font-black text-stone-950 leading-tight">{user.name}</h4>
                        <span className="font-mono text-xs text-[#785005] font-black block mt-0.5">
                          @{user.username || 'creator'}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      user.role === 'admin'
                        ? 'bg-amber-200 text-stone-950 border-amber-400'
                        : 'bg-stone-100 text-stone-800 border-stone-300'
                    }`}>
                      {user.role}
                    </span>
                  </div>

                  {/* Email & Account Details */}
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] space-y-1 mb-4 font-mono text-stone-700">
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-sans">Email:</span>
                      <span className="font-bold text-stone-900 truncate max-w-[170px]">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-sans">SSO Sync:</span>
                      <span className="text-emerald-800 font-bold">anything.local</span>
                    </div>
                  </div>

                  {/* User Workload Metrics */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-[#C5A059]/20 text-center mb-4">
                    <div className="p-2 rounded-xl bg-amber-50/60 border border-[#C5A059]/20">
                      <span className="text-[10px] font-bold text-stone-600 block">Assigned</span>
                      <span className="text-base font-black text-stone-950">{assignedItems.length}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50/60 border border-[#C5A059]/20">
                      <span className="text-[10px] font-bold text-stone-600 block">Rendering</span>
                      <span className={`text-base font-black ${renderingCount > 0 ? 'text-amber-600 animate-pulse' : 'text-stone-950'}`}>
                        {renderingCount}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50/60 border border-[#C5A059]/20">
                      <span className="text-[10px] font-bold text-stone-600 block">Delivered</span>
                      <span className="text-base font-black text-emerald-800">{completedCount}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#C5A059]/20">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      if (onSelectUserForFilter) onSelectUserForFilter(user.id);
                      if (onNavigateToWork) onNavigateToWork();
                    }}
                    className="flex-1 py-1.5 rounded-xl text-[11px] font-bold glass-pill hover:bg-stone-100 text-stone-800 border border-[#C5A059]/30 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Work ({assignedItems.length})</span>
                  </button>

                  {isCurrent ? (
                    <span className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-emerald-200 text-emerald-950 border border-emerald-400 flex items-center gap-1 shadow-xs">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playTap();
                        switchUser(user.id);
                      }}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-stone-900 text-amber-200 hover:bg-black flex items-center gap-1 cursor-pointer shadow-xs"
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
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border-2 border-[#C5A059] bg-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#C5A059]/30 pb-3">
              <h3 className="text-base font-black text-stone-950 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#8A6614]" />
                Enroll New Anything Team Member
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-900 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-[11px] font-black text-stone-800 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Tariq Director"
                  className="w-full px-3 py-2 bg-stone-50 border border-[#C5A059]/40 rounded-xl text-xs text-stone-950 font-bold focus:outline-none focus:border-[#B8860B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-stone-800 mb-1">Ecosystem Handle (@username)</label>
                <input
                  type="text"
                  required
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  placeholder="e.g. tariq_cuts"
                  className="w-full px-3 py-2 bg-stone-50 border border-[#C5A059]/40 rounded-xl text-xs text-stone-950 font-black font-mono focus:outline-none focus:border-[#B8860B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-stone-800 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="tariq@anything.local"
                  className="w-full px-3 py-2 bg-stone-50 border border-[#C5A059]/40 rounded-xl text-xs text-stone-950 font-bold font-mono focus:outline-none focus:border-[#B8860B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-stone-800 mb-1">Role / Permissions</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-[#C5A059]/40 rounded-xl text-xs text-stone-950 font-bold focus:outline-none focus:border-[#B8860B]"
                >
                  <option value="member">Member / Video Editor</option>
                  <option value="admin">Admin / Lead Director</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold glass-pill hover:bg-stone-200 text-stone-700 cursor-pointer"
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
    </div>
  );
}
