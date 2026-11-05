import React, { useState, useMemo } from 'react';
import { useApp } from './lib/store';
import GlassShell from './components/layout/GlassShell';
import GlassTopBar from './components/layout/GlassTopBar';
import GlassNav from './components/layout/GlassNav';
import MobileBottomNav from './components/layout/MobileBottomNav';
import StageSummary from './components/dashboard/StageSummary';
import WorkFilters from './components/dashboard/WorkFilters';
import WorkList from './components/dashboard/WorkList';
import WorkDetailModal from './components/dashboard/WorkDetailModal';
import RenderActionModal from './components/render/RenderActionModal';
import CorrectionReviewModal from './components/corrections/CorrectionReviewModal';
import CorrectionQueue from './components/corrections/CorrectionQueue';
import NotificationCenter from './components/notifications/NotificationCenter';
import BridgeHealthModal from './components/bridge/BridgeHealthModal';
import AccountModal from './components/account/AccountModal';
import DatabaseInspectorModal from './components/account/DatabaseInspectorModal';
import NewProductionModal from './components/dashboard/NewProductionModal';
import ScrollToTop from './components/common/ScrollToTop';
import { sounds } from './lib/sound';
import {
  Sparkles,
  Zap,
  Cpu,
  Layers,
  ArrowRight,
  ShieldAlert,
  FolderSync,
  FolderPlus
} from 'lucide-react';

export default function App() {
  const {
    items,
    currentUser,
    isAdmin,
    bridge,
    triggerBridgeScan
  } = useApp();

  // Navigation state: 'overview' | 'work' | 'corrections' | 'notifications'
  const [currentView, setCurrentView] = useState('overview');

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [activeStage, setActiveStage] = useState(null);
  const [isMyWorkOnly, setIsMyWorkOnly] = useState(false);

  // Modals state
  const [inspectedItem, setInspectedItem] = useState(null);
  const [renderItem, setRenderItem] = useState(null);
  const [correctionItem, setCorrectionItem] = useState(null);
  const [isNewProductionOpen, setIsNewProductionOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isBridgeOpen, setIsBridgeOpen] = useState(false);
  const [isDbInspectorOpen, setIsDbInspectorOpen] = useState(false);

  // Filtered items computation
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. My Work filter
      if (isMyWorkOnly && item.assigned_user_id !== currentUser.id) {
        return false;
      }

      // 2. Assignee dropdown filter
      if (selectedAssignee !== 'all' && item.assigned_user_id !== selectedAssignee) {
        return false;
      }

      // 3. Stage filter
      if (activeStage && item.status !== activeStage) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesLabel = item.display_label.toLowerCase().includes(query);
        const matchesKey = item.external_key.toLowerCase().includes(query);
        const matchesFile = item.evidence_summary?.project_file?.toLowerCase().includes(query);
        if (!matchesLabel && !matchesKey && !matchesFile) return false;
      }

      return true;
    });
  }, [items, isMyWorkOnly, currentUser.id, selectedAssignee, activeStage, searchQuery]);

  return (
    <GlassShell>
      {/* Top Glass Sticky Header */}
      <GlassTopBar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenBridge={() => setIsBridgeOpen(true)}
      />

      {/* Main Content Layout with Desktop Sidebar Rail */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar Rail */}
        <GlassNav
          currentView={currentView}
          onNavigate={setCurrentView}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
          onOpenBridge={() => setIsBridgeOpen(true)}
          onOpenDbInspector={() => setIsDbInspectorOpen(true)}
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 p-4 sm:p-8 pb-28 sm:pb-12 overflow-x-hidden">
          {/* VIEW 1: OVERVIEW & PIPELINE DASHBOARD */}
          {currentView === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Hero Banner with Quick One-Tap Actions */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden bg-gradient-to-r from-indigo-900/20 via-purple-900/10 to-transparent">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold glass-pill text-cyan-300 border border-cyan-500/30 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AnyShare • Anything Ecosystem Bridge</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-2">
                    Production Status & Remote One Tap Bridge
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                    Monitor edit stages, verify folder rules deterministically, and trigger hardware renders directly from your mobile device or desktop.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playTap();
                        setIsNewProductionOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold glass-button-primary flex items-center gap-2 cursor-pointer"
                    >
                      <FolderPlus className="w-4 h-4" />
                      <span>+ New Production Session</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerBridgeScan()}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white/10 text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <FolderSync className="w-4 h-4 text-cyan-400" />
                      <span>Rescan Workstation Folders</span>
                    </button>
                  </div>
                </div>

                <div className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
              </div>

              {/* Stage Summary Component */}
              <StageSummary
                activeStage={activeStage}
                onSelectStage={setActiveStage}
              />

              {/* Work Section with Filters and Cards */}
              <div id="work-list-section" className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-base font-bold text-white">Active Productions</h3>
                    <p className="text-xs text-slate-400">
                      Showing {filteredItems.length} of {items.length} items
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeStage && (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playTap();
                          setActiveStage(null);
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium"
                      >
                        Reset Filter
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        sounds.playTap();
                        setIsNewProductionOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white/10 text-cyan-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>+ Add Session</span>
                    </button>
                  </div>
                </div>

                <WorkFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedAssignee={selectedAssignee}
                  onAssigneeChange={setSelectedAssignee}
                  activeStage={activeStage}
                  onClearStage={() => setActiveStage(null)}
                  isMyWorkOnly={isMyWorkOnly}
                  onToggleMyWork={setIsMyWorkOnly}
                  onRefreshScan={() => triggerBridgeScan()}
                />

                <WorkList
                  items={filteredItems}
                  onInspect={(item) => setInspectedItem(item)}
                  onStartRender={(item) => setRenderItem(item)}
                  onReviewCorrection={(item) => setCorrectionItem(item)}
                  onCreateNew={() => setIsNewProductionOpen(true)}
                  onRefreshScan={() => triggerBridgeScan()}
                />
              </div>
            </div>
          )}

          {/* VIEW 2: PRODUCTION WORK BOARD */}
          {currentView === 'work' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {isAdmin ? 'All Production Work' : 'My Assigned Work'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Deterministic One Tap workflow lifecycle tracking
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setIsNewProductionOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold glass-button-primary flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ New Production</span>
                </button>
              </div>

              <WorkFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedAssignee={selectedAssignee}
                onAssigneeChange={setSelectedAssignee}
                activeStage={activeStage}
                onClearStage={() => setActiveStage(null)}
                isMyWorkOnly={isMyWorkOnly}
                onToggleMyWork={setIsMyWorkOnly}
                onRefreshScan={() => triggerBridgeScan()}
              />

              <WorkList
                items={filteredItems}
                onInspect={(item) => setInspectedItem(item)}
                onStartRender={(item) => setRenderItem(item)}
                onReviewCorrection={(item) => setCorrectionItem(item)}
                onCreateNew={() => setIsNewProductionOpen(true)}
                onRefreshScan={() => triggerBridgeScan()}
              />
            </div>
          )}

          {/* VIEW 3: ADMIN CORRECTION QUEUE */}
          {currentView === 'corrections' && (
            <div className="animate-fadeIn">
              <CorrectionQueue
                onReviewItem={(item) => setCorrectionItem(item)}
              />
            </div>
          )}

          {/* VIEW 4: NOTIFICATIONS INBOX */}
          {currentView === 'notifications' && (
            <div className="animate-fadeIn">
              <NotificationCenter
                onSelectItem={(item) => setInspectedItem(item)}
              />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Thumb Navigation */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      {/* Floating Scroll-to-Top Button */}
      <ScrollToTop />

      {/* 1. Item Detail & Evidence Inspector Modal */}
      <WorkDetailModal
        item={inspectedItem}
        isOpen={Boolean(inspectedItem)}
        onClose={() => setInspectedItem(null)}
        onStartRender={(item) => setRenderItem(item)}
        onReviewCorrection={(item) => setCorrectionItem(item)}
      />

      {/* 2. One Tap Remote Render Action Modal */}
      <RenderActionModal
        item={renderItem}
        isOpen={Boolean(renderItem)}
        onClose={() => setRenderItem(null)}
      />

      {/* 3. Admin Correction Review Modal */}
      <CorrectionReviewModal
        item={correctionItem}
        isOpen={Boolean(correctionItem)}
        onClose={() => setCorrectionItem(null)}
      />

      {/* 4. New Production Modal */}
      <NewProductionModal
        isOpen={isNewProductionOpen}
        onClose={() => setIsNewProductionOpen(false)}
      />

      {/* 5. Notifications Modal */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full sm:max-w-2xl max-h-[85vh] rounded-t-3xl sm:rounded-3xl border border-white/20 shadow-2xl p-6 overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-3 py-1 rounded-lg glass-pill cursor-pointer"
              >
                Close
              </button>
            </div>
            <NotificationCenter
              onSelectItem={(item) => {
                setIsNotificationsOpen(false);
                setInspectedItem(item);
              }}
            />
          </div>
        </div>
      )}

      {/* 6. Node Telemetry & Bridge Health Modal */}
      <BridgeHealthModal
        isOpen={isBridgeOpen}
        onClose={() => setIsBridgeOpen(false)}
      />

      {/* 7. Account & Retention Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenDbInspector={() => {
          setIsAccountOpen(false);
          setIsDbInspectorOpen(true);
        }}
      />

      {/* 8. Supabase Database Schema Inspector Modal */}
      <DatabaseInspectorModal
        isOpen={isDbInspectorOpen}
        onClose={() => setIsDbInspectorOpen(false)}
      />
    </GlassShell>
  );
}
