function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable ${name}. See .env.example.`);
  return value;
}

export const env = {
  supabaseUrl: required('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabasePublishableKey: required(
    'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
  powerSyncUrl: required('EXPO_PUBLIC_POWERSYNC_URL', process.env.EXPO_PUBLIC_POWERSYNC_URL),
  // Optional: Google Sign-In's OAuth client IDs. Without them the Google button says it's not
  // available yet.
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  // Optional: RevenueCat's public iOS SDK key. Without it purchases are simulated.
  revenueCatIosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  // Optional: PostHog's project key (phc_…) and host. Without the key nothing is tracked.
  posthogKey: process.env.EXPO_PUBLIC_POSTHOG_KEY,
  posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
};
