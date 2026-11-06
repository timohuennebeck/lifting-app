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
  'plan:generate_fail': PlanFailureProperties;
  /** The plan of a workout file read (read-plan). */
  'plan_import:read_complete': {
    exercise_count: number;
    /** Exercises the catalog doesn't have, created as the user's own. */
    unmatched_count: number;
    duration_ms: number;
  };
  'plan_import:read_fail': PlanFailureProperties;
  /** A workout file read: what it holds, and what the reading found. */
  'workout_import:read_complete': {
    kind: 'history' | 'plan' | 'both';
    /** Where the plan comes from: the file, the history (it had none) or nowhere. */
    plan_source: 'file' | 'history' | 'none';
    workout_count: number;
    set_count: number;
    /** Different exercise names in the history. */
    name_count: number;
    /** Names (and plan lines) the user is asked about. */
    review_count: number;
    duration_ms: number;
  };
  'workout_import:read_fail': PlanFailureProperties;
  /** An imported history saved; `added_count` leaves out workouts the account had already. */
  'workout_import:save_complete': { workout_count: number; added_count: number };
  'paywall:view': { placement: PaywallPlacement };
  'paywall:purchase_complete': { package: string; has_trial: boolean };
  'paywall:purchase_fail': { package: string; error_code: string; is_cancelled: boolean };
  /** An earlier purchase restored, which lets the user past the paywall too. */
  'paywall:restore_complete': Record<string, never>;
  'account:sign_up_complete': { method: AuthMethod };
  /** The account wasn't made; `error_code` is "generic" (the provider or the save failed). */
  'account:sign_up_fail': { method: AuthMethod; error_code: string };
  /**
   * Signed in to an existing account in the sign-in sheet. `is_onboarded`: false when its
   * onboarding wasn't finished, which then goes on and ends in `account:sign_up_complete`.
   */
  'account:sign_in_complete': { method: AuthMethod; is_onboarded: boolean };
  'workout:start': WorkoutProperties;
  'workout:finish': WorkoutProperties & {
    duration_min: number;
    completed_set_count: number;
    planned_set_count: number;
    pr_count: number;
  };
  'workout:discard': { duration_min: number; completed_set_count: number };
  /** The store's review prompt asked for; the store decides whether it shows. */
  'review:request': { workout_count: number; record_count: number };
  /** A question to Kai sent (never its text). */
  'coach:question_submit': { is_new_chat: boolean };
  'coach:answer_complete': { is_new_chat: boolean; has_chart: boolean; duration_ms: number };
  /** No answer; `is_cancelled` when the user stopped it. */
  'coach:answer_fail': { is_new_chat: boolean; error_code: string; is_cancelled: boolean };
  /** The photos scored (never the scores). */
  'progress_check:assess_complete': { duration_ms: number };
  /** The photos couldn't be judged and go back to the camera. */
  'progress_check:assess_retake': { issue_count: number };
  'progress_check:assess_fail': { error_code: string };
  /** A day's body weight saved (never the weight). */
  'weight:entry_save': { is_edit: boolean; is_today: boolean };
  /** Exercises said out loud added to a routine, a plan being imported or a new workout. */
  'voice:add_complete': {
    context: VoiceContext;
    exercise_count: number;
    unmatched_count: number;
    duration_ms: number;
  };
  'voice:add_fail': { context: VoiceContext; error_code: string };
}

/**
 * Why no plan came: `error_code` the reason the user is shown, `error_detail` where it broke
 * (e.g. "http_429_limit", "stream_incomplete", "client_TypeError").
 */
export interface PlanFailureProperties {
  error_code: string;
  error_detail: string;
}

export type VoiceContext = 'routine' | 'plan_import' | 'workout';

export type AnalyticsEvent = keyof AnalyticsEvents;

export type AuthMethod = 'apple' | 'google';

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

/** Ties the device's events, those from before sign-up too, to the account. */
export function identify(userId: string, person?: PersonProperties) {
  posthog?.identify(userId, person as Properties);
}

/** The id events are sent under now: anonymous before sign-up, the account's id after. */
export function analyticsId() {
  return posthog?.getDistinctId() ?? null;
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
