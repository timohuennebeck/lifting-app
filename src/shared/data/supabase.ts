import 'react-native-url-polyfill/auto';

import { createClient, type Session } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { env } from '@/shared/config/env';
import { mmkvStorage } from '@/shared/lib/storage';

/** Where supabase-js keeps the session: its default key, named so the app can read it at launch. */
const AUTH_STORAGE_KEY = `sb-${new URL(env.supabaseUrl).hostname.split('.')[0]}-auth-token`;

export const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
  auth: {
    storage: mmkvStorage,
    storageKey: AUTH_STORAGE_KEY,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * The session saved on the device, read synchronously (MMKV), so a signed-in app starts on its
 * local data right away instead of waiting for supabase-js to refresh an expired access token,
 * which takes a round trip online and up to half a minute offline. supabase-js still refreshes
 * it, and signs out (SIGNED_OUT) only when the server rejects it.
 */
export function storedSession(): Session | null {
  try {
    const session = JSON.parse(mmkvStorage.getItem(AUTH_STORAGE_KEY) ?? 'null');
    return session?.access_token && session.refresh_token && session.user?.id ? session : null;
  } catch {
    return null;
  }
}

// Only refresh tokens while the app is in the foreground.
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
