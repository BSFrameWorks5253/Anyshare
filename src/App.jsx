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
import ProductionDashboardTemplate from './components/template/ProductionDashboardTemplate';
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
            <div className="space-y-8 animate-fadeIn overview-experience">
              <ProductionDashboardTemplate
                items={items}
                currentUser={currentUser}
                bridge={bridge}
                isAdmin={isAdmin}
                onNewProduction={() => setIsNewProductionOpen(true)}
                onOpenTeam={() => setCurrentView('users')}
                onPairDesktop={() => setIsQRScannerOpen(true)}
                onScan={() => triggerBridgeScan()}
              />
              {/* Executive Production Stages */}
              <StageSummary
                activeMilestone={activeMilestone}
                onSelectMilestone={setActiveMilestone}
              />

              {/* Work Section with Filters and Cards */}
              <div id="work-list-section" className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-base font-bold text-neutral-950">Active Productions</h3>
                    <p className="text-xs text-neutral-500 font-medium">
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
                        className="text-xs text-neutral-600 hover:text-neutral-950 cursor-pointer font-bold"
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
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold glass-pill hover:bg-white text-neutral-800 flex items-center gap-1.5 cursor-pointer border border-black/[0.08] shadow-xs"
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-neutral-600" />
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
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 font-sans">
                    {isAdmin ? 'All Production Work' : 'My Assigned Work'}
                  </h2>
                  <p className="text-xs text-neutral-500 font-medium">
                    One Tap workflow lifecycle and rendering queue
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setIsNewProductionOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold glass-button-primary flex items-center gap-1.5 cursor-pointer shadow-xs"
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

      {/* Floating Glass HUD (reveals on scroll past hero) */}
      {showScrollHUD && (
        <aside 
          aria-label="Workstation Status HUD"
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl glass-panel border border-black/[0.08] shadow-lg bg-white/90 backdrop-blur-2xl flex items-center gap-3 animate-fadeIn transition-all select-none"
        >
          <div className="flex items-center gap-2 pr-2 border-r border-black/[0.06]">
            <span className={`w-2 h-2 rounded-full ${bridge.is_online ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
            <span className="text-xs font-bold text-neutral-900 font-mono">
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
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-xl border border-emerald-300 shadow-2xs cursor-pointer transition-all"
            >
              <Cpu className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              <span>{renderingCount} Rendering • Monitor</span>
            </button>
          ) : (
            <span className="text-xs text-neutral-600 font-medium hidden sm:inline">
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
              className="px-3 py-1 rounded-xl text-xs font-semibold glass-button-primary shadow-xs cursor-pointer"
            >
              + New
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-1.5 rounded-xl glass-pill hover:bg-white text-neutral-700 hover:text-neutral-950 border border-black/[0.08] cursor-pointer"
              title="Scroll to top"
            >
              <ArrowUp className="w-3.5 h-3.5 text-neutral-600" />
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full sm:max-w-2xl max-h-[85vh] rounded-t-3xl sm:rounded-3xl border border-black/[0.08] shadow-2xl p-6 overflow-y-auto bg-white/95">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="text-neutral-600 hover:text-neutral-950 text-xs px-3 py-1 rounded-lg glass-pill cursor-pointer border border-black/[0.08]"
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
