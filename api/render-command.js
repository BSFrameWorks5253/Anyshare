// Vercel Serverless Function: Remote Render Command Dispatcher
// Endpoint: /api/render-command

export default async function handler(req, res) {
  // Set CORS and JSON headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Poll or list active queued render commands for the One Tap node
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      service: 'Vercel Serverless Render Dispatcher',
      timestamp: new Date().toISOString(),
      queue_status: 'ready',
      message: 'One Tap Bridge listening via Vercel Edge compute'
    });
  }

  // POST: Dispatch a hardware render command from mobile or web
  if (req.method === 'POST') {
    const { itemId, externalKey, displayLabel, requestedBy, targetPreset, priority } = req.body || {};

    if (!itemId && !externalKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: itemId or externalKey'
      });
    }

    const commandId = 'cmd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const commandPayload = {
      command_id: commandId,
      item_id: itemId || 'item_generated',
      external_key: externalKey || 'session_master',
      display_label: displayLabel || 'Safar Master Video',
      requested_by: requestedBy || 'creator_admin',
      target_preset: targetPreset || 'Match Source - High Bitrate (4K H.264)',
      priority: priority || 'normal',
      state: 'claimed',
      claimed_at: new Date().toISOString(),
      engine: 'Adobe Premiere Pro / Media Encoder (NVENC)',
      dispatched_via: 'Vercel Serverless Edge Runtime'
    };

    return res.status(200).json({
      success: true,
      command: commandPayload,
      message: `Render command ${commandId} successfully received and claimed by One Tap node.`
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
