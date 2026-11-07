# Google Apps Script Setup & Deployment Guide

This Google Apps Script powers:
1. **Google Drive Photo Data Tracking**: Automatically detects and marks Google Drive folders corresponding to Safar dates as `[UPLOADED]` or `DOWNLOADED`.
2. **WhatsApp Milestone Alerts**: Automatically messages **+91 8369811201** with the uploaded folder name and current progress count (`X folders uploaded · Y pending`) + deep link.
3. **Passwordless Email Login**: Single input email login that sends a branded HTML email via your Gmail with a 6-digit magic code.
4. **Targeted PWA Push Notifications**: Automatically keeps track of devices that installed the PWA.

---

## 3-Step Setup

### Step 1: Create a Google Sheet & Open Apps Script
1. Go to [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Name it: **AnyShare Safar Photo & Deliverables Matrix**.
3. In the menu, click **Extensions** &rarr; **Apps Script**.

### Step 2: Paste the Script Code
1. Delete any code in `Code.gs`.
2. Copy and paste the entire contents of [`photo_safar_tracker.gs`](./photo_safar_tracker.gs).
3. (Optional) Customize any values in the `CONFIG` block at top:
   - `WHATSAPP_PHONE`: `'8369811201'` (already configured)
   - `PHOTO_DRIVE_FOLDER_ID`: (Your Google Drive folder ID for Safar photos, or leave empty to search root)
   - `CALLMEBOT_API_KEY`: Free WhatsApp API key. To get yours, send `I allow callmebot to send me messages` to `+34 941 01 99 63` on WhatsApp.
4. Click **Save** (💾 icon).

### Step 3: Deploy as Web App
1. In the top right of the Apps Script editor, click **Deploy** &rarr; **New deployment**.
2. Select type: **Web app** (gear icon &rarr; Web app).
3. Configuration:
   - **Description**: `AnyShare Companion GS API v1`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` (required so the AnyShare web portal can sync and send alerts)
4. Click **Deploy**.
5. Copy the generated **Web App URL** (e.g., `https://script.google.com/macros/s/AKfycb.../exec`).
6. Paste this Web App URL into AnyShare under **Photo Data Tracker** or **Settings**.
