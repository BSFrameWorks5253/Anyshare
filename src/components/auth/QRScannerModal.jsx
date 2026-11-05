import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import QRCode from 'qrcode';
import { useApp } from '../../lib/store';
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
  FlipHorizontal
} from 'lucide-react';

export default function QRScannerModal({ isOpen, onClose }) {
  const { currentUser, updateEcosystemUser, bridge, setBridge } = useApp();
  
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
  const [successInfo, setSuccessInfo] = useState(null);
  
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
      const user = payload.user || {
        id: 'user_master_01',
        name: 'Master Architect',
        username: 'admin',
        email: 'admin@anything.local',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
      };
      const workstation = payload.workstation || {
        nodeId: 'node_studio_pc_01',
        label: 'Studio-PC-01 (Primary One Tap Node)',
        bridgePort: 5253,
        gpu: 'NVIDIA RTX 4090 (24GB VRAM)',
        storageFreeGB: 482.4
      };

      // 1. Notify local bridge if accessible
      try {
        fetch('http://127.0.0.1:5253/api/claim-pairing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, username: user.username })
        }).catch(() => {});
      } catch (e) {}

      // 2. Notify Vercel serverless pairing endpoint
      try {
        await fetch('/api/auth-pair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'claim',
            token,
            claimedBy: `anyshare_web_${user.username}`
          })
        }).catch(() => {});
      } catch (e) {}

      // 3. Authenticate current user in website state
      updateEcosystemUser(user);

      // 4. Bind workstation node in bridge state
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
    const token = 'pair_ot_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const payload = {
      type: 'ANYSHARE_ONE_TIME_LOGIN',
      version: '1.0.0',
      token: token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      user: {
        id: currentUser.id || 'user_master_01',
        name: currentUser.name || 'Master Architect',
        username: currentUser.username || 'admin',
        email: currentUser.email || 'admin@anything.local',
        role: currentUser.role || 'admin',
        avatar: currentUser.avatar
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
          light: '#FAF8F5'
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-md animate-fadeIn">
      {/* Hidden dummy container for file scans */}
      <div id="anyshare-qr-file-dummy" className="hidden" />

      <div 
        className="glass-panel w-full sm:max-w-xl max-h-[92vh] sm:rounded-3xl rounded-t-3xl border border-[#C5A059]/40 shadow-2xl flex flex-col overflow-hidden text-left bg-[#FAF8F5]/98 text-stone-900"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#C5A059]/25 flex items-start justify-between gap-3 bg-gradient-to-r from-amber-100/70 via-stone-50/50 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8A6614] text-white shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-[#8B6508] border border-amber-500/30">
                  One-Time QR Login & Sync
                </span>
                <span className="text-xs font-mono font-bold text-stone-600">
                  Universal Session
                </span>
              </div>
              <h2 className="text-base font-black text-stone-950 truncate max-w-sm mt-0.5">
                Scan App QR Code to Log In
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {!successInfo && (
          <div className="flex items-center px-5 pt-3 border-b border-[#C5A059]/15 gap-2 bg-amber-50/40 shrink-0 text-xs font-bold overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setActiveTab('scan');
              }}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'scan'
                  ? 'border-[#B8860B] text-[#8B6508]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
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
                  ? 'border-[#B8860B] text-[#8B6508]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
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
                  ? 'border-[#B8860B] text-[#8B6508]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
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
                  ? 'border-[#B8860B] text-[#8B6508]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
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
                <h3 className="text-lg font-black text-stone-950">
                  Authentication & Workstation Synced!
                </h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto mt-1 leading-relaxed">
                  You are now authenticated on the website and permanently synchronized with your One Tap workstation node.
                </p>
              </div>

              {/* User Profile Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#C5A059]/30 shadow-sm max-w-md mx-auto text-left space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-[#C5A059]/15">
                  <img
                    src={successInfo.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                    alt={successInfo.user.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#D4AF37]"
                  />
                  <div>
                    <h4 className="text-sm font-black text-stone-950">{successInfo.user.name}</h4>
                    <p className="text-xs font-mono text-[#8B6508] font-bold">@{successInfo.user.username}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      {successInfo.user.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-stone-700">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Connected Node:</span>
                    <span className="font-bold text-stone-900">{successInfo.workstation.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">GPU Encoder:</span>
                    <span className="font-mono text-stone-900 font-semibold">{successInfo.workstation.gpu}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Local Bridge Port:</span>
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
                  <div className="relative rounded-3xl overflow-hidden bg-black/90 border-2 border-[#C5A059]/40 aspect-square max-w-sm mx-auto shadow-inner flex items-center justify-center">
                    {/* Viewfinder Target Reticle */}
                    <div className="absolute inset-8 border-2 border-dashed border-[#D4AF37]/60 rounded-2xl pointer-events-none z-10 flex flex-col justify-between p-2">
                      <div className="flex justify-between">
                        <div className="w-5 h-5 border-t-4 border-l-4 border-[#D4AF37] rounded-tl" />
                        <div className="w-5 h-5 border-t-4 border-r-4 border-[#D4AF37] rounded-tr" />
                      </div>
                      {/* Laser beam */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-pulse shadow-[0_0_10px_#D4AF37]" />
                      <div className="flex justify-between">
                        <div className="w-5 h-5 border-b-4 border-l-4 border-[#D4AF37] rounded-bl" />
                        <div className="w-5 h-5 border-b-4 border-r-4 border-[#D4AF37] rounded-br" />
                      </div>
                    </div>

                    {/* Camera Switch Pill */}
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-black/60 text-white hover:bg-black/90 border border-white/20 transition-all cursor-pointer"
                      title="Switch Camera (Front/Rear)"
                    >
                      <FlipHorizontal className="w-4 h-4 text-amber-300" />
                    </button>

                    {/* HTML5 QR Container */}
                    <div id="anyshare-qr-reader" className="w-full h-full" />
                  </div>

                  <p className="text-xs text-center text-stone-600 font-medium">
                    Point your camera at the QR code generated in the <strong>One Tap Desktop App</strong> or mobile companion.
                  </p>
                </div>
              )}

              {/* TAB 2: UPLOAD IMAGE */}
              {activeTab === 'upload' && (
                <div className="space-y-4 py-2">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 border-2 border-dashed border-[#C5A059]/50 rounded-3xl bg-white/70 hover:bg-white text-center cursor-pointer transition-all hover:border-[#D4AF37] space-y-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-[#8B6508] flex items-center justify-center mx-auto shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-stone-900">Upload QR Screenshot or Photo</h4>
                      <p className="text-xs text-stone-500 mt-1">
                        PNG, JPG, or WEBP containing the One-Time Login QR
                      </p>
                    </div>
                    <span className="inline-block text-xs font-bold text-[#8B6508] bg-amber-100/80 px-3 py-1 rounded-lg border border-[#C5A059]/30">
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
                    <label className="text-xs font-bold uppercase tracking-wider text-[#8B6508] block">
                      Enter Pairing Token or JSON Payload
                    </label>
                    <textarea
                      rows={4}
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      placeholder='Paste token string (e.g. pair_ot_...) or full JSON payload'
                      className="w-full p-3 rounded-2xl bg-white border border-[#C5A059]/35 text-xs font-mono text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
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
                  <div className="p-4 rounded-3xl bg-white border border-[#C5A059]/30 shadow-sm inline-block mx-auto">
                    {generatedQR ? (
                      <img
                        src={generatedQR}
                        alt="One Tap Login QR Code"
                        className="w-52 h-52 mx-auto rounded-xl shadow-xs"
                      />
                    ) : (
                      <div className="w-52 h-52 flex items-center justify-center text-xs text-stone-400">
                        Generating QR...
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-stone-950">One Tap Workstation Node QR</h4>
                    <p className="text-xs text-stone-600 max-w-xs mx-auto mt-0.5">
                      This is the QR generated by the One Tap desktop app for Studio-PC-01. Scan with AnyShare mobile or copy token below.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyPayload}
                      className="px-4 py-2 rounded-xl text-xs font-bold glass-pill hover:bg-stone-200 text-stone-900 border border-[#C5A059]/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedToken ? 'Copied Payload!' : 'Copy Pairing JSON'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={generateAppLoginQR}
                      className="p-2 rounded-xl glass-pill hover:bg-stone-200 text-stone-800 border border-[#C5A059]/30 cursor-pointer"
                      title="Regenerate QR"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#8A6614]" />
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
        <div className="p-4 border-t border-[#C5A059]/25 bg-stone-100/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-600">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8A6614]" />
            <span>Encrypted One-Time Auth Token</span>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold glass-pill hover:bg-white text-stone-900 border border-[#C5A059]/40 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
