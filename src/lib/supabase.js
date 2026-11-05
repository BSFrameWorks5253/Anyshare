import { createClient } from '@supabase/supabase-js'

/**
 * SECURE SUPABASE CLIENT CONFIGURATION
 * Strict Security Policy:
 * - NO server-side service keys or database secrets in client bundles or VITE_ env variables.
 * - Authenticates strictly using client-safe public anonymous tokens and Row-Level Security (RLS).
 * - Dynamically inherits active session from Anything Ecosystem SSO (ecosystem_session.json / localStorage).
 */

function resolveEcosystemConfig() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem('anything_ecosystem_session_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.supabase?.url && parsed?.supabase?.anonKey) {
          return {
            url: parsed.supabase.url,
            anonKey: parsed.supabase.anonKey
          };
        }
      }
    } catch (e) {}
  }

  // Canonical Anything Supabase Project (Public client endpoint)
  return {
    url: 'https://dubscvthmkgkeiqdladp.supabase.co',
    anonKey: 'sb_publishable_kYApNvq2_6HAfNwJb8hW1g_7iLMSVyk'
  };
}

const config = resolveEcosystemConfig();

export const supabase = createClient(config.url, config.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export const SUPABASE_CONFIG = {
  url: config.url,
  anonKey: config.anonKey
};
