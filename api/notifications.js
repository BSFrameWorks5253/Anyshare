// Vercel Serverless Function: Real-time Notifications Gateway
// Endpoint: /api/notifications

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Fetch recent notifications
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      service: 'Vercel Serverless Notification Feed',
      timestamp: new Date().toISOString(),
      active_channel: 'supabase_realtime_synced',
      notifications_count: 0
    });
  }

  // POST: Dispatch a new notification event
  if (req.method === 'POST') {
    const { title, message, kind, recipientId, itemId } = req.body || {};

    const newNotification = {
      id: 'notif_' + Date.now(),
      recipient_user_id: recipientId || 'all',
      item_id: itemId || null,
      kind: kind || 'render_completed',
      title: title || 'Production Update',
      message: message || 'Workstation status update delivered.',
      delivery_state: 'delivered',
      read_at: null,
      created_at: new Date().toISOString(),
      dispatched_via: 'Vercel Serverless Function'
    };

    return res.status(200).json({
      success: true,
      notification: newNotification
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
