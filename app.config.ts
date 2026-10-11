import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * app.json plus what comes from .env: Google Sign-In on iOS needs the iOS OAuth client ID,
 * reversed, as a URL scheme. It goes in `ios.scheme`, which Expo merges with the app's own
 * scheme; the Google Sign-In plugin's way of adding it is overwritten by that merge.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const googleScheme = iosClientId
    ? `com.googleusercontent.apps.${iosClientId.replace('.apps.googleusercontent.com', '')}`
    : null;
  return {
    ...(config as ExpoConfig),
    ios: { ...config.ios, ...(googleScheme ? { scheme: googleScheme } : {}) },
  };
};
