// Vercel Serverless Function: Ecosystem Users API
// Endpoint: /api/users

const DEFAULT_USERS = [
  {
    id: 'CREATIVE-ADMIN-MASTER',
    name: 'Master Architect',
    email: 'admin@anything.local',
    username: 'admin',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    provider: 'anything',
    status: 'active'
  },
  {
    id: 'user_editor_zaid',
    name: 'Zaid Editor',
    email: 'zaid@anything.local',
    username: 'zaid_cuts',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    provider: 'anything',
    status: 'active'
  },
  {
    id: 'user_colorist_sarah',
    name: 'Sarah Colorist',
    email: 'sarah@anything.local',
    username: 'sarah_grades',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    provider: 'anything',
    status: 'active'
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      service: 'Vercel Serverless Users Gateway',
      users: DEFAULT_USERS,
      total: DEFAULT_USERS.length
    });
  }

  if (req.method === 'POST') {
    const { name, email, username, role, avatar } = req.body || {};
    if (!username) {
      return res.status(400).json({ success: false, error: 'Username is required' });
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name: name || username,
      email: email || `${username}@anything.local`,
      username: username.toLowerCase().replace(/[^a-z0-9_.-]/g, ''),
      role: role || 'member',
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      provider: 'anything',
      status: 'active'
    };

    return res.status(200).json({
      success: true,
      user: newUser
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
