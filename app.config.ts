import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * The two installs of the app, side by side on one phone: Loqqa Dev (`npm run ios`, the local
 * stack) unless APP_VARIANT is "production" (eas.json's production profile: TestFlight and the
 * App Store). Each has its own bundle ID, link scheme, widget extension and app group.
 */
const VARIANTS = {
  development: { name: 'Loqqa Dev', id: 'app.loqqa.mobile.dev', scheme: 'loqqa-dev' },
  production: { name: 'Loqqa', id: 'app.loqqa.mobile', scheme: 'loqqa' },
} as const;

/** What a production build needs; the RevenueCat key only on iOS, where purchases are real. */
const REQUIRED = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'EXPO_PUBLIC_POWERSYNC_URL',
];
const REQUIRED_IOS = ['EXPO_PUBLIC_REVENUECAT_IOS_KEY'];
/** An address that only works on this computer or its network, or without TLS. */
const LOCAL = /^http:\/\/|\/\/(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;

/**
 * Stops a production build made with the local settings: a local Supabase or PowerSync address
 * fails it anywhere, missing values on EAS's build machines (where the "production"
 * environment's variables are set).
 */
function checkProductionEnv() {
  const problems: string[] = [];
  for (const name of ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_POWERSYNC_URL']) {
    const value = process.env[name];
    if (value && LOCAL.test(value)) problems.push(`${name} is a local address (${value})`);
  }
  if (process.env.EAS_BUILD === 'true') {
    const required =
      process.env.EAS_BUILD_PLATFORM === 'ios' ? [...REQUIRED, ...REQUIRED_IOS] : REQUIRED;
    for (const name of required) if (!process.env[name]) problems.push(`${name} is not set`);
  }
  if (problems.length) {
    throw new Error(
      `A production build with the wrong settings:\n- ${problems.join('\n- ')}\n` +
        'Production values belong in EAS (environment "production"), not in a local .env file.',
    );
  }
}

/**
 * app.json plus what comes from the environment. Google Sign-In on iOS needs the iOS OAuth client
 * ID, reversed, as a URL scheme. It goes in `ios.scheme`, which Expo merges with the app's own
 * scheme; the Google Sign-In plugin's way of adding it is overwritten by that merge.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const production = process.env.APP_VARIANT === 'production';
  const variant = production ? VARIANTS.production : VARIANTS.development;
  if (production) checkProductionEnv();

  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const googleScheme = iosClientId
    ? `com.googleusercontent.apps.${iosClientId.replace('.apps.googleusercontent.com', '')}`
    : null;
  // The widget extension's ID starts with the app's, and the app group goes with it.
  const plugins: ExpoConfig['plugins'] = (config.plugins ?? []).map((plugin) =>
    Array.isArray(plugin) && plugin[0] === 'expo-widgets'
      ? ([
          plugin[0],
          {
            ...plugin[1],
            bundleIdentifier: `${variant.id}.widgets`,
            groupIdentifier: `group.${variant.id}`,
          },
        ] as [string, unknown])
      : plugin,
  );
  return {
    ...(config as ExpoConfig),
    name: variant.name,
    scheme: variant.scheme,
    plugins,
    ios: {
      ...config.ios,
      bundleIdentifier: variant.id,
      ...(googleScheme ? { scheme: googleScheme } : {}),
    },
    android: { ...config.android, package: variant.id },
  };
};
