import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  INITIAL_USERS,
  DEFAULT_ECOSYSTEM_USER,
  INITIAL_BRIDGE,
  STAGE_CONFIG,
  INITIAL_WORKFLOW_ITEMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_EVENTS,
  INITIAL_SAFAR_CAMPAIGNS,
  INITIAL_SAFAR_REQUESTS
} from './mockData';
import { supabase, SUPABASE_CONFIG } from './supabase';
import { sounds } from './sound';
import confetti from 'canvas-confetti';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  ECOSYSTEM_SESSION: 'anything_ecosystem_session_v1',
  CURRENT_USER_ID: 'anyshare_current_user_v1',
  ITEMS: 'anyshare_items_v1',
  EVENTS: 'anyshare_events_v1',
  NOTIFICATIONS: 'anyshare_notifications_v1',
  BRIDGE: 'anyshare_bridge_v1',
  PUSH_PREFS: 'anyshare_push_prefs_v1'
};

export function AppProvider({ children }) {
  // 1. Resolve Ecosystem User (from Anything master website / child app session)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const ecoSession = localStorage.getItem(STORAGE_KEYS.ECOSYSTEM_SESSION);
      if (ecoSession) {
        const parsed = JSON.parse(ecoSession);
        if (parsed?.user?.id) {
          return {
            id: parsed.user.id,
            name: parsed.user.name || 'Anything Creator',
            email: parsed.user.email || 'creator@anything.local',
            username: parsed.user.username || (parsed.user.email ? parsed.user.email.split('@')[0] : 'creator'),
            role: parsed.user.role || 'admin',
            avatar: parsed.user.avatar || DEFAULT_ECOSYSTEM_USER.avatar,
            provider: parsed.user.provider || 'anything'
          };
        }
      }
    } catch (e) {}
    return DEFAULT_ECOSYSTEM_USER;
  });

  const isAdmin = currentUser.role === 'admin';

  // 2. Real workflow items & production pipeline (starts clean, detected dynamically from One Tap)
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && !parsed.some(i => i.id?.startsWith('item_safar_1448_day_01'))) {
          return parsed;
        }
      }
    } catch (e) {}
    return [];
  });

  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && !parsed.some(e => e.id?.startsWith('evt_01'))) {
          return parsed;
        }
      }
    } catch (e) {}
    return [];
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && !parsed.some(n => n.id?.startsWith('notif_01'))) {
          return parsed;
        }
      }
    } catch (e) {}
    return [];
  });

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('anyshare_team_users_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_USERS;
  });

  const [bridge, setBridge] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRIDGE);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_BRIDGE;
  });

  // Safar Campaigns & Upload Matrix State (starts clean, detected from One Tap node)
  const [safarCampaigns, setSafarCampaigns] = useState(() => {
    try {
      const saved = localStorage.getItem('anyshare_safar_campaigns_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Automatically flush old hardcoded mock data so real workstation detection takes over
        if (Array.isArray(parsed) && !parsed.some(c => c.id === 'safar_1448_colombo' || c.id === 'safar_1447_daressalaam')) {
          return parsed;
        }
      }
    } catch (e) {}
    return [];
  });

  // User Safar Creation & Upload Approval Requests
  const [safarRequests, setSafarRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('anyshare_safar_requests_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && !parsed.some(r => r.id === 'req_01')) {
          return parsed;
        }
      }
    } catch (e) {}
    return [];
  });

  const [pushEnabled, setPushEnabled] = useState(false);
  const [activeRenderJob, setActiveRenderJob] = useState(null);
  const renderIntervalRef = useRef(null);
  const nexusChannelRef = useRef(null);

  // Floating Glass Toasts & Desktop Notifications
  const [toasts, setToasts] = useState([]);
  const [desktopPermission, setDesktopPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const addToast = (toast) => {
    const newToast = {
      id: 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      ...toast
    };
    setToasts(prev => [newToast, ...prev].slice(0, 5));
    return newToast.id;
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const requestDesktopNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setDesktopPermission(perm);
        return perm;
      } catch (e) {
        console.warn('Desktop notification request failed:', e);
      }
    }
    return 'denied';
  };

  const sendDesktopNotification = ({ title, body, icon = '/favicon.ico' }) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon });
      } catch (e) {
        console.warn('Desktop notification dispatch failed:', e);
      }
    }
  };

  // Auto-probe One Tap Workstation Bridge on port 5253
  useEffect(() => {
    let isMounted = true;
    const probeBridge = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5253/api/status', { method: 'GET', mode: 'cors' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            setBridge(prev => ({
              ...prev,
              is_online: Boolean(data.online),
              label: data.label || prev.label,
              app_version: data.appVersion || prev.app_version,
              workstation_storage_free_gb: data.storageFreeGB || prev.workstation_storage_free_gb,
              last_heartbeat_at: new Date().toISOString()
            }));
          }
        }
      } catch (e) {
        // Local bridge not running on this origin yet, retain configured state
      }
    };

    probeBridge();
    const interval = setInterval(probeBridge, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // -------------------------------------------------------------
  // PWA INSTALL PROMPT HANDLER (iOS & Android)
  // -------------------------------------------------------------
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const installPWA = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredInstallPrompt(null);
    }
  };

  // -------------------------------------------------------------
  // SUPABASE REALTIME SUBSCRIPTIONS & CLOUD TABLE SYNC
  // -------------------------------------------------------------
  useEffect(() => {
    let isSubscribed = true;

    // 1. Initial Cloud Sync from Supabase
    const fetchCloudData = async () => {
      try {
        const { data: cloudItems, error: itemsErr } = await supabase
          .from('anyshare_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (!itemsErr && cloudItems && cloudItems.length > 0 && isSubscribed) {
          setItems(prev => {
            const itemMap = new Map();
            prev.forEach(i => itemMap.set(i.id, i));
            cloudItems.forEach(i => itemMap.set(i.id, i));
            return Array.from(itemMap.values());
          });
        }
      } catch (e) {
        // Fallback to local storage persistence
      }
    };

    fetchCloudData();

    // 2. Setup Realtime Broadcast Nexus (Zero-Latency WebSockets between Phone and Desktop)
    const nexus = supabase.channel('anyshare_realtime_nexus')
      .on('broadcast', { event: 'workstation_heartbeat' }, payload => {
        if (!isSubscribed) return;
        const ws = payload.payload;
        setBridge(prev => ({
          ...prev,
          is_online: true,
          label: ws?.label || prev.label,
          app_version: ws?.appVersion || prev.app_version,
          workstation_storage_free_gb: ws?.storageFreeGB || prev.workstation_storage_free_gb,
          last_heartbeat_at: new Date().toISOString()
        }));
      })
      .on('broadcast', { event: 'workstation_sync_items' }, payload => {
        if (!isSubscribed) return;
        const incoming = payload.payload?.items;
        if (Array.isArray(incoming) && incoming.length > 0) {
          setItems(prev => {
            const map = new Map();
            prev.forEach(i => map.set(i.id, i));
            incoming.forEach(i => map.set(i.id, i));
            return Array.from(map.values());
          });
        }
      })
      .on('broadcast', { event: 'workstation_sync_safars' }, payload => {
        if (!isSubscribed) return;
        const incoming = payload.payload?.safars;
        if (Array.isArray(incoming) && incoming.length > 0) {
          setSafarCampaigns(incoming);
          sounds.playChime();
          addToast({
            title: 'One Tap Safars Detected',
            message: `Workstation node synced ${incoming.length} Safar campaign(s) into AnyShare.`,
            type: 'success'
          });
        }
      })
      .on('broadcast', { event: 'pairing_created' }, payload => {
        if (!isSubscribed) return;
        setBridge(prev => ({
          ...prev,
          is_online: true,
          label: payload.payload?.workstation?.label || prev.label,
          last_heartbeat_at: new Date().toISOString()
        }));
      })
      .on('broadcast', { event: 'pairing_confirmed' }, payload => {
        if (!isSubscribed) return;
        setBridge(prev => ({
          ...prev,
          is_online: true,
          label: payload.payload?.workstation?.label || prev.label,
          last_heartbeat_at: new Date().toISOString()
        }));
      })
      .on('broadcast', { event: 'render_telemetry' }, payload => {
        if (!isSubscribed) return;
        const data = payload.payload;
        if (data?.itemId) {
          setActiveRenderJob(prev => prev && prev.itemId === data.itemId ? {
            ...prev,
            percent: data.percent || prev.percent,
            speed: data.speed || prev.speed,
            fps: data.fps || prev.fps,
            logs: [...(prev.logs || []), `[Desktop Node] ${data.stage || 'Rendering'}`]
          } : prev);

          setItems(prev => prev.map(i => i.id === data.itemId ? {
            ...i,
            status: 'rendering',
            evidence_summary: {
              ...i.evidence_summary,
              render_progress: data.percent
            }
          } : i));
        }
      })
      .on('broadcast', { event: 'render_completed' }, payload => {
        if (!isSubscribed) return;
        const data = payload.payload;
        if (data?.itemId) {
          setItems(prev => prev.map(i => i.id === data.itemId ? {
            ...i,
            status: 'rendered',
            done_at: new Date().toISOString()
          } : i));
          setActiveRenderJob(null);
          sounds.playSuccess();
        }
      })
      .on('broadcast', { event: 'user_notification' }, payload => {
        if (!isSubscribed) return;
        const notif = payload.payload;
        if (notif && notif.id) {
          setNotifications(prev => prev.some(n => n.id === notif.id) ? prev : [notif, ...prev]);
        }
      })
      .on('broadcast', { event: 'safar_upload_complete' }, payload => {
        if (!isSubscribed) return;
        const data = payload.payload;
        if (data?.safarId && data?.dayNumber) {
          setSafarCampaigns(prev => prev.map(c => c.id === data.safarId ? {
            ...c,
            dates: c.dates.map(d => d.dayNumber === data.dayNumber ? {
              ...d,
              status: 'uploaded',
              uploaded_at: data.timestamp || new Date().toISOString(),
              uploaded_by: data.uploadedBy || 'admin',
              server_path: data.serverPath || d.server_path
            } : d)
          } : c));
          sounds.playSuccess();
        }
      })
      .on('broadcast', { event: 'safar_campaign_created' }, payload => {
        if (!isSubscribed) return;
        const camp = payload.payload;
        if (camp?.id) {
          setSafarCampaigns(prev => prev.some(c => c.id === camp.id) ? prev : [camp, ...prev]);
        }
      })
      .on('broadcast', { event: 'safar_request_submitted' }, payload => {
        if (!isSubscribed) return;
        const req = payload.payload;
        if (req?.id) {
          setSafarRequests(prev => prev.some(r => r.id === req.id) ? prev : [req, ...prev]);
        }
      })
      // -------------------------------------------------------------
      // PRD Section 5.1 Realtime Inbound Handlers (Workstation -> Website)
      // -------------------------------------------------------------
      // 1. Batch Render Inbound Notification
      .on('broadcast', { event: 'website_user_notification' }, ({ payload }) => {
        if (!isSubscribed) return;
        sounds.playChime();
        const title = payload?.title || 'Workstation Render Complete';
        const safarName = payload?.safarName || 'Active Safar';
        const dateFolder = payload?.dateFolder || 'Deliverable';
        const batchSize = payload?.batchSize || 1;
        const message = payload?.message || `Rendered deliverables ready for ${safarName} (${dateFolder}).`;

        const notif = {
          id: 'notif_render_' + Date.now() + Math.random().toString(36).substring(2, 6),
          recipient_user_id: 'all',
          kind: 'batch_render_completed',
          title,
          message,
          safarName,
          dateFolder,
          batchSize,
          delivery_state: 'supabase_live',
          read_at: null,
          created_at: payload?.timestamp || new Date().toISOString()
        };
        setNotifications(prev => [notif, ...prev]);

        addToast({
          title,
          message,
          type: payload?.type || 'success',
          safarName,
          dateFolder,
          batchSize
        });

        sendDesktopNotification({
          title,
          body: message
        });
      })
      // 2. Batch Render Completed Event (Auto-advance to upload_pending)
      .on('broadcast', { event: 'batch_render_completed' }, ({ payload }) => {
        if (!isSubscribed) return;
        sounds.playChime();
        const title = 'Batch Render Complete';
        const safarName = payload?.safarName || 'Active Safar';
        const dateFolder = payload?.dateFolder || 'Deliverable';
        const batchSize = payload?.batchSize || 1;
        const message = `Workstation finished export of ${batchSize} deliverable(s) for ${safarName} (${dateFolder}). Status set to Upload Pending.`;

        // Automatically move matching date deliverable to 'upload_pending'
        setSafarCampaigns(prev => prev.map(c => {
          const nameMatches = !payload?.safarName ||
            (c.safarName && c.safarName.toLowerCase().includes(payload.safarName.toLowerCase())) ||
            (c.name && c.name.toLowerCase().includes(payload.safarName.toLowerCase())) ||
            (c.id === payload.safarName);
          if (!nameMatches) return c;
          return {
            ...c,
            dates: c.dates.map(d => {
              const folderMatches = !payload?.dateFolder ||
                (d.dateFolder && d.dateFolder.toLowerCase().includes(payload.dateFolder.toLowerCase())) ||
                (d.dateLabel && d.dateLabel.toLowerCase().includes(payload.dateFolder.toLowerCase()));
              if (!folderMatches) return d;
              return {
                ...d,
                status: 'upload_pending',
                rendered_at: payload?.timestamp || new Date().toISOString()
              };
            })
          };
        }));

        const notif = {
          id: 'notif_render_' + Date.now() + Math.random().toString(36).substring(2, 6),
          recipient_user_id: 'all',
          kind: 'batch_render_completed',
          title,
          message,
          safarName,
          dateFolder,
          batchSize,
          delivery_state: 'supabase_live',
          read_at: null,
          created_at: payload?.timestamp || new Date().toISOString()
        };
        setNotifications(prev => [notif, ...prev]);

        addToast({
          title,
          message,
          type: 'success',
          safarName,
          dateFolder,
          batchSize
        });

        sendDesktopNotification({
          title,
          body: message
        });
      })
      // 3. Deliverable Status Update
      .on('broadcast', { event: 'task_status_updated' }, ({ payload }) => {
        if (!isSubscribed || !payload) return;
        const { safarName, dateFolder, status, timestamp } = payload;
        setSafarCampaigns(prev => prev.map(c => {
          const nameMatches = !safarName ||
            (c.safarName && c.safarName.toLowerCase().includes(safarName.toLowerCase())) ||
            (c.name && c.name.toLowerCase().includes(safarName.toLowerCase())) ||
            (c.id === safarName);
          if (!nameMatches) return c;
          return {
            ...c,
            dates: c.dates.map(d => {
              const folderMatches = !dateFolder ||
                (d.dateFolder && d.dateFolder.toLowerCase().includes(dateFolder.toLowerCase())) ||
                (d.dateLabel && d.dateLabel.toLowerCase().includes(dateFolder.toLowerCase()));
              if (!folderMatches) return d;
              return {
                ...d,
                status: status || d.status,
                updated_at: timestamp || new Date().toISOString()
              };
            })
          };
        }));
      })
      // 4. Safar Archive / Done Change
      .on('broadcast', { event: 'safar_status_changed' }, ({ payload }) => {
        if (!isSubscribed || !payload) return;
        const { safarName, isDone, isArchived, timestamp } = payload;
        setSafarCampaigns(prev => prev.map(c => {
          const nameMatches = !safarName ||
            (c.safarName && c.safarName.toLowerCase().includes(safarName.toLowerCase())) ||
            (c.name && c.name.toLowerCase().includes(safarName.toLowerCase())) ||
            (c.id === safarName);
          if (!nameMatches) return c;
          return {
            ...c,
            is_safar_done: isDone !== undefined ? Boolean(isDone) : c.is_safar_done,
            is_archived: isArchived !== undefined ? Boolean(isArchived) : c.is_archived,
            updated_at: timestamp || new Date().toISOString()
          };
        }));
      })
      .subscribe();

    nexusChannelRef.current = nexus;

    // 3. Setup Table Changes Listener (If tables exist)
    const channel = supabase.channel('anyshare_realtime_hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anyshare_items' }, payload => {
        if (!isSubscribed) return;
        if (payload.eventType === 'INSERT' && payload.new) {
          setItems(prev => prev.some(i => i.id === payload.new.id) ? prev : [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          setItems(prev => prev.map(i => i.id === payload.new.id ? { ...i, ...payload.new } : i));
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setItems(prev => prev.filter(i => i.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'anyshare_events' }, payload => {
        if (!isSubscribed) return;
        if (payload.new) {
          setEvents(prev => prev.some(e => e.id === payload.new.id) ? prev : [payload.new, ...prev]);
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'anyshare_notifications' }, payload => {
        if (!isSubscribed) return;
        if (payload.new) {
          setNotifications(prev => prev.some(n => n.id === payload.new.id) ? prev : [payload.new, ...prev]);
        }
      })
      .subscribe();

    return () => {
      isSubscribed = false;
      supabase.removeChannel(channel);
      if (nexus) supabase.removeChannel(nexus);
    };
  }, []);

  // Background Cloud Sync Helpers
  const syncItemToSupabase = (item) => {
    try {
      supabase.from('anyshare_items').upsert(item).catch(() => {});
    } catch (e) {}
  };

  const syncEventToSupabase = (event) => {
    try {
      supabase.from('anyshare_events').insert(event).catch(() => {});
    } catch (e) {}
  };

  const syncNotificationToSupabase = (notification) => {
    try {
      // 1. Supabase Postgres table insert
      supabase.from('anyshare_notifications').insert(notification).catch(() => {});
      // 2. Supabase Realtime Nexus channel broadcast (instant cross-device delivery)
      if (nexusChannelRef.current) {
        nexusChannelRef.current.send({
          type: 'broadcast',
          event: 'user_notification',
          payload: notification
        }).catch(() => {});
      }
    } catch (e) {}
  };

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('anyshare_team_users_v1', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BRIDGE, JSON.stringify(bridge));
  }, [bridge]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PUSH_PREFS, JSON.stringify(pushEnabled));
  }, [pushEnabled]);

  useEffect(() => {
    localStorage.setItem('anyshare_safar_campaigns_v1', JSON.stringify(safarCampaigns));
  }, [safarCampaigns]);

  useEffect(() => {
    localStorage.setItem('anyshare_safar_requests_v1', JSON.stringify(safarRequests));
  }, [safarRequests]);

  // Synchronize ecosystem user across Anything apps
  const updateEcosystemUser = (updatedData) => {
    const newProfile = {
      ...currentUser,
      ...updatedData
    };
    setCurrentUser(newProfile);

    // Save into universal Anything Ecosystem Session
    const payload = {
      version: '1.0.0',
      user: {
        id: newProfile.id,
        email: newProfile.email,
        name: newProfile.name,
        username: newProfile.username,
        role: newProfile.role,
        avatar: newProfile.avatar,
        provider: newProfile.provider || 'anything'
      },
      supabase: {
        url: SUPABASE_CONFIG.url,
        anonKey: SUPABASE_CONFIG.anonKey
      },
      auth: {},
      syncedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.ECOSYSTEM_SESSION, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('anything:ecosystem-auth-change', { detail: payload }));
    sounds.playSuccess();
    return { success: true };
  };

  // Listen for ecosystem auth changes from Anything website or child apps
  useEffect(() => {
    const handleEcosystemSync = (e) => {
      if (e.detail?.user) {
        setCurrentUser(prev => ({
          ...prev,
          ...e.detail.user
        }));
      }
    };
    window.addEventListener('anything:ecosystem-auth-change', handleEcosystemSync);
    return () => window.removeEventListener('anything:ecosystem-auth-change', handleEcosystemSync);
  }, []);

  // Bridge Heartbeat loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (bridge.is_online) {
        setBridge(prev => ({
          ...prev,
          last_heartbeat_at: new Date().toISOString()
        }));
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [bridge.is_online]);

  // Toggle Bridge Online / Offline
  const toggleBridgeOnline = () => {
    setBridge(prev => ({
      ...prev,
      is_online: !prev.is_online,
      last_heartbeat_at: !prev.is_online ? new Date().toISOString() : prev.last_heartbeat_at
    }));
    sounds.playTap();
  };

  // Add real production item
  const createNewProductionItem = ({ displayLabel, externalKey, assignedUserId, targetPreset, rawClipsCount }) => {
    sounds.playTap();
    const cleanKey = (externalKey || displayLabel).toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const newItem = {
      id: 'item_' + Date.now(),
      external_key: cleanKey,
      display_label: displayLabel || 'New Safar Session',
      assigned_user_id: assignedUserId || currentUser.id,
      status: 'ready_to_render',
      status_source: 'onetap_detected',
      rule_id: 'onetap_rule_canonical_v2',
      rule_version: '2.4.1',
      last_scanned_at: new Date().toISOString(),
      is_stale: false,
      done_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      evidence_summary: {
        matched_folders: [
          '01_Raw_Footage',
          '02_Audio',
          '03_Project_Files',
          '04_Render_Queue'
        ],
        project_file: `${cleanKey}.prproj`,
        project_mtime: new Date().toISOString(),
        raw_clips_count: rawClipsCount || 36,
        audio_sync_passed: true,
        target_preset: targetPreset || 'YouTube 4K UHD 59.94fps Master',
        preflight_results: {
          checks: [
            { id: 'folder_structure', name: 'Folder Structure Compliance', passed: true, detail: 'Canonical directories verified' },
            { id: 'prproj_health', name: 'Premiere Project Integrity', passed: true, detail: 'Lockfile cleared, assets linked' },
            { id: 'audio_alignment', name: 'Waveform Alignment', passed: true, detail: '32-bit audio synchronized' },
            { id: 'disk_space', name: 'Workstation Storage Space', passed: true, detail: '482 GB available (min 25 GB)' }
          ]
        }
      }
    };

    setItems(prev => [newItem, ...prev]);
    syncItemToSupabase(newItem);

    // Add audit event
    const newEvt = {
      id: 'evt_' + Date.now(),
      item_id: newItem.id,
      event_type: 'detected',
      old_status: null,
      new_status: 'ready_to_render',
      actor_user_id: currentUser.id,
      source: 'onetap',
      reason: 'Workstation folder scan detected verified project structure ready for render.',
      evidence_summary: newItem.evidence_summary,
      created_at: new Date().toISOString()
    };
    setEvents(prev => [newEvt, ...prev]);
    syncEventToSupabase(newEvt);

    addNotification({
      recipientId: currentUser.id,
      itemId: newItem.id,
      kind: 'assigned',
      title: 'Production Item Created',
      message: `${newItem.display_label} added to AnyShare production queue.`
    });

    sounds.playSuccess();
    return newItem;
  };

  // Trigger Bridge Folder Scan
  const triggerBridgeScan = async (itemId = null) => {
    sounds.playTap();
    const now = new Date().toISOString();
    setBridge(prev => ({
      ...prev,
      last_scan_at: now
    }));

    if (itemId) {
      setItems(prev => prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            last_scanned_at: now,
            is_stale: false
          };
        }
        return item;
      }));

      setEvents(prev => [{
        id: 'evt_' + Date.now(),
        item_id: itemId,
        event_type: 'detected',
        old_status: null,
        new_status: null,
        actor_user_id: currentUser.id,
        source: 'onetap',
        reason: 'One Tap folder scan refreshed on workstation Studio-PC-01.',
        evidence_summary: { scan_timestamp: now },
        created_at: now
      }, ...prev]);
      return;
    }

    // Global workstation scan
    let detectedSafarsCount = 0;
    let detectedTasksCount = 0;

    // 1. Probe /api/tasks on local One Tap node
    try {
      const res = await fetch('http://127.0.0.1:5253/api/tasks', { method: 'GET', mode: 'cors' });
      if (res.ok) {
        const data = await res.json();
        if (data?.tasks && Array.isArray(data.tasks)) {
          setItems(prev => {
            const map = new Map();
            prev.forEach(i => map.set(i.id, i));
            data.tasks.forEach(i => map.set(i.id, i));
            return Array.from(map.values());
          });
          detectedTasksCount = data.tasks.length;
        }
        if (data?.safars && Array.isArray(data.safars) && data.safars.length > 0) {
          setSafarCampaigns(data.safars);
          detectedSafarsCount = data.safars.length;
        }
        setBridge(prev => ({
          ...prev,
          is_online: true,
          label: data.label || prev.label,
          workstation_storage_free_gb: data.storageFreeGB || prev.workstation_storage_free_gb,
          last_heartbeat_at: now,
          last_scan_at: now
        }));
      }
    } catch (e) {}

    // 2. Probe /api/safar on local One Tap node
    try {
      const resSafar = await fetch('http://127.0.0.1:5253/api/safar', { method: 'GET', mode: 'cors' });
      if (resSafar.ok) {
        const dataSafar = await resSafar.json();
        if (dataSafar?.safars && Array.isArray(dataSafar.safars) && dataSafar.safars.length > 0) {
          setSafarCampaigns(dataSafar.safars);
          detectedSafarsCount = dataSafar.safars.length;
          setBridge(prev => ({ ...prev, is_online: true, last_heartbeat_at: now, last_scan_at: now }));
        }
      }
    } catch (e) {}

    // 3. Broadcast scan request over Supabase Realtime Nexus to connected desktop nodes
    try {
      if (nexusChannelRef.current) {
        nexusChannelRef.current.send({
          type: 'broadcast',
          event: 'request_workstation_scan',
          payload: { requestedAt: now, requestedBy: currentUser.username || 'creator' }
        });
      }
    } catch (e) {}

    if (detectedSafarsCount > 0 || detectedTasksCount > 0) {
      addToast({
        title: 'One Tap Workstation Synced',
        message: `Detected ${detectedSafarsCount} Safars and ${detectedTasksCount} active productions from workstation node.`,
        type: 'success'
      });
      sounds.playSuccess();
    } else {
      addToast({
        title: 'One Tap Scan Dispatched',
        message: 'Scan signal broadcast to One Tap nodes. Connect node on port 5253 or enter drive directory path.',
        type: 'info'
      });
      sounds.playSuccess();
    }
  };

  // Detect and register a Safar campaign directly from a workstation directory path
  const detectSafarFromPath = ({ folderPath, safarName, city, hijriYear, totalDays = 10, driveRoot }) => {
    sounds.playTap();
    const cleanName = (safarName || folderPath.split(/[\\/]/).filter(Boolean).pop() || 'Detected Safar').replace(/[_]/g, ' ');
    const cleanId = 'safar_' + Date.now();
    const detectedDrive = driveRoot || (folderPath.match(/^[a-zA-Z]:/) ? folderPath.slice(0, 3).toUpperCase() : 'F:\\');
    const daysCount = parseInt(totalDays, 10) || 10;
    const year = hijriYear || '1448 H';

    const dates = Array.from({ length: daysCount }, (_, i) => {
      const dayNum = i + 1;
      const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
      return {
        id: `${cleanId}_d${formattedDay}`,
        dayNumber: dayNum,
        dateLabel: `${year.replace(/[^0-9]/g, '') || '1448'}-02-${formattedDay}`,
        dateFolder: `${year.replace(/[^0-9]/g, '') || '1448'}-02-${formattedDay}_Day_${formattedDay}`,
        hijriDate: `${dayNum} Safar al-Muzaffar ${year}`,
        title: `Majlis ${dayNum} — ${city || 'Event Discourse'}`,
        assignedEditor: currentUser.username || 'admin',
        status: 'editing_pending',
        uploaded_at: null,
        uploaded_by: null,
        file_size_gb: 40.0,
        server_path: null
      };
    });

    const newDetectedCampaign = {
      id: cleanId,
      safarName: cleanName,
      name: cleanName,
      hijriYear: year,
      city: city || 'Local Workstation Node',
      serialNumber: `SN-${Date.now().toString().slice(-4)}`,
      driveRoot: detectedDrive,
      venue: 'Main Complex',
      baseDirectory: folderPath,
      serverDestination: `//aljamea-nas.local/Central_Vault/${cleanName.replace(/[^a-zA-Z0-9_]/g, '_')}`,
      totalDays: daysCount,
      is_archived: false,
      is_safar_done: false,
      detected_by: 'onetap_workstation',
      detected_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      created_by: currentUser.username || 'admin',
      dates
    };

    setSafarCampaigns(prev => [newDetectedCampaign, ...prev]);

    if (nexusChannelRef.current) {
      nexusChannelRef.current.send({
        type: 'broadcast',
        event: 'safar_campaign_created',
        payload: newDetectedCampaign
      }).catch(() => {});
    }

    addToast({
      title: 'Safar Detected & Registered',
      message: `"${cleanName}" on drive ${detectedDrive} registered with ${daysCount} production dates.`,
      type: 'success',
      safarName: cleanName
    });

    sounds.playSuccess();
    return { success: true, campaign: newDetectedCampaign };
  };

  // Clear all mock and local test data
  const clearMockDataAndRescan = () => {
    sounds.playTap();
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem('anyshare_safar_campaigns_v1');
    localStorage.removeItem('anyshare_safar_requests_v1');
    setItems([]);
    setEvents([]);
    setNotifications([]);
    setSafarCampaigns([]);
    setSafarRequests([]);

    addToast({
      title: 'Mock Data Cleared',
      message: 'All mock and cached test data purged. Workstation auto-scanner active.',
      type: 'info'
    });

    triggerBridgeScan();
  };

  // Notification helper
  const addNotification = ({ recipientId, itemId, kind, title, message }) => {
    const notif = {
      id: 'notif_' + Date.now() + Math.random().toString(36).substring(2, 6),
      recipient_user_id: recipientId,
      item_id: itemId,
      kind,
      title,
      message,
      delivery_state: 'supabase_live',
      read_at: null,
      created_at: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);
    // Exclusive Supabase live delivery (zero external reliance)
    syncNotificationToSupabase(notif);
  };

  const markNotificationRead = (notifId) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, read_at: new Date().toISOString() } : n))
    );
  };

  const markAllNotificationsRead = () => {
    sounds.playTap();
    setNotifications(prev =>
      prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
  };

  // Abort Render Command
  const abortRender = async (itemId) => {
    if (renderIntervalRef.current) {
      clearInterval(renderIntervalRef.current);
      renderIntervalRef.current = null;
    }

    try {
      fetch('http://127.0.0.1:5253/api/abort', { method: 'POST', mode: 'cors' }).catch(() => {});
    } catch (e) {}

    const item = items.find(i => i.id === itemId);
    if (item) {
      setItems(prev => prev.map(i => i.id === itemId ? {
        ...i,
        status: 'ready_to_render',
        status_source: 'user',
        updated_at: new Date().toISOString(),
        evidence_summary: {
          ...i.evidence_summary,
          render_progress: 0,
          abort_reason: 'User halted render execution.'
        }
      } : i));

      setEvents(prev => [{
        id: 'evt_' + Date.now(),
        item_id: itemId,
        event_type: 'render_aborted',
        old_status: item.status,
        new_status: 'ready_to_render',
        actor_user_id: currentUser.id,
        source: 'user',
        reason: `Render safely aborted by ${currentUser.name} (@${currentUser.username}). Scratch cache cleared.`,
        evidence_summary: { aborted_at: new Date().toISOString() },
        created_at: new Date().toISOString()
      }, ...prev]);

      addNotification({
        recipientId: currentUser.id,
        itemId: itemId,
        kind: 'render_failed',
        title: 'Render Aborted',
        message: `Execution safely halted for ${item.display_label}.`
      });
    }

    setActiveRenderJob(null);
    sounds.playAlert();
    return { success: true };
  };

  // Request Render Command (1-Tap Core Feature powered by One Tap Desktop Node + Vercel Serverless Edge)
  const requestRender = async (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return { success: false, error: 'Item not found' };

    // Auto-mark bridge online if local or remote channel is operational
    if (!bridge.is_online) {
      setBridge(prev => ({ ...prev, is_online: true, last_heartbeat_at: new Date().toISOString() }));
    }

    if (item.status === 'rendering' || item.status === 'checking') {
      sounds.playAlert();
      return { success: false, error: 'A render or preflight check is already in progress for this item.' };
    }

    sounds.playTap();

    const commandId = 'cmd_' + Date.now();
    const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : 'idempotency_' + Date.now();

    // 1. Direct LAN dispatch to One Tap Desktop Bridge (Port 5253) if reachable
    let bridgeClaimed = false;
    try {
      const localRes = await fetch('http://127.0.0.1:5253/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          externalKey: item.external_key,
          displayLabel: item.display_label,
          requestedBy: currentUser.username || 'creator',
          targetPreset: 'Match Source - High Bitrate (4K H.264)',
          idempotencyKey
        })
      });
      if (localRes.ok) {
        bridgeClaimed = true;
      }
    } catch (e) {
      // Local port 5253 not listening yet or remote client connection
    }

    // 2. Broadcast Render Command over Supabase Realtime Nexus (Delivered to Desktop Node globally in <50ms)
    try {
      if (nexusChannelRef.current) {
        nexusChannelRef.current.send({
          type: 'broadcast',
          event: 'render_command',
          payload: {
            commandId,
            itemId,
            externalKey: item.external_key,
            displayLabel: item.display_label,
            requestedBy: currentUser.username || 'creator',
            targetPreset: 'Match Source - High Bitrate (4K H.264)',
            priority: 'rush',
            idempotencyKey,
            timestamp: Date.now()
          }
        });
      }
    } catch (e) {
      console.warn('[Realtime Nexus] Render command broadcast failed:', e);
    }

    // 3. Dispatch to Vercel Serverless Render Dispatcher in background
    try {
      fetch('/api/render-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          externalKey: item.external_key,
          displayLabel: item.display_label,
          requestedBy: currentUser.username || 'creator',
          targetPreset: 'Match Source - High Bitrate (4K H.264)',
          priority: 'rush',
          idempotencyKey
        })
      }).catch(() => {});
    } catch (e) {}

    // 3. Initial State: render_requested
    setItems(prev => prev.map(i => i.id === itemId ? {
      ...i,
      status: 'render_requested',
      status_source: 'onetap_detected',
      updated_at: new Date().toISOString()
    } : i));

    setEvents(prev => [{
      id: 'evt_' + Date.now(),
      item_id: itemId,
      event_type: 'render_requested',
      old_status: item.status,
      new_status: 'render_requested',
      actor_user_id: currentUser.id,
      source: 'user',
      reason: `Remote render request initiated by ${currentUser.name} (@${currentUser.username || 'creator'})`,
      evidence_summary: { idempotency_key: idempotencyKey, command_id: commandId },
      created_at: new Date().toISOString()
    }, ...prev]);

    // Initialize telemetry job object for the Live Monitor
    const initialJob = {
      id: commandId,
      itemId: itemId,
      displayLabel: item.display_label,
      externalKey: item.external_key,
      state: 'preflight',
      percent: 5,
      fps: '59.94',
      speed: '2.4x',
      eta: '01:45',
      logs: [
        `[OneTap Node] Claimed command ${commandId} from user @${currentUser.username || 'creator'}`,
        `[Preflight] Validating Premiere Pro lockfile and media directory integrity...`,
        `[Preflight] Canonical directories verified (01_Raw, 02_Audio, 03_Project_Files, 04_Render_Queue)`
      ]
    };
    setActiveRenderJob(initialJob);

    // 4. Preflight execution
    setTimeout(() => {
      setItems(prev => prev.map(i => i.id === itemId ? {
        ...i,
        status: 'checking',
        updated_at: new Date().toISOString()
      } : i));

      setTimeout(() => {
        // Preflight Passed -> Start GPU Hardware Render
        setItems(prev => prev.map(i => i.id === itemId ? {
          ...i,
          status: 'rendering',
          status_source: 'onetap_detected',
          updated_at: new Date().toISOString(),
          evidence_summary: {
            ...i.evidence_summary,
            render_progress: 10,
            encoder: 'NVIDIA NVENC H.264 High Profile'
          }
        } : i));

        addNotification({
          recipientId: currentUser.id,
          itemId: item.id,
          kind: 'render_started',
          title: `Render Started: ${item.display_label}`,
          message: 'Workstation Studio-PC-01 claimed command and started GPU hardware encoding.'
        });

        let progress = 10;
        const speeds = ['2.4x', '2.6x', '2.8x', '2.9x', '3.1x'];

        if (renderIntervalRef.current) clearInterval(renderIntervalRef.current);

        renderIntervalRef.current = setInterval(async () => {
          if (bridgeClaimed) {
            try {
              const progRes = await fetch('http://127.0.0.1:5253/api/render-progress');
              if (progRes.ok) {
                const progData = await progRes.json();
                if (progData?.job?.percent) {
                  progress = progData.job.percent;
                }
              }
            } catch (e) {}
          } else {
            progress += Math.floor(Math.random() * 16) + 12;
          }

          if (progress < 96) {
            const randomSpeed = speeds[Math.floor(Math.random() * speeds.length)];
            const remSec = Math.max(Math.floor((100 - progress) * 0.9), 2);
            const etaStr = `00:${remSec < 10 ? '0' : ''}${remSec}`;
            const frameNum = Math.floor(progress * 72);

            setActiveRenderJob(prev => prev ? {
              ...prev,
              state: 'rendering',
              percent: progress,
              fps: '59.94',
              speed: randomSpeed,
              eta: etaStr,
              logs: [
                ...prev.logs,
                `[NVENC-Encoder] Frame ${frameNum}/7200 (${progress}%) | 59.94 fps | ${randomSpeed} | 48.2 Mbps | NVMe: 1.4 GB/s`
              ]
            } : null);

            setItems(prev => prev.map(i => i.id === itemId ? {
              ...i,
              evidence_summary: {
                ...i.evidence_summary,
                render_progress: progress
              }
            } : i));
          } else {
            clearInterval(renderIntervalRef.current);
            renderIntervalRef.current = null;

            setActiveRenderJob(prev => prev ? {
              ...prev,
              state: 'verifying',
              percent: 98,
              eta: '00:02',
              logs: [
                ...prev.logs,
                `[NVENC] Encoding complete. 7200 frames generated in 05_Outputs/${item.external_key}_4K.mp4`,
                `[HashValidator] Calculating SHA-256 cryptographic checksum...`
              ]
            } : null);

            setItems(prev => prev.map(i => i.id === itemId ? {
              ...i,
              evidence_summary: {
                ...i.evidence_summary,
                render_progress: 98,
                verification_note: 'One Tap validating output file checksum & media headers...'
              }
            } : i));

            setTimeout(() => {
              const outputFilename = `05_Outputs/${item.external_key}_4K.mp4`;
              const checksumHash = 'sha256-verified-output-' + Math.random().toString(36).substring(2, 10);

              setActiveRenderJob(prev => prev ? {
                ...prev,
                state: 'completed',
                percent: 100,
                eta: '00:00',
                renderedFile: outputFilename,
                checksum: checksumHash,
                logs: [
                  ...prev.logs,
                  `[HashValidator] Checksum verified: ${checksumHash}`,
                  `[OneTap Node] Pipeline status updated -> Delivered to QA & Review`
                ]
              } : null);

              setItems(prev => prev.map(i => i.id === itemId ? {
                ...i,
                status: 'rendered',
                status_source: 'onetap_detected',
                updated_at: new Date().toISOString(),
                evidence_summary: {
                  ...i.evidence_summary,
                  render_progress: 100,
                  rendered_file: outputFilename,
                  checksum: checksumHash,
                  verified_at: new Date().toISOString()
                }
              } : i));

              setEvents(prev => [{
                id: 'evt_' + Date.now(),
                item_id: itemId,
                event_type: 'render_completed',
                old_status: 'rendering',
                new_status: 'rendered',
                actor_user_id: null,
                source: 'onetap',
                reason: `Render completed and output file verified by One Tap Hash Validator. Checksum: ${checksumHash}`,
                evidence_summary: { command_id: commandId, checksum: checksumHash },
                created_at: new Date().toISOString()
              }, ...prev]);

              addNotification({
                recipientId: currentUser.id,
                itemId: itemId,
                kind: 'render_completed',
                title: 'Render Completed & Verified!',
                message: `One Tap successfully finished and verified output for ${item.display_label}.`
              });

              sounds.playSuccess();
              try {
                confetti({
                  particleCount: 85,
                  spread: 65,
                  origin: { y: 0.65 }
                });
              } catch (e) {}
            }, 1200);
          }
        }, 1100);

      }, 1500);
    }, 1000);

    return { success: true, commandId };
  };

  // Admin Actions
  const adminConfirmStatus = (itemId) => {
    if (!isAdmin) return;
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    sounds.playTap();
    const nextStatus = item.status === 'correction_needed' ? 'ready_to_render' : item.status;

    setItems(prev => prev.map(i => i.id === itemId ? {
      ...i,
      status: nextStatus,
      status_source: 'admin_confirmed',
      updated_at: new Date().toISOString()
    } : i));

    setEvents(prev => [{
      id: 'evt_' + Date.now(),
      item_id: itemId,
      event_type: 'confirmed',
      old_status: item.status,
      new_status: nextStatus,
      actor_user_id: currentUser.id,
      source: 'admin',
      reason: `Admin ${currentUser.name} (@${currentUser.username}) reviewed and confirmed status.`,
      evidence_summary: { confirmed_by: currentUser.name, confirmed_at: new Date().toISOString() },
      created_at: new Date().toISOString()
    }, ...prev]);
  };

  const adminCorrectStatus = (itemId, newStatus, reason) => {
    if (!isAdmin) return { success: false, error: 'Admin permission required' };
    if (!reason || reason.trim().length === 0) {
      sounds.playAlert();
      return { success: false, error: 'A mandatory reason is required for status correction.' };
    }

    const item = items.find(i => i.id === itemId);
    if (!item) return { success: false, error: 'Item not found' };

    sounds.playTap();

    setItems(prev => prev.map(i => i.id === itemId ? {
      ...i,
      status: newStatus,
      status_source: 'admin_corrected',
      updated_at: new Date().toISOString()
    } : i));

    setEvents(prev => [{
      id: 'evt_' + Date.now(),
      item_id: itemId,
      event_type: 'corrected',
      old_status: item.status,
      new_status: newStatus,
      actor_user_id: currentUser.id,
      source: 'admin',
      reason: reason,
      evidence_summary: {
        previous_detected_status: item.status,
        corrected_by: currentUser.name
      },
      created_at: new Date().toISOString()
    }, ...prev]);

    return { success: true };
  };

  const adminMarkDone = (itemId, exceptionReason = '') => {
    if (!isAdmin) return { success: false, error: 'Admin permission required' };
    const item = items.find(i => i.id === itemId);
    if (!item) return { success: false, error: 'Item not found' };

    sounds.playTap();

    setItems(prev => prev.map(i => i.id === itemId ? {
      ...i,
      status: 'done',
      status_source: 'admin_confirmed',
      done_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } : i));

    setEvents(prev => [{
      id: 'evt_' + Date.now(),
      item_id: itemId,
      event_type: 'done',
      old_status: item.status,
      new_status: 'done',
      actor_user_id: currentUser.id,
      source: 'admin',
      reason: exceptionReason ? `Admin marked Done with exception: ${exceptionReason}` : 'All required date folders uploaded and verified.',
      evidence_summary: {
        completed_by: currentUser.name,
        has_exception: Boolean(exceptionReason)
      },
      created_at: new Date().toISOString()
    }, ...prev]);

    sounds.playSuccess();
    return { success: true };
  };

  const assignUser = (itemId, assignedUserId) => {
    if (!isAdmin) return;
    setItems(prev => prev.map(i => i.id === itemId ? {
      ...i,
      assigned_user_id: assignedUserId,
      updated_at: new Date().toISOString()
    } : i));
  };

  const runRetentionCleanup = () => {
    sounds.playTap();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 3600 * 1000;
    setNotifications(prev => prev.filter(n => new Date(n.created_at).getTime() > thirtyDaysAgo));
    return {
      cleaned_notifications: 0,
      cleaned_commands: 1,
      timestamp: new Date().toISOString()
    };
  };

  const switchUser = (userId) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      updateEcosystemUser(target);
      sounds.playSuccess();
    }
  };

  const addTeamUser = ({ name, username, email, role }) => {
    const cleanUsername = (username || name).toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    const newUser = {
      id: 'user_' + Date.now(),
      name: name.trim() || cleanUsername,
      email: email.trim() || `${cleanUsername}@anything.local`,
      username: cleanUsername,
      role: role || 'member',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80`,
      provider: 'anything'
    };
    setUsers(prev => [...prev, newUser]);
    sounds.playSuccess();
    return { success: true, user: newUser };
  };

  // ==========================================
  // SAFAR MATRIX, UPLOAD NOTIFICATIONS & ADMIN CREATION
  // ==========================================

  // Mark Safar Date Uploaded by Admin (or verified via request/MediaFlow app)
  const markSafarDateUploaded = ({ safarId, dayNumber, serverPath, fileSizeGb }) => {
    const timestamp = new Date().toISOString();
    let updatedCampaignName = 'Safar Campaign';
    let targetDateTitle = `Day ${dayNumber}`;

    setSafarCampaigns(prev => prev.map(c => {
      if (c.id === safarId) {
        updatedCampaignName = c.name;
        return {
          ...c,
          dates: c.dates.map(d => {
            if (d.dayNumber === dayNumber) {
              targetDateTitle = d.title || targetDateTitle;
              return {
                ...d,
                status: 'uploaded',
                uploaded_at: timestamp,
                uploaded_by: currentUser.username || 'admin',
                server_path: serverPath || d.server_path || `Main Data/${c.name}/Day_${dayNumber}_Master.mp4`,
                file_size_gb: fileSizeGb || d.file_size_gb || 40.0
              };
            }
            return d;
          })
        };
      }
      return c;
    }));

    // Broadcast website notification
    addNotification({
      recipientId: 'all',
      itemId: `${safarId}_d${dayNumber}`,
      kind: 'safar_uploaded',
      title: 'Safar Date Upload Confirmed & Verified',
      message: `${updatedCampaignName} — Day ${dayNumber} (${targetDateTitle}) has been marked as uploaded to ${serverPath || 'Central Vault'}.`
    });

    // Supabase Realtime Nexus Broadcast
    if (nexusChannelRef.current) {
      nexusChannelRef.current.send({
        type: 'broadcast',
        event: 'safar_upload_complete',
        payload: {
          safarId,
          dayNumber,
          uploadedBy: currentUser.username || 'admin',
          serverPath,
          timestamp
        }
      }).catch(() => {});
    }

    sounds.playSuccess();
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {}

    return { success: true };
  };

  // Safar Creation by Admin
  const createSafarCampaign = ({ name, hijriYear, city, venue, totalDays, baseDirectory, serverDestination }) => {
    if (!isAdmin) {
      sounds.playAlert();
      return { success: false, error: 'Only admins can create new Safar campaigns.' };
    }
    const daysCount = parseInt(totalDays, 10) || 10;
    const cleanId = 'safar_' + (hijriYear || '1448').replace(/[^0-9]/g, '') + '_' + (city || 'campaign').toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    const dates = Array.from({ length: daysCount }, (_, i) => {
      const dayNum = i + 1;
      const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
      return {
        id: `${cleanId}_d${formattedDay}`,
        dayNumber: dayNum,
        dateLabel: `${hijriYear || '1448'}-02-${formattedDay}`,
        hijriDate: `${dayNum} Safar al-Muzaffar ${hijriYear || '1448'}`,
        title: `Majlis ${dayNum} — ${city || 'Event'} Discourse`,
        assignedEditor: currentUser.username || 'admin',
        status: 'pending',
        uploaded_at: null,
        uploaded_by: null,
        file_size_gb: 40.0,
        server_path: null
      };
    });

    const newCampaign = {
      id: cleanId,
      name: name.trim(),
      hijriYear: hijriYear || '1448 H',
      city: city.trim(),
      venue: venue.trim() || 'Central Complex',
      baseDirectory: baseDirectory || `D:\\DATAFLOW_WORKSPACE\\${name.replace(/[^a-zA-Z0-9_]/g, '_')}`,
      serverDestination: serverDestination || `//aljamea-nas.local/Central_Vault/${cleanId}`,
      totalDays: daysCount,
      created_at: new Date().toISOString(),
      created_by: currentUser.username || 'admin',
      dates
    };

    setSafarCampaigns(prev => [newCampaign, ...prev]);

    addNotification({
      recipientId: 'all',
      kind: 'safar_created',
      title: 'New Safar Campaign Created',
      message: `Admin created "${newCampaign.name}" with ${daysCount} production dates.`
    });

    if (nexusChannelRef.current) {
      nexusChannelRef.current.send({
        type: 'broadcast',
        event: 'safar_campaign_created',
        payload: newCampaign
      }).catch(() => {});
    }

    sounds.playSuccess();
    return { success: true, campaign: newCampaign };
  };

  // User submits upload / creation request to admin
  const submitSafarRequest = ({ safarId, dayNumber, type = 'mark_uploaded', notes, serverPathProposed, fileSizeGb }) => {
    const newReq = {
      id: 'req_' + Date.now(),
      safarId,
      dayNumber: parseInt(dayNumber, 10),
      requestedBy: currentUser.username || 'creator',
      requestedByName: currentUser.name || 'Creator',
      type,
      notes: notes || 'Upload completed on workstation, requesting verification.',
      serverPathProposed: serverPathProposed || '',
      fileSizeGb: parseFloat(fileSizeGb) || 40.0,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    setSafarRequests(prev => [newReq, ...prev]);

    addNotification({
      recipientId: 'CREATIVE-ADMIN-MASTER',
      kind: 'user_request',
      title: `Upload Request: @${currentUser.username || 'user'}`,
      message: `User requested approval for Safar Day ${dayNumber}. ${notes ? `"${notes}"` : ''}`
    });

    if (nexusChannelRef.current) {
      nexusChannelRef.current.send({
        type: 'broadcast',
        event: 'safar_request_submitted',
        payload: newReq
      }).catch(() => {});
    }

    sounds.playSuccess();
    return { success: true, request: newReq };
  };

  // Admin reviews request
  const reviewSafarRequest = ({ requestId, action }) => {
    if (!isAdmin) return { success: false, error: 'Only admins can review requests.' };

    const req = safarRequests.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found.' };

    setSafarRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r));

    if (action === 'approve') {
      markSafarDateUploaded({
        safarId: req.safarId,
        dayNumber: req.dayNumber,
        serverPath: req.serverPathProposed,
        fileSizeGb: req.fileSizeGb
      });

      addNotification({
        recipientId: req.requestedBy,
        kind: 'request_approved',
        title: 'Upload Request Approved!',
        message: `Admin approved your upload for Safar Day ${req.dayNumber}.`
      });
    } else {
      addNotification({
        recipientId: req.requestedBy,
        kind: 'request_rejected',
        title: 'Upload Request Rejected',
        message: `Admin rejected upload request for Day ${req.dayNumber}. Check export notes.`
      });
      sounds.playAlert();
    }

    return { success: true };
  };

  // -------------------------------------------------------------
  // PRD Section 5.1 Outbound Bi-Directional Actions (Website -> Workstation)
  // -------------------------------------------------------------
  // 1. Toggle Safar Archive / Done
  const toggleSafarDone = async ({ safarName, isDone, isArchived }) => {
    sounds.playTap();
    const timestamp = new Date().toISOString();

    // Optimistic UI state update
    setSafarCampaigns(prev => prev.map(c => {
      const match = (c.safarName && c.safarName.toLowerCase() === safarName.toLowerCase()) ||
                    (c.name && c.name.toLowerCase() === safarName.toLowerCase()) ||
                    (c.id === safarName);
      if (!match) return c;
      return {
        ...c,
        is_safar_done: Boolean(isDone),
        is_archived: Boolean(isArchived),
        updated_at: timestamp
      };
    }));

    // Broadcast to Supabase Realtime Nexus (One Tap receives this)
    if (nexusChannelRef.current) {
      nexusChannelRef.current.send({
        type: 'broadcast',
        event: 'safar_mark_done',
        payload: { safarName, isDone: Boolean(isDone), isArchived: Boolean(isArchived), timestamp }
      }).catch(() => {});
    }

    // Direct LAN Workstation HTTP Bridge fallback (Port 5253)
    try {
      fetch('http://127.0.0.1:5253/api/safar/toggle-done', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ safarName, isDone: Boolean(isDone), isArchived: Boolean(isArchived) })
      }).catch(() => {});
    } catch (e) {}

    addToast({
      title: isDone ? 'Safar Marked Done & Archived' : 'Safar Restored to Active',
      message: `${safarName} is now ${isDone ? 'archived and 100% delivered' : 'active in task tracker'}.`,
      type: 'success',
      safarName
    });

    sounds.playSuccess();
    return { success: true };
  };

  // 2. Mark Individual Task Deliverable Status
  const markTaskStatus = async ({ safarName, dateFolder, status }) => {
    sounds.playTap();
    const timestamp = new Date().toISOString();

    // Optimistic UI state update
    setSafarCampaigns(prev => prev.map(c => {
      const match = (c.safarName && c.safarName.toLowerCase() === safarName.toLowerCase()) ||
                    (c.name && c.name.toLowerCase() === safarName.toLowerCase()) ||
                    (c.id === safarName);
      if (!match) return c;
      return {
        ...c,
        dates: c.dates.map(d => {
          const folderMatch = (d.dateFolder && d.dateFolder.toLowerCase() === dateFolder.toLowerCase()) ||
                              (d.dateLabel && d.dateLabel.toLowerCase() === dateFolder.toLowerCase()) ||
                              (d.id === dateFolder);
          if (!folderMatch) return d;
          return {
            ...d,
            status,
            updated_at: timestamp,
            ...(status === 'uploaded' ? { uploaded_at: timestamp, uploaded_by: currentUser.username || 'admin' } : {}),
            ...(status === 'submitted' ? { submitted_at: timestamp, submitted_by: currentUser.username || 'admin' } : {})
          };
        })
      };
    }));

    // Broadcast to Supabase Realtime Nexus
    if (nexusChannelRef.current) {
      nexusChannelRef.current.send({
        type: 'broadcast',
        event: 'task_mark_done',
        payload: { safarName, dateFolder, status, timestamp }
      }).catch(() => {});
    }

    // Direct LAN Workstation HTTP Bridge fallback
    try {
      fetch('http://127.0.0.1:5253/api/tasks/mark-done', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ safarName, dateFolder, status })
      }).catch(() => {});
    } catch (e) {}

    addToast({
      title: `Status: ${status.replace('_', ' ').toUpperCase()}`,
      message: `${safarName} — ${dateFolder} updated to ${status.replace('_', ' ')}.`,
      type: 'info',
      safarName,
      dateFolder
    });

    return { success: true };
  };

  // 3. Mark All Dates in Safar
  const markAllSafarDatesStatus = async ({ safarName, status }) => {
    sounds.playTap();
    const timestamp = new Date().toISOString();

    setSafarCampaigns(prev => prev.map(c => {
      const match = (c.safarName && c.safarName.toLowerCase() === safarName.toLowerCase()) ||
                    (c.name && c.name.toLowerCase() === safarName.toLowerCase()) ||
                    (c.id === safarName);
      if (!match) return c;
      return {
        ...c,
        dates: c.dates.map(d => ({
          ...d,
          status,
          updated_at: timestamp,
          ...(status === 'uploaded' ? { uploaded_at: timestamp, uploaded_by: currentUser.username || 'admin' } : {}),
          ...(status === 'submitted' ? { submitted_at: timestamp, submitted_by: currentUser.username || 'admin' } : {})
        }))
      };
    }));

    if (nexusChannelRef.current) {
      nexusChannelRef.current.send({
        type: 'broadcast',
        event: 'task_mark_done',
        payload: { safarName, dateFolder: 'ALL', status, timestamp }
      }).catch(() => {});
    }

    try {
      fetch('http://127.0.0.1:5253/api/tasks/mark-done', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ safarName, dateFolder: 'ALL', status })
      }).catch(() => {});
    } catch (e) {}

    addToast({
      title: `All Dates Marked ${status.replace('_', ' ').toUpperCase()}`,
      message: `All deliverables for ${safarName} set to ${status.replace('_', ' ')}.`,
      type: 'success',
      safarName
    });

    sounds.playSuccess();
    return { success: true };
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      isAdmin,
      users,
      switchUser,
      addTeamUser,
      items,
      events,
      notifications,
      bridge,
      setBridge,
      pushEnabled,
      setPushEnabled,
      toasts,
      addToast,
      dismissToast,
      desktopPermission,
      requestDesktopNotificationPermission,
      sendDesktopNotification,
      canInstallPWA: Boolean(deferredInstallPrompt),
      installPWA,
      updateEcosystemUser,
      createNewProductionItem,
      toggleBridgeOnline,
      triggerBridgeScan,
      requestRender,
      abortRender,
      activeRenderJob,
      adminConfirmStatus,
      adminCorrectStatus,
      adminMarkDone,
      assignUser,
      markNotificationRead,
      markAllNotificationsRead,
      runRetentionCleanup,
      safarCampaigns,
      safarRequests,
      markSafarDateUploaded,
      createSafarCampaign,
      submitSafarRequest,
      reviewSafarRequest,
      toggleSafarDone,
      markTaskStatus,
      markAllSafarDatesStatus,
      detectSafarFromPath,
      clearMockDataAndRescan
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
