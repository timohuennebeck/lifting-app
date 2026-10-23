import type { User } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { supabase } from '@/shared/data/supabase';

import { signInWithApple } from './apple-sign-in';
import { signInWithGoogle, signOutOfGoogle } from './google-sign-in';

export type SocialProvider = 'google' | 'apple';

/** Sign in with Apple only exists on Apple devices; elsewhere the button isn't shown. */
export const appleSignInAvailable = Platform.OS === 'ios';

/** The provider's own sign-in, then a Supabase session; null when the user cancels. */
export const signInWith = (provider: SocialProvider) =>
  provider === 'google' ? signInWithGoogle() : signInWithApple();

/** Supabase creates the user and signs it in in one request; seconds apart at most. */
const NEW_ACCOUNT_MS = 10_000;

/**
 * Whether this sign-in just created the account (a Google or Apple sign-in does that for an
 * unknown user). Compares the server's own times, so the device clock doesn't matter.
 */
export function isNewAccount(user: User) {
  if (!user.last_sign_in_at) return false;
  return Date.parse(user.last_sign_in_at) - Date.parse(user.created_at) < NEW_ACCOUNT_MS;
}

/**
 * Deletes an account the sign-in just created, which holds nothing yet, and signs out on this
 * device; Google forgets the account picked, so the next sign-in asks again.
 */
export async function discardNewAccount(provider: SocialProvider) {
  const { error } = await supabase.rpc('delete_own_account');
  if (error) throw error;
  await supabase.auth.signOut({ scope: 'local' });
  if (provider === 'google') signOutOfGoogle();
}
