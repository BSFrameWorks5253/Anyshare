import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from './lib/store';
import { PIPELINE_MILESTONES } from './lib/mockData';
import GlassShell from './components/layout/GlassShell';
import GlassTopBar from './components/layout/GlassTopBar';
import GlassNav from './components/layout/GlassNav';
import MobileBottomNav from './components/layout/MobileBottomNav';
import StageSummary from './components/dashboard/StageSummary';
import WorkFilters from './components/dashboard/WorkFilters';
import WorkList from './components/dashboard/WorkList';
import WorkDetailModal from './components/dashboard/WorkDetailModal';
import RenderActionModal from './components/render/RenderActionModal';
import LiveRenderMonitorModal from './components/render/LiveRenderMonitorModal';
import CorrectionReviewModal from './components/corrections/CorrectionReviewModal';
import CorrectionQueue from './components/corrections/CorrectionQueue';
import NotificationCenter from './components/notifications/NotificationCenter';
import BridgeHealthModal from './components/bridge/BridgeHealthModal';
import AccountModal from './components/account/AccountModal';
import DatabaseInspectorModal from './components/account/DatabaseInspectorModal';
import NewProductionModal from './components/dashboard/NewProductionModal';
import QRScannerModal from './components/auth/QRScannerModal';
import UserManagementView from './components/users/UserManagementView';
import SafarHubView from './components/safar/SafarHubView';
import LoginModal from './components/auth/LoginModal';
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
  FolderPlus,
  ArrowUp,
  Activity
} from 'lucide-react';

export default function App() {
  const {
    items,
    currentUser,
    isAdmin,
    bridge,
    triggerBridgeScan
  } = useApp();

  const [currentView, setCurrentView] = useState('overview');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [activeMilestone, setActiveMilestone] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const [isMyWorkOnly, setIsMyWorkOnly] = useState(false);
  const [showScrollHUD, setShowScrollHUD] = useState(false);

  const [inspectedItem, setInspectedItem] = useState(null);
  const [renderItem, setRenderItem] = useState(null);
  const [isRenderMonitorOpen, setIsRenderMonitorOpen] = useState(false);
  const [monitorItemId, setMonitorItemId] = useState(null);
  const [correctionItem, setCorrectionItem] = useState(null);
  const [isNewProductionOpen, setIsNewProductionOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isBridgeOpen, setIsBridgeOpen] = useState(false);
  const [isDbInspectorOpen, setIsDbInspectorOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Scroll listener for Floating Luxury HUD
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollHUD(window.scrollY > 280);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderingCount = items.filter(i => i.status === 'rendering').length;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (isMyWorkOnly && item.assigned_user_id !== currentUser.id) {
        return false;
      }
      if (selectedAssignee !== 'all' && item.assigned_user_id !== selectedAssignee) {
        return false;
      }
      if (activeMilestone) {
        const milestoneObj = PIPELINE_MILESTONES.find(m => m.key === activeMilestone);
        if (milestoneObj && !milestoneObj.statuses.includes(item.status)) {
          return false;
        }
      }
      if (activeStage && item.status !== activeStage) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesLabel = item.display_label.toLowerCase().includes(query);
        const matchesKey = item.external_key.toLowerCase().includes(query);
        const matchesFile = item.evidence_summary?.project_file?.toLowerCase().includes(query);
        if (!matchesLabel && !matchesKey && !matchesFile) return false;
      }
      return true;
    });
  }, [items, isMyWorkOnly, currentUser.id, selectedAssignee, activeMilestone, activeStage, searchQuery]);

  return (
    <GlassShell>
      {/* Top Sticky Glass Header */}
      <GlassTopBar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenBridge={() => setIsBridgeOpen(true)}
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Layout with Desktop Sidebar Rail */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <GlassNav
          currentView={currentView}
          onNavigate={setCurrentView}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
          onOpenBridge={() => setIsBridgeOpen(true)}
          onOpenDbInspector={() => setIsDbInspectorOpen(true)}
          onOpenQRScanner={() => setIsQRScannerOpen(true)}
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 p-4 sm:p-8 pb-32 sm:pb-16 overflow-x-hidden">
          {/* VIEW 1: OVERVIEW & PIPELINE DASHBOARD */}
          {currentView === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Bespoke Islamic Golden Production Command Center */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border-2 border-[#C5A059]/45 relative overflow-hidden bg-gradient-to-br from-amber-100/90 via-[#FAF8F5] to-amber-50/60 shadow-lg text-left">
                {/* Background Arabesque Watermark */}
                <div className="absolute -right-12 -top-12 w-80 h-80 rounded-full bg-gradient-to-bl from-amber-300/25 via-[#D4AF37]/10 to-transparent blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black glass-pill text-[#785005] border border-amber-400 bg-white shadow-xs mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                      <span>AnyShare • Islamic Golden Command Center</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight leading-tight font-serif">
                      Real-Time Safar Productions & One Tap Bridge
                    </h2>

                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-semibold mt-2">
                      Deterministic multi-track workflow orchestrator. Trigger 4K hardware renders directly from your mobile device to workstation <strong className="text-stone-950 font-black">Studio-PC-01</strong> with live telemetry sync over Supabase Cloud Nexus.
                    </p>
                  </div>

                  {/* Live Hardware Node Status Card */}
                  <div className="p-4 rounded-2xl bg-white border border-[#C5A059]/40 shadow-sm shrink-0 min-w-[260px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-black">
                        Hardware Node Status
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        ONLINE (PORT 5253)
                      </span>
                    </div>

                    <div className="text-xs font-mono space-y-1 text-stone-800">
                      <div className="flex justify-between">
                        <span className="text-stone-500 font-sans">Node:</span>
                        <span className="font-bold text-stone-950">Studio-PC-01</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500 font-sans">GPU Accelerator:</span>
                        <span className="text-amber-800 font-bold">RTX 4090 (24GB VRAM)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500 font-sans">Cloud Nexus:</span>
                        <span className="text-emerald-700 font-bold">WebSockets Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 Quick Stat Metric Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#C5A059]/25 mb-6">
                  <div className="p-3.5 rounded-2xl bg-white/90 border border-[#C5A059]/30 shadow-xs">
                    <span className="text-[11px] font-bold text-stone-600 block">Total Safar Sessions</span>
                    <span className="text-2xl font-black text-stone-950 font-serif">{items.length} Productions</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/90 border border-[#C5A059]/30 shadow-xs">
                    <span className="text-[11px] font-bold text-stone-600 block">Ready for 1-Tap Render</span>
                    <span className="text-2xl font-black text-[#785005] font-serif">
                      {items.filter(i => i.status === 'ready_to_render').length} Queued
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/90 border border-[#C5A059]/30 shadow-xs">
                    <span className="text-[11px] font-bold text-stone-600 block">Active GPU Encoding</span>
                    <span className="text-2xl font-black text-amber-600 font-serif">
                      {renderingCount} Active
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/90 border border-[#C5A059]/30 shadow-xs">
                    <span className="text-[11px] font-bold text-stone-600 block">Active Creator</span>
                    <span className="text-base font-black text-stone-950 font-mono truncate block">
                      @{currentUser.username || 'creator'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setIsNewProductionOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-black glass-button-primary flex items-center gap-2 cursor-pointer shadow-md shadow-amber-900/15"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>+ New Production Session</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setCurrentView('users');
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-black glass-pill hover:bg-white text-stone-900 flex items-center gap-2 transition-colors cursor-pointer border border-[#C5A059]/40 shadow-xs"
                  >
                    <Activity className="w-4 h-4 text-[#8A6614]" />
                    <span>View Team & User Data</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setIsQRScannerOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-black bg-stone-900 text-amber-200 hover:bg-black flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <Zap className="w-4 h-4 text-[#D4AF37]" />
                    <span>Pair Desktop One Tap</span>
                  </button>
                </div>
              </div>

              {/* 5-Step Streamlined Pipeline Pulse */}
              <StageSummary
                activeMilestone={activeMilestone}
                onSelectMilestone={setActiveMilestone}
              />

              {/* Work Section with Filters and Cards */}
              <div id="work-list-section" className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-base font-black text-stone-950">Active Productions</h3>
                    <p className="text-xs text-stone-600 font-semibold">
                      Showing {filteredItems.length} of {items.length} items
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {(activeMilestone || activeStage) && (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playTap();
                          setActiveMilestone(null);
                          setActiveStage(null);
                        }}
                        className="text-xs text-[#785005] hover:text-[#B8860B] cursor-pointer font-extrabold"
                      >
                        Reset All Filters
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        sounds.playTap();
                        setIsNewProductionOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-black glass-pill hover:bg-white text-[#785005] flex items-center gap-1.5 cursor-pointer border border-[#C5A059]/40 shadow-xs"
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-[#B8860B]" />
                      <span>+ Add Session</span>
                    </button>
                  </div>
                </div>

                <WorkFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedAssignee={selectedAssignee}
                  onAssigneeChange={setSelectedAssignee}
                  activeMilestone={activeMilestone}
                  onClearMilestone={() => setActiveMilestone(null)}
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
                  <h2 className="text-xl font-black text-stone-950 font-serif">
                    {isAdmin ? 'All Production Work' : 'My Assigned Work'}
                  </h2>
                  <p className="text-xs text-stone-600 font-semibold">
                    Deterministic One Tap workflow lifecycle tracking
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setIsNewProductionOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-black glass-button-primary flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-900/15"
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
                activeMilestone={activeMilestone}
                onClearMilestone={() => setActiveMilestone(null)}
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
                onOpenMonitor={(item) => {
                  setMonitorItemId(item.id);
                  setIsRenderMonitorOpen(true);
                }}
                onCreateNew={() => setIsNewProductionOpen(true)}
                onRefreshScan={() => triggerBridgeScan()}
              />
            </div>
          )}

                    {/* VIEW: TEAM & USER INTELLIGENCE */}
          {/* VIEW: SAFAR HUB & UPLOAD MATRIX */}
          {currentView === 'safar' && (
            <div className="animate-fadeIn">
              <SafarHubView />
            </div>
          )}

          {currentView === 'users' && (
            <div className="animate-fadeIn">
              <UserManagementView
                onSelectUserForFilter={(userId) => {
                  setSelectedAssignee(userId);
                  setCurrentView('work');
                }}
                onNavigateToWork={() => setCurrentView('work')}
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

      {/* Floating Luxury HUD (reveals on scroll past hero) */}
      {showScrollHUD && (
        <aside 
          aria-label="Workstation Status HUD"
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-2xl glass-panel border border-[#C5A059]/45 shadow-xl bg-white/95 backdrop-blur-2xl flex items-center gap-3 animate-fadeIn transition-all select-none"
        >
          <div className="flex items-center gap-2 pr-2 border-r border-[#C5A059]/25">
            <span className={`w-2 h-2 rounded-full ${bridge.is_online ? 'bg-emerald-600 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-xs font-black text-stone-950 font-mono">
              {bridge.is_online ? 'Node Active' : 'Offline'}
            </span>
          </div>

          {renderingCount > 0 ? (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                const active = items.find(i => i.status === 'rendering');
                if (active) setMonitorItemId(active.id);
                setIsRenderMonitorOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs font-black text-amber-950 bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 px-3 py-1 rounded-xl border border-amber-500/50 shadow-sm animate-pulse cursor-pointer transition-all"
            >
              <Cpu className="w-3.5 h-3.5 animate-spin text-[#8A6614]" />
              <span>{renderingCount} Rendering • Monitor</span>
            </button>
          ) : (
            <span className="text-xs text-stone-700 font-semibold hidden sm:inline">
              {items.length} Productions Loaded
            </span>
          )}

          <div className="flex items-center gap-1.5 pl-1">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setIsNewProductionOpen(true);
              }}
              className="px-3 py-1 rounded-xl text-xs font-black glass-button-primary shadow-xs cursor-pointer"
            >
              + New
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-1.5 rounded-xl glass-pill hover:bg-white text-stone-800 hover:text-stone-950 border border-[#C5A059]/35 cursor-pointer"
              title="Scroll to top"
            >
              <ArrowUp className="w-3.5 h-3.5 text-[#8A6614]" />
            </button>
          </div>
        </aside>
      )}

      <MobileBottomNav
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
      />

      <ScrollToTop />

      <WorkDetailModal
        item={inspectedItem}
        isOpen={Boolean(inspectedItem)}
        onClose={() => setInspectedItem(null)}
        onStartRender={(item) => setRenderItem(item)}
        onReviewCorrection={(item) => setCorrectionItem(item)}
        onOpenMonitor={(item) => {
          setMonitorItemId(item.id);
          setIsRenderMonitorOpen(true);
        }}
      />

      <RenderActionModal
        item={renderItem}
        isOpen={Boolean(renderItem)}
        onClose={() => setRenderItem(null)}
        onRenderStarted={(item) => {
          setMonitorItemId(item.id);
          setIsRenderMonitorOpen(true);
        }}
      />

      <LiveRenderMonitorModal
        isOpen={isRenderMonitorOpen}
        itemId={monitorItemId}
        onClose={() => setIsRenderMonitorOpen(false)}
      />

      <CorrectionReviewModal
        item={correctionItem}
        isOpen={Boolean(correctionItem)}
        onClose={() => setCorrectionItem(null)}
      />

      <NewProductionModal
        isOpen={isNewProductionOpen}
        onClose={() => setIsNewProductionOpen(false)}
      />

      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/40 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full sm:max-w-2xl max-h-[85vh] rounded-t-3xl sm:rounded-3xl border border-[#C5A059]/40 shadow-2xl p-6 overflow-y-auto bg-[#FAF8F5]/95">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="text-stone-600 hover:text-stone-900 text-xs px-3 py-1 rounded-lg glass-pill cursor-pointer border border-[#C5A059]/30"
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

      <BridgeHealthModal
        isOpen={isBridgeOpen}
        onClose={() => setIsBridgeOpen(false)}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenDbInspector={() => {
          setIsAccountOpen(false);
          setIsDbInspectorOpen(true);
        }}
        onOpenQRScanner={() => {
          setIsAccountOpen(false);
          setIsQRScannerOpen(true);
        }}
      />

      <DatabaseInspectorModal
        isOpen={isDbInspectorOpen}
        onClose={() => setIsDbInspectorOpen(false)}
      />

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenQRScanner={() => {
          setIsLoginModalOpen(false);
          setIsQRScannerOpen(true);
        }}
      />

    </GlassShell>
  );
}
