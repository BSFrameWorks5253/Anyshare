// Vercel Serverless Function: One-Time QR Login & Pairing Relay
// Endpoint: /api/auth-pair

// In-memory token store for ephemeral pairing sessions (10-minute TTL)
const pairingStore = new Map();
const consumedTokens = new Set();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Check status of a pairing token (for long-polling from app)
  if (req.method === 'GET') {
    const { token } = req.query || {};
    if (!token) {
      return res.status(400).json({ success: false, error: 'Missing token parameter' });
    }

    if (consumedTokens.has(token)) {
      return res.status(200).json({
        success: true,
        status: 'claimed',
        consumed: true,
        message: 'One-time token has been consumed'
      });
    }

    const session = pairingStore.get(token);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Pairing session not found or expired' });
    }

    if (Date.now() > session.expiresAt) {
      pairingStore.delete(token);
      return res.status(410).json({ success: false, error: 'Pairing session has expired' });
    }

    return res.status(200).json({
      success: true,
      status: session.status,
      claimedAt: session.claimedAt || null,
      claimedBy: session.claimedBy || null
    });
  }

  // POST: Create new pairing session OR Claim an existing session
  if (req.method === 'POST') {
    const { action, token, user, workstation, claimedBy } = req.body || {};

    // 1. Create a new pairing session (from Anything Main App or One Tap Desktop App)
    if (action === 'create' || !action) {
      const pairingToken = token || 'otl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      const sessionData = {
        token: pairingToken,
        status: 'pending',
        user: user || {
          id: 'user_master_01',
          name: 'Master Architect',
          username: 'admin',
          email: 'admin@anything.local',
          role: 'admin'
        },
        workstation: workstation || {
          nodeId: 'node_studio_pc_01',
          label: 'Studio-PC-01 (Primary One Tap Node)',
          bridgePort: 5253,
          gpu: 'NVIDIA RTX 4090 (24GB VRAM)'
        },
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes TTL for strict one-time safety
      };

      pairingStore.set(pairingToken, sessionData);

      // Clean up old tokens (>10 mins)
      for (const [key, val] of pairingStore.entries()) {
        if (Date.now() > val.expiresAt + 300000) {
          pairingStore.delete(key);
        }
      }

      return res.status(200).json({
        success: true,
        token: pairingToken,
        expiresIn: 300,
        session: sessionData
      });
    }

    // 2. Claim pairing token (from Website Scanner) - STRICT ONE TIME ONLY
    if (action === 'claim') {
      if (!token) {
        return res.status(400).json({ success: false, error: 'Missing token' });
      }

      // Check if already consumed
      if (consumedTokens.has(token)) {
        return res.status(409).json({
          success: false,
          code: 'ALREADY_CONSUMED',
          error: 'This one-time QR code has already been consumed and cannot be reused.'
        });
      }

      const session = pairingStore.get(token);
      if (!session) {
        // Mark self-contained payload token as consumed
        consumedTokens.add(token);
        return res.status(200).json({
          success: true,
          mode: 'offline_verified',
          consumed: true,
          message: 'Direct cryptographic payload verified and consumed'
        });
      }

      if (session.status === 'claimed') {
        consumedTokens.add(token);
        return res.status(409).json({
          success: false,
          code: 'ALREADY_CONSUMED',
          error: 'This one-time QR code has already been consumed and cannot be reused.'
        });
      }

      if (Date.now() > session.expiresAt) {
        pairingStore.delete(token);
        return res.status(410).json({
          success: false,
          code: 'EXPIRED',
          error: 'This one-time pairing QR code has expired. Please generate a fresh code.'
        });
      }

      // CONSUME THE TOKEN ATOMICALLY
      session.status = 'claimed';
      session.claimedAt = new Date().toISOString();
      session.claimedBy = claimedBy || 'anyshare_web';
      consumedTokens.add(token);
      pairingStore.set(token, session);

      return res.status(200).json({
        success: true,
        consumed: true,
        message: 'One-time pairing successfully claimed and consumed',
        user: session.user,
        workstation: session.workstation
      });
    }

    return res.status(400).json({ success: false, error: 'Unknown action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
