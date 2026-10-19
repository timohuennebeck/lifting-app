import PostHog from 'posthog-react-native';

import { env } from '@/shared/config/env';
import { mmkvStorage } from '@/shared/lib/storage';

/**
 * Every event the app sends to PostHog, named `category:object_action`, with its properties.
 * Health data (body weight, height, progress photos and their scores), names, email, the birth
 * date and free text never go out.
 */
export interface AnalyticsEvents {
  /** "Los geht's" on the welcome screen. */
  'onboarding:flow_start': Record<string, never>;
  'plan:generate_complete': {
    duration_ms: number;
    sessions_per_week: number;
    /** The split asked for; "auto" when the AI picked one. */
    split: string;
    routine_count: number;
  };
  'plan:generate_fail': { error_code: string };
  'plan_import:read_complete': {
    source: 'photos' | 'file';
    exercise_count: number;
    /** Exercises the catalog doesn't have, created as the user's own. */
    unmatched_count: number;
    duration_ms: number;
  };
  'plan_import:read_fail': { source: 'photos' | 'file'; error_code: string };
  'paywall:view': { placement: PaywallPlacement };
  'paywall:purchase_complete': { package: string; has_trial: boolean };
  'paywall:purchase_fail': { package: string; error_code: string; is_cancelled: boolean };
  'account:sign_up_complete': { method: 'apple' | 'google' | 'email' };
  'workout:start': WorkoutProperties;
  'workout:finish': WorkoutProperties & {
    duration_min: number;
    completed_set_count: number;
    planned_set_count: number;
    pr_count: number;
  };
  'workout:discard': { duration_min: number; completed_set_count: number };
}

export type AnalyticsEvent = keyof AnalyticsEvents;

/** Where the paywall shows: in onboarding, opened in the app, or in front of a locked app. */
export type PaywallPlacement = 'onboarding' | 'in_app' | 'locked';

export interface WorkoutProperties {
  /** From a plan's routine, a routine of its own, or put together on the spot. */
  source: 'plan' | 'single' | 'empty';
  /** The user's first workout. */
  is_first: boolean;
  /** Week of the plan's block (1 = first); null outside a plan with blocks. */
  block_week: number | null;
  is_deload: boolean;
  exercise_count: number;
}

/** What PostHog knows about a person: their answers and plan, never body data. */
export interface PersonProperties {
  goal: string | null;
  experience: string | null;
  sessions_per_week: number | null;
  split: string | null;
  equipment: string | null;
  language: string | null;
  unit_preference: string;
  /** "18–24", "25–34", …; null without a birth date. */
  age_group: string | null;
  is_pro: boolean;
}

/** The client; null without a project key (tests, local builds without analytics). */
export const posthog = env.posthogKey
  ? new PostHog(env.posthogKey, {
      host: env.posthogHost,
      // Its ids and queued events live in MMKV like the app's other state.
      customStorage: mmkvStorage,
      // Anonymous onboarding events join the person once the account is identified.
      personProfiles: 'identified_only',
      errorTracking: { autocapture: { uncaughtExceptions: true, unhandledRejections: true } },
    })
  : null;

type Properties = Parameters<PostHog['capture']>[1];

/** Sends an event, typed by `AnalyticsEvents`. */
export function track<E extends AnalyticsEvent>(
  event: E,
  ...[properties]: AnalyticsEvents[E] extends Record<string, never> ? [] : [AnalyticsEvents[E]]
) {
  posthog?.capture(event, properties as Properties);
}

/** A handled error worth seeing in PostHog's error tracking, with what was going on. */
export function trackError(error: unknown, context: Record<string, string | number | boolean>) {
  posthog?.captureException(error, context);
}

/** Ties the device's events, those from before sign-up too, to the account. */
export function identify(userId: string, person?: PersonProperties) {
  posthog?.identify(userId, person as Properties);
}

/** A new anonymous id after sign-out, so the next account starts clean. */
export function resetAnalytics() {
  posthog?.reset();
}

let lastScreen: string | null = null;

/**
 * The screen a route is, e.g. "/workout/[id]" (groups left out, so ids don't make new names);
 * once per change, also when the route's groups settle after launch.
 */
export function trackScreen(segments: string[]) {
  const name = `/${segments.filter((s) => !s.startsWith('(')).join('/')}`;
  if (name === lastScreen) return;
  lastScreen = name;
  void posthog?.screen(name);
}

/** Age bands for analytics, from the age in years. */
export function ageGroupOf(age: number | null) {
  if (age === null) return null;
  if (age < 18) return 'under-18';
  if (age < 25) return '18–24';
  if (age < 35) return '25–34';
  if (age < 45) return '35–44';
  if (age < 55) return '45–54';
  return '55+';
}
