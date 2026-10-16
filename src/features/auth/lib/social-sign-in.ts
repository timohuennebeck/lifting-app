import { Platform } from 'react-native';

import { signInWithApple } from './apple-sign-in';
import { signInWithGoogle } from './google-sign-in';

export type SocialProvider = 'google' | 'apple';

/** Sign in with Apple only exists on Apple devices; elsewhere the button isn't shown. */
export const appleSignInAvailable = Platform.OS === 'ios';

/** The provider's own sign-in, then a Supabase session; null when the user cancels. */
export const signInWith = (provider: SocialProvider) =>
  provider === 'google' ? signInWithGoogle() : signInWithApple();
