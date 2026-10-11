import { Platform } from 'react-native';

import { signInWithApple } from './apple-sign-in';
import { googleSignInReady, signInWithGoogle } from './google-sign-in';

export type SocialProvider = 'google' | 'apple';

/** Sign in with Apple only exists on Apple devices; elsewhere the button isn't shown. */
export const appleSignInAvailable = Platform.OS === 'ios';

/** Whether a provider's button signs in, rather than saying it isn't available yet. */
export const providerReady = (provider: SocialProvider) =>
  provider === 'google' ? googleSignInReady : appleSignInAvailable;

/** The provider's own sign-in, then a Supabase session; null when the user cancels. */
export const signInWith = (provider: SocialProvider) =>
  provider === 'google' ? signInWithGoogle() : signInWithApple();
