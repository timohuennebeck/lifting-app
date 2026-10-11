import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * app.json plus what comes from .env: Google Sign-In on iOS needs the iOS OAuth client ID,
 * reversed, as a URL scheme. Without the ID the plugin stays out and the app shows Google as
 * not available yet.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const iosUrlScheme = iosClientId
    ? `com.googleusercontent.apps.${iosClientId.replace('.apps.googleusercontent.com', '')}`
    : null;
  return {
    ...(config as ExpoConfig),
    plugins: [
      ...(config.plugins ?? []),
      ...(iosUrlScheme ? [['@react-native-google-signin/google-signin', { iosUrlScheme }]] : []),
    ],
  } as ExpoConfig;
};
