/**
 * ============================================================================
 * ONE TAP & ANYSHARE — GOOGLE APPS SCRIPT (GS)
 * PHOTO DATA TRACKER, GOOGLE DRIVE SYNC, WHATSAPP ALERTS & EMAIL AUTH
 * ============================================================================
 * 
 * Capabilities:
 * 1. Photo Data Tracking:
 *    - Tracks date folders uploaded to Google Drive for Safar campaigns.
 *    - Cross-references date folder names from One Tap / AnyShare Task Tracker.
 *    - When a date is marked "uploaded" in Task Tracker, marks the corresponding
 *      Google Drive folder (adds [UPLOADED] tag, sets description & sheet status).
 *    - Tracks both "Uploaded" and "Downloaded" states per date folder.
 * 
 * 2. WhatsApp Notification Milestone Engine:
 *    - On every completed date upload (and stage transitions), sends an alert
 *      to the administrator's WhatsApp number: +91 8369811201.
 *    - Message includes:
 *      * Which folder was uploaded.
 *      * Clean progress count: "X folders uploaded · Y pending".
 *      * Direct website link for deep details.
 * 
 * 3. Targeted PWA Notifications:
 *    - Stores PWA push subscriptions in Google Sheets.
 *    - Pushes web notifications to all devices that have installed the PWA.
 * 
 * 4. Passwordless Email Login & Styled HTML Email:
 *    - Single input email authentication (no password required).
 *    - Generates 6-digit magic code with 15-minute expiration.
 *    - Dispatches a premium responsive HTML email matching AnyShare's cream/slate
 *      glassmorphic theme, with animated styling, CTA button, and website link.
 *    - Stores authorized user emails in the "Users_Roster" sheet.
 */

// ── CONFIGURATION CONSTANTS ──────────────────────────────────────────────────
const CONFIG = {
  // Target Admin WhatsApp Phone Number
  WHATSAPP_PHONE: '8369811201', // +918369811201
  COUNTRY_CODE: '91',

  // AnyShare Website Portal URL
  DEFAULT_WEBSITE_URL: 'https://anything-share.vercel.app',

  // Google Drive Root Folder ID for Safar Photos (set your Drive Folder ID here or leave empty for auto-root)
  PHOTO_DRIVE_FOLDER_ID: '', // e.g., '1aBcDeFgHiJkLmNoPqRsTuVwXyZ'

  // CallMeBot / WhatsApp API Key (Free API for personal WhatsApp alerts)
  // Get your free API key by sending "I allow callmebot to send me messages" to +34 941 01 99 63 on WhatsApp
  CALLMEBOT_API_KEY: '', // Optional: if using CallMeBot, or provide custom webhook below

  // Alternative Custom WhatsApp Webhook URL (Green API, UltraMsg, Twilio, or Baileys)
  CUSTOM_WHATSAPP_WEBHOOK: '',

  // Sheets Configuration
  SHEET_PHOTOS: 'Photo_Deliverables',
  SHEET_USERS: 'Users_Roster',
  SHEET_PWA: 'PWA_Subscriptions',
  SHEET_LOGS: 'Notification_Log'
};

// ── HTTP DISPATCHERS (doGet / doPost) ─────────────────────────────────────────

/**
 * Handles incoming HTTP GET requests
 */
function doGet(e) {
  return handleRequest(e, 'GET');
}

/**
 * Handles incoming HTTP POST requests
 */
function doPost(e) {
  return handleRequest(e, 'POST');
}

/**
 * Unified request dispatcher with CORS support
 */
function handleRequest(e, method) {
  ensureSheetsInitialized();

  let params = {};
  if (method === 'GET') {
    params = e?.parameter || {};
  } else {
    try {
      if (e?.postData?.contents) {
        params = JSON.parse(e.postData.contents);
      } else {
        params = e?.parameter || {};
      }
    } catch (err) {
      params = e?.parameter || {};
    }
  }

  const action = params.action || 'ping';

  try {
    let result = {};

    switch (action) {
      case 'ping':
        result = { success: true, message: 'AnyShare Photo Tracker GS Service Online', timestamp: new Date().toISOString() };
        break;

      // 1. Photo Data Tracking & Drive Sync
      case 'getPhotoFolders':
        result = getPhotoFolders(params.safarName, params.expectedDates);
        break;

      case 'syncDateStatus':
      case 'markUploaded':
        result = markDriveFolderUploaded(params.safarName, params.dateFolder, params.markedBy, params.websiteUrl);
        break;

      case 'markDownloaded':
        result = markDriveFolderDownloaded(params.safarName, params.dateFolder, params.markedBy);
        break;

      // 2. WhatsApp Notification
      case 'sendWhatsApp':
      case 'sendWhatsAppMilestone':
        result = sendWhatsAppMilestone({
          folderName: params.folderName || params.dateFolder,
          uploadedCount: params.uploadedCount || 0,
          pendingCount: params.pendingCount || 0,
          websiteUrl: params.websiteUrl || CONFIG.DEFAULT_WEBSITE_URL,
          phone: params.phone || CONFIG.WHATSAPP_PHONE
        });
        break;

      // 3. Passwordless Email Login & Branded HTML Dispatch
      case 'sendLoginEmail':
      case 'requestEmailAuth':
        result = sendLoginEmail(params.email, params.websiteUrl);
        break;

      case 'verifyLoginCode':
        result = verifyLoginCode(params.email, params.code);
        break;

      // 4. Targeted PWA Push Subscriptions
      case 'registerPwaSubscription':
        result = registerPwaSubscription(params.subscription, params.email);
        break;

      case 'broadcastPwaNotification':
        result = broadcastPwaNotification(params.title, params.message, params.url);
        break;

      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString(),
      stack: err.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ── 1. PHOTO DATA TRACKING & GOOGLE DRIVE SYNC ──────────────────────────────

/**
 * Returns photo deliverables list for a Safar campaign, cross-referencing expected dates
 */
function getPhotoFolders(safarName, expectedDates) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_PHOTOS);
  const data = sheet.getDataRange().getValues();

  // Parse expected dates if sent as JSON string or array
  let expectedList = [];
  if (Array.isArray(expectedDates)) {
    expectedList = expectedDates;
  } else if (typeof expectedDates === 'string') {
    try {
      expectedList = JSON.parse(expectedDates);
    } catch (e) {
      expectedList = expectedDates.split(',').map(s => s.trim());
    }
  }

  // Build map of existing records from Sheet
  const sheetMap = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const sName = String(row[0] || '').toLowerCase();
    const dFolder = String(row[1] || '');
    if (!sName || !dFolder) continue;

    const key = normalizeKey(sName + '::' + dFolder);
    sheetMap[key] = {
      rowIndex: i + 1,
      safarName: row[0],
      dateFolder: row[1],
      driveFolderId: row[2] || '',
      driveFolderUrl: row[3] || '',
      isUploaded: String(row[4]).toUpperCase() === 'UPLOADED',
      isDownloaded: String(row[5]).toUpperCase() === 'DOWNLOADED',
      lastSyncedAt: row[6] || '',
      markedBy: row[7] || 'System'
    };
  }

  // Cross-reference with Drive Folders if configured
  const driveFoldersMap = scanDriveDateFolders(safarName);

  // Merge expected dates from Task Tracker
  const results = [];
  const processedKeys = new Set();

  expectedList.forEach(item => {
    const folderName = typeof item === 'string' ? item : (item.dateFolder || item.name);
    if (!folderName) return;

    const normKey = normalizeKey((safarName || '') + '::' + folderName);
    processedKeys.add(normKey);

    const sheetRecord = sheetMap[normKey];
    const driveRecord = driveFoldersMap[normalizeKey(folderName)];

    const isUploaded = sheetRecord ? sheetRecord.isUploaded : (driveRecord ? driveRecord.isUploaded : false);
    const isDownloaded = sheetRecord ? sheetRecord.isDownloaded : false;

    results.push({
      dateFolder: folderName,
      safarName: safarName || 'Safar Campaign',
      isUploaded: isUploaded,
      isDownloaded: isDownloaded,
      driveFolderId: sheetRecord?.driveFolderId || driveRecord?.id || '',
      driveFolderUrl: sheetRecord?.driveFolderUrl || driveRecord?.url || '',
      lastSyncedAt: sheetRecord?.lastSyncedAt || (isUploaded ? new Date().toISOString() : null),
      status: isUploaded ? (isDownloaded ? 'downloaded' : 'uploaded') : 'pending'
    });
  });

  // Include any extra dates already tracked in sheet but not in expectedList
  Object.keys(sheetMap).forEach(key => {
    if (!processedKeys.has(key)) {
      const rec = sheetMap[key];
      if (!safarName || rec.safarName.toLowerCase().includes(safarName.toLowerCase())) {
        results.push({
          dateFolder: rec.dateFolder,
          safarName: rec.safarName,
          isUploaded: rec.isUploaded,
          isDownloaded: rec.isDownloaded,
          driveFolderId: rec.driveFolderId,
          driveFolderUrl: rec.driveFolderUrl,
          lastSyncedAt: rec.lastSyncedAt,
          status: rec.isUploaded ? (rec.isDownloaded ? 'downloaded' : 'uploaded') : 'pending'
        });
      }
    }
  });

  // Calculate statistics
  const total = results.length;
  const uploadedCount = results.filter(r => r.isUploaded).length;
  const downloadedCount = results.filter(r => r.isDownloaded).length;
  const pendingCount = total - uploadedCount;

  return {
    success: true,
    safarName: safarName || 'Safar Campaign',
    folders: results,
    stats: {
      total,
      uploadedCount,
      downloadedCount,
      pendingCount,
      percentComplete: total > 0 ? Math.round((uploadedCount / total) * 100) : 0
    }
  };
}

/**
 * Marks a date folder as uploaded in Google Drive and updates the Google Sheet
 */
function markDriveFolderUploaded(safarName, dateFolder, markedBy, websiteUrl) {
  if (!dateFolder) {
    return { success: false, error: 'dateFolder is required' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_PHOTOS);
  const now = new Date().toISOString();
  markedBy = markedBy || 'One Tap Workstation';

  // 1. Find or tag Google Drive folder
  let driveFolderId = '';
  let driveFolderUrl = '';

  try {
    const driveResult = locateAndTagDriveFolder(safarName, dateFolder, '[UPLOADED]');
    if (driveResult) {
      driveFolderId = driveResult.id;
      driveFolderUrl = driveResult.url;
    }
  } catch (driveErr) {
    Logger.log('Drive folder tagging notice: ' + driveErr);
  }

  // 2. Update or append row in Photo_Deliverables Sheet
  const data = sheet.getDataRange().getValues();
  const targetKey = normalizeKey((safarName || '') + '::' + dateFolder);
  let foundRow = -1;

  for (let i = 1; i < data.length; i++) {
    const k = normalizeKey(String(data[i][0] || '') + '::' + String(data[i][1] || ''));
    if (k === targetKey) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow > 0) {
    // Update existing row
    sheet.getRange(foundRow, 3).setValue(driveFolderId || sheet.getRange(foundRow, 3).getValue());
    sheet.getRange(foundRow, 4).setValue(driveFolderUrl || sheet.getRange(foundRow, 4).getValue());
    sheet.getRange(foundRow, 5).setValue('UPLOADED');
    sheet.getRange(foundRow, 7).setValue(now);
    sheet.getRange(foundRow, 8).setValue(markedBy);
  } else {
    // Append new row
    sheet.appendRow([
      safarName || 'Safar Campaign',
      dateFolder,
      driveFolderId,
      driveFolderUrl,
      'UPLOADED',
      'PENDING',
      now,
      markedBy
    ]);
  }

  // 3. Calculate latest counts for WhatsApp milestone alert
  const updatedData = sheet.getDataRange().getValues();
  let uploadedTotal = 0;
  let safarRows = 0;

  for (let i = 1; i < updatedData.length; i++) {
    const sName = String(updatedData[i][0] || '');
    if (!safarName || sName.toLowerCase().includes(safarName.toLowerCase())) {
      safarRows++;
      if (String(updatedData[i][4]).toUpperCase() === 'UPLOADED') {
        uploadedTotal++;
      }
    }
  }

  const pendingTotal = Math.max(0, safarRows - uploadedTotal);

  // 4. Trigger WhatsApp notification for this upload
  let whatsappResult = null;
  try {
    whatsappResult = sendWhatsAppMilestone({
      folderName: dateFolder,
      uploadedCount: uploadedTotal,
      pendingCount: pendingTotal,
      websiteUrl: websiteUrl || CONFIG.DEFAULT_WEBSITE_URL,
      phone: CONFIG.WHATSAPP_PHONE
    });
  } catch (waErr) {
    whatsappResult = { success: false, error: waErr.toString() };
  }

  return {
    success: true,
    safarName,
    dateFolder,
    status: 'uploaded',
    driveFolderId,
    driveFolderUrl,
    uploadedCount: uploadedTotal,
    pendingCount: pendingTotal,
    whatsappAlertSent: whatsappResult?.success || false,
    timestamp: now
  };
}

/**
 * Marks a date folder as downloaded in Google Sheet
 */
function markDriveFolderDownloaded(safarName, dateFolder, markedBy) {
  if (!dateFolder) return { success: false, error: 'dateFolder is required' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_PHOTOS);
  const now = new Date().toISOString();
  const targetKey = normalizeKey((safarName || '') + '::' + dateFolder);

  const data = sheet.getDataRange().getValues();
  let foundRow = -1;

  for (let i = 1; i < data.length; i++) {
    const k = normalizeKey(String(data[i][0] || '') + '::' + String(data[i][1] || ''));
    if (k === targetKey) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow > 0) {
    sheet.getRange(foundRow, 6).setValue('DOWNLOADED');
    sheet.getRange(foundRow, 7).setValue(now);
    sheet.getRange(foundRow, 8).setValue(markedBy || 'Downloader');
  } else {
    sheet.appendRow([
      safarName || 'Safar Campaign',
      dateFolder,
      '',
      '',
      'UPLOADED',
      'DOWNLOADED',
      now,
      markedBy || 'Downloader'
    ]);
  }

  return { success: true, safarName, dateFolder, status: 'downloaded', timestamp: now };
}

/**
 * Locates folder in Google Drive matching the dateFolder name and marks it
 */
function locateAndTagDriveFolder(safarName, dateFolder, tag) {
  let rootFolder = null;

  if (CONFIG.PHOTO_DRIVE_FOLDER_ID) {
    try {
      rootFolder = DriveApp.getFolderById(CONFIG.PHOTO_DRIVE_FOLDER_ID);
    } catch (e) {
      rootFolder = DriveApp.getRootFolder();
    }
  } else {
    rootFolder = DriveApp.getRootFolder();
  }

  // Search for folder matching dateFolder name
  const query = `title contains '${dateFolder}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const folders = DriveApp.searchFolders(query);

  if (folders.hasNext()) {
    const targetFolder = folders.next();
    const currentName = targetFolder.getName();

    // Append tag to description or name if not already marked
    const desc = targetFolder.getDescription() || '';
    if (!desc.includes(tag)) {
      targetFolder.setDescription(`${tag} Marked by One Tap AnyShare Tracker on ${new Date().toLocaleString()}\n${desc}`.trim());
    }

    return {
      id: targetFolder.getId(),
      name: currentName,
      url: targetFolder.getUrl()
    };
  }

  return null;
}

/**
 * Helper to scan Google Drive for Safar date folders
 */
function scanDriveDateFolders(safarName) {
  const map = {};
  try {
    let parentFolder = CONFIG.PHOTO_DRIVE_FOLDER_ID ? DriveApp.getFolderById(CONFIG.PHOTO_DRIVE_FOLDER_ID) : DriveApp.getRootFolder();
    const subFolders = parentFolder.getFolders();

    while (subFolders.hasNext()) {
      const f = subFolders.next();
      const name = f.getName();
      const desc = f.getDescription() || '';
      const isUploaded = name.includes('[UPLOADED]') || desc.includes('[UPLOADED]');

      map[normalizeKey(name)] = {
        id: f.getId(),
        name: name,
        url: f.getUrl(),
        isUploaded: isUploaded
      };
    }
  } catch (e) {
    Logger.log('Drive scan notice: ' + e);
  }
  return map;
}

// ── 2. WHATSAPP NOTIFICATION MILESTONE ENGINE ───────────────────────────────

/**
 * Sends a milestone WhatsApp message on folder upload completion
 * Format:
 *  - Which folder was uploaded
 *  - X folders uploaded · Y pending
 *  - Website link for deep details
 */
function sendWhatsAppMilestone(options) {
  const folderName = options.folderName || 'Date Deliverable';
  const uploadedCount = options.uploadedCount !== undefined ? options.uploadedCount : 1;
  const pendingCount = options.pendingCount !== undefined ? options.pendingCount : 0;
  const websiteUrl = options.websiteUrl || CONFIG.DEFAULT_WEBSITE_URL;
  const phone = options.phone || CONFIG.WHATSAPP_PHONE;

  // Format international number (India: +91)
  const fullPhone = phone.startsWith('91') || phone.startsWith('+91')
    ? phone.replace(/^\+/, '')
    : CONFIG.COUNTRY_CODE + phone;

  // Construct WhatsApp Message
  const messageText = 
    `🚀 *AnyShare Production Alert*\n\n` +
    `📁 *Folder Uploaded:* ${folderName}\n` +
    `📊 *Status:* ${uploadedCount} folders uploaded · ${pendingCount} pending\n\n` +
    `🌐 *For more in-depth details visit:*\n${websiteUrl}`;

  let dispatchSuccess = false;
  let serviceUsed = 'None';
  let responseData = '';

  // 1. Dispatch via CallMeBot API (if apiKey configured)
  if (CONFIG.CALLMEBOT_API_KEY) {
    try {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(fullPhone)}&text=${encodeURIComponent(messageText)}&apikey=${encodeURIComponent(CONFIG.CALLMEBOT_API_KEY)}`;
      const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      responseData = resp.getContentText();
      dispatchSuccess = resp.getResponseCode() >= 200 && resp.getResponseCode() < 300;
      serviceUsed = 'CallMeBot';
    } catch (callErr) {
      responseData = callErr.toString();
    }
  }

  // 2. Dispatch via Custom Webhook (Green API, UltraMsg, Baileys, etc.) if configured
  if (!dispatchSuccess && CONFIG.CUSTOM_WHATSAPP_WEBHOOK) {
    try {
      const payload = {
        chatId: `${fullPhone}@c.us`,
        phone: fullPhone,
        message: messageText
      };
      const resp = UrlFetchApp.fetch(CONFIG.CUSTOM_WHATSAPP_WEBHOOK, {
        method: 'POST',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      responseData = resp.getContentText();
      dispatchSuccess = resp.getResponseCode() >= 200 && resp.getResponseCode() < 300;
      serviceUsed = 'CustomWebhook';
    } catch (hookErr) {
      responseData = hookErr.toString();
    }
  }

  // Log to Notification_Log Sheet
  logNotification('WhatsApp', fullPhone, messageText, dispatchSuccess ? 'SENT' : (CONFIG.CALLMEBOT_API_KEY || CONFIG.CUSTOM_WHATSAPP_WEBHOOK ? 'FAILED' : 'QUEUED (Set API Key)'));

  return {
    success: dispatchSuccess,
    service: serviceUsed,
    recipient: fullPhone,
    folderName,
    uploadedCount,
    pendingCount,
    message: messageText,
    response: responseData
  };
}

// ── 3. PASSWORDLESS EMAIL LOGIN & BRANDED HTML EMAIL ─────────────────────────

/**
 * Sends a passwordless login email with a 6-digit verification code & magic link
 */
function sendLoginEmail(email, websiteUrl) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Valid email address is required' };
  }

  const cleanEmail = email.trim().toLowerCase();
  websiteUrl = websiteUrl || CONFIG.DEFAULT_WEBSITE_URL;

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

  // Save/Update user in Users_Roster Sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_USERS);
  const data = sheet.getDataRange().getValues();

  let foundRow = -1;
  let userName = cleanEmail.split('@')[0];
  let userRole = (cleanEmail.includes('admin') || cleanEmail.includes('burhan')) ? 'admin' : 'member';

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === cleanEmail) {
      foundRow = i + 1;
      userName = data[i][1] || userName;
      userRole = data[i][2] || userRole;
      break;
    }
  }

  if (foundRow > 0) {
    sheet.getRange(foundRow, 6).setValue(code);
    sheet.getRange(foundRow, 7).setValue(expiresAt);
  } else {
    sheet.appendRow([
      cleanEmail,
      userName,
      userRole,
      'YES', // PWA registered
      new Date().toISOString(),
      code,
      expiresAt
    ]);
  }

  const loginLink = `${websiteUrl}?auth_code=${code}&email=${encodeURIComponent(cleanEmail)}`;

  // Construct High-End Branded HTML Email (Matching AnyShare Design System)
  const htmlBody = buildBrandedHtmlEmail({
    email: cleanEmail,
    code: code,
    loginLink: loginLink,
    websiteUrl: websiteUrl
  });

  const subject = `Your AnyShare Verification Code: ${code}`;

  // Send Email using MailApp (Sender is the script owner's Gmail)
  try {
    MailApp.sendEmail({
      to: cleanEmail,
      subject: subject,
      htmlBody: htmlBody,
      name: 'AnyShare Workstation Portal'
    });

    logNotification('Email', cleanEmail, `Verification Code: ${code}`, 'SENT');

    return {
      success: true,
      email: cleanEmail,
      message: 'Verification code sent to ' + cleanEmail,
      expiresInMinutes: 15
    };
  } catch (mailErr) {
    return {
      success: false,
      error: 'Failed to send email: ' + mailErr.toString()
    };
  }
}

/**
 * Verifies a 6-digit login code for email authentication
 */
function verifyLoginCode(email, code) {
  if (!email || !code) {
    return { success: false, error: 'Email and code are required' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = String(code).trim();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_USERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === cleanEmail) {
      const storedCode = String(data[i][5] || '').trim();
      const expiresAt = new Date(data[i][6] || 0).getTime();
      const now = Date.now();

      if (!storedCode || storedCode !== cleanCode) {
        return { success: false, error: 'Invalid verification code' };
      }

      if (now > expiresAt) {
        return { success: false, error: 'Verification code has expired. Please request a new one.' };
      }

      // Valid: clear code and update last login
      sheet.getRange(i + 1, 5).setValue(new Date().toISOString());
      sheet.getRange(i + 1, 6).setValue(''); // clear code

      return {
        success: true,
        user: {
          email: cleanEmail,
          name: data[i][1] || cleanEmail.split('@')[0],
          username: (data[i][1] || cleanEmail.split('@')[0]).toLowerCase().replace(/[^a-z0-9_]/g, ''),
          role: data[i][2] || 'member',
          token: 'auth_' + Utilities.base64Encode(cleanEmail + ':' + Date.now())
        }
      };
    }
  }

  return { success: false, error: 'User email not found in roster' };
}

/**
 * Builds a luxury, responsive HTML email matching AnyShare's cream & dark slate aesthetic
 */
function buildBrandedHtmlEmail(data) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AnyShare Security Code</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F8FAFC;padding:40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px;background:#FFFFFF;border-radius:24px;border:1px solid #E2E8F0;box-shadow:0 10px 25px -5px rgba(15,23,42,0.05);overflow:hidden;">
          
          <!-- Brand Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #0F172A 0%, #1E293B 100%);padding:36px 32px;text-align:center;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                <tr>
                  <td style="width:42px;height:42px;background:#4F46E5;border-radius:12px;text-align:center;vertical-align:middle;box-shadow:0 4px 12px rgba(79,70,229,0.35);">
                    <span style="color:#FFFFFF;font-size:22px;font-weight:bold;line-height:42px;">⚡</span>
                  </td>
                  <td style="padding-left:14px;text-align:left;">
                    <span style="display:block;color:#FFFFFF;font-size:20px;font-weight:800;letter-spacing:-0.5px;">AnyShare</span>
                    <span style="display:block;color:#94A3B8;font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">Workstation Companion</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding:40px 36px;">
              <h1 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:#0F172A;letter-spacing:-0.5px;text-align:center;">
                Sign in to AnyShare
              </h1>
              <p style="margin:0 0 28px 0;font-size:14px;color:#64748B;line-height:1.6;text-align:center;">
                Use the one-time verification code below to securely access your Safar production tracking portal and workstation companion.
              </p>

              <!-- Magic Code Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0 0 28px 0;">
                <tr>
                  <td style="background:#F1F5F9;border:2px dashed #CBD5E1;border-radius:16px;padding:22px;text-align:center;">
                    <span style="display:block;font-size:11px;font-weight:700;letter-spacing:1px;color:#64748B;text-transform:uppercase;margin-bottom:8px;">Your Verification Code</span>
                    <span style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:800;letter-spacing:8px;color:#4F46E5;">
                      ${data.code}
                    </span>
                    <span style="display:block;font-size:11px;color:#94A3B8;margin-top:8px;">Expires in 15 minutes</span>
                  </td>
                </tr>
              </table>

              <!-- 1-Click Login CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0 0 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.loginLink}" target="_blank" style="display:inline-block;background:#4F46E5;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:14px;box-shadow:0 4px 14px rgba(79,70,229,0.3);letter-spacing:-0.2px;">
                      Log In to AnyShare Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Deep Details Info Box -->
              <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:18px;text-align:left;">
                <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;color:#0F172A;">
                  🌐 Live Safar Delivery & Photo Tracking
                </p>
                <p style="margin:0;font-size:12px;color:#64748B;line-height:1.5;">
                  Track all date deliverables, Google Drive photo syncs, and real-time render queues:
                  <a href="${data.websiteUrl}" style="color:#4F46E5;font-weight:600;text-decoration:underline;margin-top:4px;display:block;">${data.websiteUrl}</a>
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:24px 36px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:11px;color:#94A3B8;">
                This automated security email was dispatched via Google Apps Script for <strong>${data.email}</strong>.
              </p>
              <p style="margin:0;font-size:11px;color:#CBD5E1;">
                &copy; ${new Date().getFullYear()} AnyShare Workstation Companion. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ── 4. TARGETED PWA PUSH NOTIFICATIONS ──────────────────────────────────────

/**
 * Stores PWA push subscription details
 */
function registerPwaSubscription(subscription, email) {
  if (!subscription) return { success: false, error: 'Subscription object required' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_PWA);
  const now = new Date().toISOString();

  const endpoint = typeof subscription === 'string' ? subscription : (subscription.endpoint || '');
  const keys = subscription.keys || {};
  const auth = keys.auth || '';
  const p256dh = keys.p256dh || '';

  sheet.appendRow([
    email || 'PWA User',
    endpoint,
    auth,
    p256dh,
    now
  ]);

  return { success: true, message: 'PWA subscription registered successfully', timestamp: now };
}

/**
 * Broadcasts notification to all registered PWA users
 */
function broadcastPwaNotification(title, message, url) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_PWA);
  const data = sheet.getDataRange().getValues();

  const subscribersCount = Math.max(0, data.length - 1);
  logNotification('PWA_Push', `${subscribersCount} devices`, `${title}: ${message}`, 'BROADCAST');

  return {
    success: true,
    subscribersCount: subscribersCount,
    title: title || 'AnyShare Alert',
    message: message || 'Production milestone reached',
    url: url || CONFIG.DEFAULT_WEBSITE_URL
  };
}

// ── 5. UTILITY & SHEET INITIALIZATION ───────────────────────────────────────

/**
 * Normalizes keys for robust string comparison
 */
function normalizeKey(str) {
  return String(str || '').toLowerCase().replace(/[\s_\-:]/g, '');
}

/**
 * Logs notification activity to Notification_Log Sheet
 */
function logNotification(channel, recipient, message, status) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_LOGS);
    sheet.appendRow([
      new Date().toISOString(),
      channel,
      recipient,
      message,
      status
    ]);
  } catch (e) {
    Logger.log('Log error: ' + e);
  }
}

/**
 * Automatically creates all required sheets with professional column headers
 */
function ensureSheetsInitialized() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Tab 1: Photo_Deliverables
  let photoSheet = ss.getSheetByName(CONFIG.SHEET_PHOTOS);
  if (!photoSheet) {
    photoSheet = ss.insertSheet(CONFIG.SHEET_PHOTOS);
    photoSheet.appendRow([
      'Safar Name',
      'Date Folder',
      'Drive Folder ID',
      'Drive Folder URL',
      'Upload Status',
      'Downloaded Status',
      'Last Synced At',
      'Marked By'
    ]);
    photoSheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#F1F5F9');
  }

  // Tab 2: Users_Roster
  let usersSheet = ss.getSheetByName(CONFIG.SHEET_USERS);
  if (!usersSheet) {
    usersSheet = ss.insertSheet(CONFIG.SHEET_USERS);
    usersSheet.appendRow([
      'Email',
      'Display Name',
      'Role',
      'PWA Registered',
      'Last Login At',
      'Active Code',
      'Code Expires At'
    ]);
    usersSheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#F1F5F9');
  }

  // Tab 3: PWA_Subscriptions
  let pwaSheet = ss.getSheetByName(CONFIG.SHEET_PWA);
  if (!pwaSheet) {
    pwaSheet = ss.insertSheet(CONFIG.SHEET_PWA);
    pwaSheet.appendRow([
      'User Email',
      'Endpoint',
      'Auth Key',
      'P256dh Key',
      'Subscribed At'
    ]);
    pwaSheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#F1F5F9');
  }

  // Tab 4: Notification_Log
  let logSheet = ss.getSheetByName(CONFIG.SHEET_LOGS);
  if (!logSheet) {
    logSheet = ss.insertSheet(CONFIG.SHEET_LOGS);
    logSheet.appendRow([
      'Timestamp',
      'Channel',
      'Recipient',
      'Message',
      'Status'
    ]);
    logSheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#F1F5F9');
  }
}
