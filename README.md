# ⚡ AnyShare — One Tap Remote Production Bridge

> **High-Performance Liquid Glass Production Status & Hardware Render Control for the Anything Creative Ecosystem**  
> Child App Name: **AnyShare** | Folder Identity: **Anything share** | Ecosystem ID: `anything-share`

---

## 🌟 Overview

**AnyShare** is a mobile-optimized web application and One Tap workstation bridge built for modern video editing teams. It delivers real-time production visibility, deterministic preflight rule verification, and 1-tap remote hardware render initiation from mobile devices or desktop browsers.

- **Unified Identity (Cross-App SSO):** Automatically syncs with the master **Anything Hub** (`anything_ecosystem_session_v1`). Any username set in AnyShare allows seamless sign-in across the Anything website and child applications.
- **Strict Security Architecture:** No database secrets, private keys, or admin tokens are exposed in client bundles or `VITE_` variables. Outbound SSL telemetry ensures no local workstation ports are exposed to the public internet.
- **Zero Raw Media in Cloud:** Only lightweight JSON status reports, preflight verifications, render commands, and audit logs are synchronized to Supabase. Raw media, 32-bit audio files, and Premiere projects remain securely on local editing workstations.
- **Liquid Glass Design System:** Restrained frosted translucent surfaces (`backdrop-filter: blur(20px)`), subtle neon cyan/indigo gradients, smooth horizontal snap filters, and tactile haptic/audio feedback.

---

## 🚀 Key Features

1. **Pipeline Pulse & Stage Dashboard:**
   - Real-time tracking across stages: `Pending Edit 1` → `Edit 1` → `Pending Edit 2` → `Edit 2` → `Ready to Render` → `Checking` → `Rendering` → `Rendered` → `Pending Upload` → `Uploaded` → `Given to Jamey` → `Done`.
   - Dynamic stage filters and search query matching.

2. **1-Tap Remote Render Trigger:**
   - Preflight verification gates (canonical folder checks, Premiere `.prproj` lock state, dual-system audio sync, free NVMe disk space).
   - Atomic idempotency tokens to prevent duplicate rendering.
   - Live hardware encoding telemetry (GPU encoder metrics, progress percentage, output checksum verification).
   - Instant completion chime and celebratory feedback.

3. **Admin Evidence & Correction Resolution:**
   - Deterministic safety protocol: any ambiguous or conflicting folder structures prompt human admin review.
   - Admin actions: **Confirm Finding**, **Request Fresh One Tap Scan**, or **Correct Status** (with mandatory audit reason).
   - **Mark Done:** Enforces completion lifecycle rules (all date folders uploaded/submitted) or requires a documented admin exception.

4. **Automated Data Retention:**
   - In-app and Web Push notification alerts (pruned after 30 days).
   - Terminal render commands (pruned after 7 days).
   - Completed work details (pruned after 90 days).
   - Account and profile credentials are protected from automated deletion.

5. **PWA & Mobile Optimization:**
   - Installable Progressive Web App with offline caching (`manifest.json` and `sw.js`).
   - Mobile-first thumb zones, safe-area-inset padding, and full-screen bottom sheets.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite 6
- **Styling:** Tailwind CSS v4 + Liquid Glass Design System
- **Database & Realtime:** Supabase Client (RLS enforced)
- **Icons & Polish:** Lucide React + Canvas Confetti + Web Audio Synthesizer

---

## 📦 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build production bundle
npm run build
```

---

## 🛡️ License

Part of the **Anything Creative Ecosystem**. All rights reserved.
