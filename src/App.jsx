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

  const [currentView, setCurrentView] = useState('overview');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [activeStage, setActiveStage] = useState(null);
  const [isMyWorkOnly, setIsMyWorkOnly] = useState(false);

  const [inspectedItem, setInspectedItem] = useState(null);
  const [renderItem, setRenderItem] = useState(null);
  const [correctionItem, setCorrectionItem] = useState(null);
  const [isNewProductionOpen, setIsNewProductionOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isBridgeOpen, setIsBridgeOpen] = useState(false);
  const [isDbInspectorOpen, setIsDbInspectorOpen] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (isMyWorkOnly && item.assigned_user_id !== currentUser.id) {
        return false;
      }
      if (selectedAssignee !== 'all' && item.assigned_user_id !== selectedAssignee) {
        return false;
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
  }, [items, isMyWorkOnly, currentUser.id, selectedAssignee, activeStage, searchQuery]);

  return (
    <GlassShell>
      {/* Top Sticky Glass Header */}
      <GlassTopBar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenBridge={() => setIsBridgeOpen(true)}
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
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 p-4 sm:p-8 pb-28 sm:pb-12 overflow-x-hidden">
          {/* VIEW 1: OVERVIEW & PIPELINE DASHBOARD */}
          {currentView === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Islamic Golden Hero Banner */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#C5A059]/35 relative overflow-hidden bg-gradient-to-r from-amber-100/80 via-yellow-50/60 to-white/90 shadow-sm">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold glass-pill text-[#8B6508] border border-amber-300/80 bg-white/80 mb-3 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                    <span>AnyShare • Islamic Golden Edition</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight mb-2">
                    Production Status & Remote One Tap Bridge
                  </h2>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6 font-medium">
                    Monitor edit stages, verify folder rules deterministically, and trigger hardware renders directly from your mobile device or desktop.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playTap();
                        setIsNewProductionOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold glass-button-primary flex items-center gap-2 cursor-pointer shadow-md shadow-amber-900/15"
                    >
                      <FolderPlus className="w-4 h-4" />
                      <span>+ New Production Session</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerBridgeScan()}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold glass-pill hover:bg-white text-stone-800 flex items-center gap-2 transition-colors cursor-pointer border border-[#C5A059]/35 shadow-xs"
                    >
                      <FolderSync className="w-4 h-4 text-[#B8860B]" />
                      <span>Rescan Workstation Folders</span>
                    </button>
                  </div>
                </div>

                <div className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full bg-amber-300/25 blur-3xl pointer-events-none" />
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
                    <h3 className="text-base font-extrabold text-stone-900">Active Productions</h3>
                    <p className="text-xs text-stone-500 font-medium">
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
                        className="text-xs text-[#8B6508] hover:text-[#B8860B] cursor-pointer font-bold"
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
                      className="px-3 py-1.5 rounded-xl text-xs font-bold glass-pill hover:bg-white text-[#8B6508] flex items-center gap-1.5 cursor-pointer border border-[#C5A059]/35 shadow-xs"
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
                  <h2 className="text-xl font-extrabold text-stone-900">
                    {isAdmin ? 'All Production Work' : 'My Assigned Work'}
                  </h2>
                  <p className="text-xs text-stone-500 font-medium">
                    Deterministic One Tap workflow lifecycle tracking
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setIsNewProductionOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold glass-button-primary flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-900/15"
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

      <MobileBottomNav
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      <ScrollToTop />

      <WorkDetailModal
        item={inspectedItem}
        isOpen={Boolean(inspectedItem)}
        onClose={() => setInspectedItem(null)}
        onStartRender={(item) => setRenderItem(item)}
        onReviewCorrection={(item) => setCorrectionItem(item)}
      />

      <RenderActionModal
        item={renderItem}
        isOpen={Boolean(renderItem)}
        onClose={() => setRenderItem(null)}
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
      />

      <DatabaseInspectorModal
        isOpen={isDbInspectorOpen}
        onClose={() => setIsDbInspectorOpen(false)}
      />
    </GlassShell>
  );
}
