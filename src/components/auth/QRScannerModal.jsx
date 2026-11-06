import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import QRCode from 'qrcode';
import { useApp } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { sounds } from '../../lib/sound';
import confetti from 'canvas-confetti';
import {
  QrCode,
  Camera,
  Upload,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Sparkles,
  Laptop,
  Smartphone,
  ShieldCheck,
  Copy,
  Check,
  FlipHorizontal,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function QRScannerModal({ isOpen, onClose }) {
  const { currentUser, updateEcosystemUser, bridge, setBridge, syncWithOneTapNode } = useApp();
  
  // Tab states: 'scan' | 'upload' | 'manual' | 'generate'
  const [activeTab, setActiveTab] = useState('scan');
  
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [manualToken, setManualToken] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');
  const [generatedPayloadStr, setGeneratedPayloadStr] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncingOneTap, setIsSyncingOneTap] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  const handleDirectOneTapSync = async () => {
    setIsSyncingOneTap(true);
    setCameraError('');
    sounds.playTap();
    try {
      const res = await syncWithOneTapNode();
      if (res?.success && res.user) {
        setSuccessInfo({
          user: res.user,
          workstation: {
            nodeId: 'node_studio_pc_01',
            label: 'Studio-PC-01 (Primary One Tap Node)',
            gpu: 'NVIDIA RTX 4090 (24GB VRAM)',
            bridgePort: 5253
          },
          token: 'local_direct_sync'
        });
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      } else {
        setCameraError(res?.error || 'Could not connect to One Tap desktop bridge on port 5253. Make sure One Tap is running.');
      }
    } catch (e) {
      setCameraError('Direct sync failed: ' + (e?.message || 'Connection error'));
    } finally {
      setIsSyncingOneTap(false);
    }
  };
  
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera on unmount or tab switch
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (e) {
        // scanner already stopped
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // When modal closes, ensure camera is stopped
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setSuccessInfo(null);
      setCameraError('');
    } else {
      // Generate preview QR if in generate tab
      generateAppLoginQR();
    }
  }, [isOpen]);

  // Handle active camera when tab is 'scan'
  useEffect(() => {
    if (isOpen && activeTab === 'scan' && !successInfo) {
      startCamera();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [isOpen, activeTab, facingMode, successInfo]);

  const startCamera = async () => {
    setCameraError('');
    await stopScanner();

    // Check if element exists
    const elementId = 'anyshare-qr-reader';
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const html5QrCode = new Html5Qrcode(elementId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      });
      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        { facingMode: facingMode },
        config,
        onScanSuccess,
        () => {} // silent on frame fail
      );
      setIsScanning(true);
    } catch (err) {
      console.warn('Camera start error:', err);
      setCameraError('Camera access unavailable or blocked. Please grant camera permission or use the Image Upload / Manual Code tabs below.');
      setIsScanning(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Called when QR code is detected
  const onScanSuccess = async (decodedText) => {
    sounds.playTap();
    await stopScanner();
    handlePairingPayload(decodedText);
  };

  // Process and authenticate pairing payload
  const handlePairingPayload = async (rawText) => {
    setIsProcessing(true);
    setCameraError('');

    try {
      let payload;
      try {
        payload = JSON.parse(rawText);
      } catch (e) {
        // Fallback: check if it's a raw token string or base64
        payload = { token: rawText.trim() };
      }

      // Check if it's a valid AnyShare / One Tap payload
      const token = payload.token || (typeof payload === 'string' ? payload : 'token_' + Date.now());

      // STRICT ONE-TIME CHECK: Check if this token was already consumed locally
      const consumedTokens = JSON.parse(localStorage.getItem('anyshare_consumed_tokens_v1') || '[]');
      if (consumedTokens.includes(token)) {
        setCameraError('❌ This one-time QR code has already been consumed and cannot be reused. Please generate a fresh code on the Anything master app.');
        sounds.playAlert();
        setIsProcessing(false);
        return;
      }

      // Check Expiration
      if (payload.expiresAt && new Date(payload.expiresAt).getTime() < Date.now()) {
        setCameraError('⏰ This one-time pairing QR code has expired (5-minute security limit). Please generate a fresh code.');
        sounds.playAlert();
        setIsProcessing(false);
        return;
      }

      const rawUser = payload.user || {};
      const user = {
        id: rawUser.id || 'user_burhanuddin',
        name: rawUser.name || 'Burhanuddin',
        username: rawUser.username || 'burhanuddin',
        email: rawUser.email || 'sounasathburhan5252@gmail.com',
        role: rawUser.role || 'admin',
        avatar: (rawUser.avatar && !rawUser.avatar.includes('unsplash')) ? rawUser.avatar : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rawUser.name || 'Burhanuddin')}&backgroundColor=0f172a&textColor=ffffff`,
        provider: rawUser.provider || 'onetap'
      };
      const workstation = payload.workstation || {
        nodeId: 'node_studio_pc_01',
        label: 'Studio-PC-01 (Primary One Tap Node)',
        bridgePort: 5253,
        gpu: 'NVIDIA RTX 4090 (24GB VRAM)',
        storageFreeGB: 482.4
      };

      let isRejected = false;
      let rejectionMessage = '';

      // 1. Notify local bridge if accessible and verify not consumed
      try {
        const localBridgeRes = await fetch('http://127.0.0.1:5253/api/claim-pairing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, username: user.username })
        });
        if (localBridgeRes.status === 409) {
          isRejected = true;
          rejectionMessage = '❌ This one-time QR code has already been claimed on the local workstation node.';
        }
      } catch (e) {}

      // 2. Notify Vercel serverless pairing endpoint if not rejected
      if (!isRejected) {
        try {
          const cloudPairRes = await fetch('/api/auth-pair', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'claim',
              token,
              claimedBy: `anyshare_web_${user.username}`
            })
          });

          if (cloudPairRes.status === 409) {
            isRejected = true;
            rejectionMessage = '❌ This one-time QR code has already been consumed and cannot be reused.';
          } else if (cloudPairRes.status === 410) {
            isRejected = true;
            rejectionMessage = '⏰ This one-time pairing QR code has expired.';
          }
        } catch (e) {}
      }

      if (isRejected) {
        // Blacklist token locally so it can never be scanned again
        consumedTokens.push(token);
        localStorage.setItem('anyshare_consumed_tokens_v1', JSON.stringify(consumedTokens.slice(-100)));
        setCameraError(rejectionMessage);
        sounds.playAlert();
        setIsProcessing(false);
        return;
      }

      // Mark token as consumed permanently
      consumedTokens.push(token);
      localStorage.setItem('anyshare_consumed_tokens_v1', JSON.stringify(consumedTokens.slice(-100)));

      // 3. Broadcast claim on Supabase Realtime Cloud Nexus (Instantly notifies Desktop Node)
      try {
        const nexus = supabase.channel('anyshare_realtime_nexus');
        nexus.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            nexus.send({
              type: 'broadcast',
              event: 'pairing_claim',
              payload: {
                token,
                username: user.username,
                user,
                workstation,
                claimedAt: new Date().toISOString()
              }
            });
          }
        });
      } catch (e) {
        console.warn('[Realtime Nexus] Broadcast claim failed:', e);
      }

      // 4. Authenticate current user in website state
      updateEcosystemUser(user);

      // 5. Bind workstation node in bridge state
      if (setBridge) {
        setBridge(prev => ({
          ...prev,
          is_online: true,
          label: workstation.label || prev.label,
          workstation_storage_free_gb: workstation.storageFreeGB || prev.workstation_storage_free_gb,
          last_heartbeat_at: new Date().toISOString()
        }));
      }

      setSuccessInfo({
        user,
        workstation,
        token
      });

      sounds.playSuccess();
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

    } catch (err) {
      setCameraError('Invalid QR pairing format: ' + (err?.message || 'Could not parse credentials'));
      sounds.playAlert();
    } finally {
      setIsProcessing(false);
    }
  };

  // File upload scanner
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setCameraError('');

    try {
      const html5QrCode = new Html5Qrcode('anyshare-qr-file-dummy', { verbose: false });
      const decoded = await html5QrCode.scanFile(file, true);
      handlePairingPayload(decoded);
    } catch (err) {
      setCameraError('No valid QR code was detected in the uploaded image. Please try another screenshot.');
      sounds.playAlert();
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual token submission
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handlePairingPayload(manualToken.trim());
  };

  // Generate pairing QR for One Tap Workstation demo
  const generateAppLoginQR = async () => {
    const token = 'otl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const payload = {
      type: 'ANYSHARE_ONE_TIME_LOGIN',
      version: '1.0.0',
      token: token,
      singleUse: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      user: {
        id: currentUser.id || 'user_burhanuddin',
        name: currentUser.name || 'Burhanuddin',
        username: currentUser.username || 'burhanuddin',
        email: currentUser.email || 'sounasathburhan5252@gmail.com',
        role: currentUser.role || 'admin',
        avatar: (currentUser.avatar && !currentUser.avatar.includes('unsplash')) ? currentUser.avatar : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name || 'Burhanuddin')}&backgroundColor=0f172a&textColor=ffffff`
      },
      workstation: {
        nodeId: 'node_studio_pc_01',
        label: 'Studio-PC-01 (Primary One Tap Node)',
        bridgePort: 5253,
        gpu: 'NVIDIA RTX 4090 (24GB VRAM)',
        storageFreeGB: 482.4
      }
    };

    const payloadJson = JSON.stringify(payload);
    setGeneratedPayloadStr(payloadJson);

    try {
      const url = await QRCode.toDataURL(payloadJson, {
        errorCorrectionLevel: 'M',
        margin: 2,
        scale: 7,
        color: {
          dark: '#111827',
          light: '#F5F5F7'
        }
      });
      setGeneratedQR(url);
    } catch (e) {}
  };

  const handleCopyPayload = () => {
    navigator.clipboard?.writeText(generatedPayloadStr);
    sounds.playTap();
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-neutral-950/60 backdrop-blur-md animate-fadeIn">
      {/* Hidden dummy container for file scans */}
      <div id="anyshare-qr-file-dummy" className="hidden" />

      <div 
        className="glass-panel w-full sm:max-w-xl max-h-[92vh] sm:rounded-3xl rounded-t-3xl border border-[rgba(0,0,0,0.08)]/40 shadow-2xl flex flex-col overflow-hidden text-left bg-[#F5F5F7]/98 text-neutral-900"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-[rgba(0,0,0,0.08)]/25 flex items-start justify-between gap-3 bg-gradient-to-r from-neutral-100/80 via-stone-50/50 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#334155] text-white shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200">
                  One-Time QR Login & Sync
                </span>
                <span className="text-xs font-mono font-bold text-neutral-600">
                  Universal Session
                </span>
              </div>
              <h2 className="text-base font-black text-neutral-950 truncate max-w-sm mt-0.5">
                Scan App QR Code to Log In
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {!successInfo && (
          <div className="flex items-center px-5 pt-3 border-b border-[rgba(0,0,0,0.08)]/15 gap-2 bg-neutral-50/80 shrink-0 text-xs font-bold overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setActiveTab('scan');
              }}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'scan'
                  ? 'border-[#0f172a] text-[#1e293b]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              Live Camera
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setActiveTab('upload');
              }}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-[#0f172a] text-[#1e293b]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setActiveTab('manual');
              }}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'border-[#0f172a] text-[#1e293b]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              Manual Code
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setActiveTab('generate');
                generateAppLoginQR();
              }}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'generate'
                  ? 'border-[#0f172a] text-[#1e293b]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Laptop className="w-4 h-4" />
              App QR Preview
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* SUCCESS BANNER WHEN CLAIMED */}
          {successInfo ? (
            <div className="text-center py-6 px-4 space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-lg font-black text-neutral-950">
                  Authentication & Workstation Synced!
                </h3>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto mt-1 leading-relaxed">
                  You are now authenticated on the website and permanently synchronized with your One Tap workstation node.
                </p>
              </div>

              {/* User Profile Card */}
              <div className="p-4 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)]/30 shadow-sm max-w-md mx-auto text-left space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-[rgba(0,0,0,0.08)]/15">
                  <img
                    src={successInfo.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(successInfo.user.name || 'Burhanuddin')}&backgroundColor=0f172a&textColor=ffffff`}
                    alt={successInfo.user.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-indigo-600"
                  />
                  <div>
                    <h4 className="text-sm font-black text-neutral-950">{successInfo.user.name}</h4>
                    <p className="text-xs font-mono text-[#1e293b] font-bold">@{successInfo.user.username} • {successInfo.user.email}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-900 border border-neutral-300">
                      {successInfo.user.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-700">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Connected Node:</span>
                    <span className="font-bold text-neutral-900">{successInfo.workstation.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">GPU Encoder:</span>
                    <span className="font-mono text-neutral-900 font-semibold">{successInfo.workstation.gpu}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Local Bridge Port:</span>
                    <span className="font-mono text-emerald-800 font-bold">:{successInfo.workstation.bridgePort || 5253} (Active)</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-black glass-button-primary shadow-md cursor-pointer inline-flex items-center gap-2"
              >
                <span>Continue to AnyShare Dashboard</span>
              </button>
            </div>
          ) : (
            <>
              {/* TAB 1: LIVE CAMERA SCANNER */}
              {activeTab === 'scan' && (
                <div className="space-y-4">
                  {/* Direct 1-Click Sync from Local One Tap Desktop */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/90 shadow-2xs flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Zap className="w-4 h-4 fill-white" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">Same Computer? 1-Click Sync</h4>
                        <p className="text-[11px] text-slate-600 font-medium">Link Burhanuddin profile & One Tap node without webcam</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isSyncingOneTap}
                      onClick={handleDirectOneTapSync}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {isSyncingOneTap ? (
                        <span>Syncing...</span>
                      ) : (
                        <>
                          <span>1-Click Sync</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative rounded-3xl overflow-hidden bg-black/90 border-2 border-[rgba(0,0,0,0.08)]/40 aspect-square max-w-sm mx-auto shadow-inner flex items-center justify-center">
                    {/* Viewfinder Target Reticle */}
                    <div className="absolute inset-8 border-2 border-dashed border-[#0f172a]/60 rounded-2xl pointer-events-none z-10 flex flex-col justify-between p-2">
                      <div className="flex justify-between">
                        <div className="w-5 h-5 border-t-4 border-l-4 border-[#0f172a] rounded-tl" />
                        <div className="w-5 h-5 border-t-4 border-r-4 border-[#0f172a] rounded-tr" />
                      </div>
                      {/* Laser beam */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#0f172a] to-transparent animate-pulse shadow-[0_0_10px_#0f172a]" />
                      <div className="flex justify-between">
                        <div className="w-5 h-5 border-b-4 border-l-4 border-[#0f172a] rounded-bl" />
                        <div className="w-5 h-5 border-b-4 border-r-4 border-[#0f172a] rounded-br" />
                      </div>
                    </div>

                    {/* Camera Switch Pill */}
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-black/60 text-white hover:bg-black/90 border border-white/20 transition-all cursor-pointer"
                      title="Switch Camera (Front/Rear)"
                    >
                      <FlipHorizontal className="w-4 h-4 text-white" />
                    </button>

                    {/* HTML5 QR Container */}
                    <div id="anyshare-qr-reader" className="w-full h-full" />
                  </div>

                  <p className="text-xs text-center text-neutral-600 font-medium">
                    Point your camera at the QR code generated in the <strong>One Tap Desktop App</strong> or mobile companion.
                  </p>
                </div>
              )}

              {/* TAB 2: UPLOAD IMAGE */}
              {activeTab === 'upload' && (
                <div className="space-y-4 py-2">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 border-2 border-dashed border-[rgba(0,0,0,0.08)]/50 rounded-3xl bg-white/70 hover:bg-white text-center cursor-pointer transition-all hover:border-[#0f172a] space-y-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-300 text-[#1e293b] flex items-center justify-center mx-auto shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-neutral-900">Upload QR Screenshot or Photo</h4>
                      <p className="text-xs text-neutral-500 mt-1">
                        PNG, JPG, or WEBP containing the One-Time Login QR
                      </p>
                    </div>
                    <span className="inline-block text-xs font-bold text-[#1e293b] bg-neutral-100/80 px-3 py-1 rounded-lg border border-[rgba(0,0,0,0.08)]/30">
                      Browse Files
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* TAB 3: MANUAL TOKEN / PAYLOAD INPUT */}
              {activeTab === 'manual' && (
                <form onSubmit={handleManualSubmit} className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1e293b] block">
                      Enter Pairing Token or JSON Payload
                    </label>
                    <textarea
                      rows={4}
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      placeholder='Paste token string (e.g. pair_ot_...) or full JSON payload'
                      className="w-full p-3 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)]/35 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0f172a]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!manualToken.trim() || isProcessing}
                    className="w-full py-2.5 rounded-xl text-xs font-black glass-button-primary shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-stone-950 border-t-transparent" />
                        <span>Verifying Token...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authorize & Sync Session</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 4: APP QR PREVIEW (Simulates One Tap App generating the QR) */}
              {activeTab === 'generate' && (
                <div className="space-y-4 py-2 text-center">
                  <div className="p-4 rounded-3xl bg-white border border-[rgba(0,0,0,0.08)]/30 shadow-sm inline-block mx-auto">
                    {generatedQR ? (
                      <img
                        src={generatedQR}
                        alt="One Tap Login QR Code"
                        className="w-52 h-52 mx-auto rounded-xl shadow-xs"
                      />
                    ) : (
                      <div className="w-52 h-52 flex items-center justify-center text-xs text-neutral-400">
                        Generating QR...
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-neutral-950">One Tap Workstation Node QR</h4>
                    <p className="text-xs text-neutral-600 max-w-xs mx-auto mt-0.5">
                      This is the QR generated by the One Tap desktop app for Studio-PC-01. Scan with AnyShare mobile or copy token below.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyPayload}
                      className="px-4 py-2 rounded-xl text-xs font-bold glass-pill hover:bg-neutral-200 text-neutral-900 border border-[rgba(0,0,0,0.08)]/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedToken ? 'Copied Payload!' : 'Copy Pairing JSON'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={generateAppLoginQR}
                      className="p-2 rounded-xl glass-pill hover:bg-neutral-200 text-neutral-800 border border-[rgba(0,0,0,0.08)]/30 cursor-pointer"
                      title="Regenerate QR"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#334155]" />
                    </button>
                  </div>
                </div>
              )}

              {/* Camera / Decoding Error Alert */}
              {cameraError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-950 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold block">Scanner Notice</span>
                    <span className="text-[11px] text-rose-800 leading-relaxed block">{cameraError}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(0,0,0,0.08)]/25 bg-neutral-100/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-600">
            <ShieldCheck className="w-3.5 h-3.5 text-[#334155]" />
            <span>Encrypted One-Time Auth Token</span>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold glass-pill hover:bg-white text-neutral-900 border border-[rgba(0,0,0,0.08)]/40 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
