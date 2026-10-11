import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

import { env } from '@/shared/config/env';
import { supabase } from '@/shared/data/supabase';

/**
 * Whether Google Sign-In is set up (OAuth client IDs in .env, README). iOS also needs its own
 * client ID: the URL scheme made from it must be in the build, or signing in crashes the app.
 */
export const googleSignInReady =
  Platform.OS !== 'web' &&
  !!env.googleWebClientId &&
  (Platform.OS !== 'ios' || !!env.googleIosClientId);

let configured = false;

function configure() {
  if (configured) return;
  // The web client ID makes Google issue an ID token Supabase accepts.
  GoogleSignin.configure({
    webClientId: env.googleWebClientId,
    iosClientId: env.googleIosClientId,
  });
  configured = true;
}

/**
 * Google's account picker, then a Supabase session from the ID token it returns (a new account
 * the first time). Null when the user closes the picker.
 */
export async function signInWithGoogle() {
  configure();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (isCancelledResponse(response)) return null;
    const { idToken } = response.data;
    if (!idToken) throw new Error('Google returned no ID token');
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) throw error;
    return data.user;
  } catch (error) {
    // A second tap while the picker opens.
    if (isErrorWithCode(error) && error.code === statusCodes.IN_PROGRESS) return null;
    // Setup mistakes (client IDs, SHA-1, Supabase provider) only show up here.
    console.warn('Google sign-in failed', error);
    throw error;
  }
}

/** Forgets the Google account, so the next Google sign-in asks which one to use. */
export function signOutOfGoogle() {
  if (!googleSignInReady) return;
  configure();
  GoogleSignin.signOut().catch((error) => console.warn('Google sign-out failed', error));
}
