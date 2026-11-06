import Constants from 'expo-constants';
import * as StoreReview from 'expo-store-review';

import { parseJson } from '@/shared/data/json';
import { DAY_MS } from '@/shared/lib/date';
import { track } from '@/shared/lib/posthog';
import { storage } from '@/shared/lib/storage';

/** The device's last ask: when, and in which app version. */
interface LastAsk {
  at: number;
  version: string;
}

const LAST_ASK_KEY = 'review.lastAsk';
/** Finished workouts, and days since the first, before the first ask. */
const MIN_WORKOUTS = 5;
const MIN_DAYS_USED = 7;
/** Days between two asks; the stores cap them too (iOS: 3 shown per 365 days). */
const MIN_DAYS_BETWEEN = 120;
/** Workout counts that are worth an ask without a new record. */
const MILESTONES = new Set([5, 10, 25, 50, 100, 200]);
/** Waits for the story to close, so the prompt opens over the home tab. */
const DELAY_MS = 800;

interface ReviewMoment {
  /** Finished workouts, the one just finished included. */
  workoutCount: number;
  /** When the first workout started (ISO); null without one. */
  firstStartedAt: string | null;
  /** New records in the workout just finished. */
  recordCount: number;
}

const version = () => Constants.expoConfig?.version ?? '';

const lastAsk = () => parseJson<LastAsk | null>(storage.getString(LAST_ASK_KEY), null);

/**
 * Whether to ask now: the app used for a while, a workout worth it (a new record or a milestone),
 * and no ask in this app version or in the last `MIN_DAYS_BETWEEN` days.
 */
function shouldAsk({ workoutCount, firstStartedAt, recordCount }: ReviewMoment, now: number) {
  if (workoutCount < MIN_WORKOUTS || !firstStartedAt) return false;
  if (now - new Date(firstStartedAt).getTime() < MIN_DAYS_USED * DAY_MS) return false;
  if (recordCount === 0 && !MILESTONES.has(workoutCount)) return false;
  const last = lastAsk();
  if (!last) return true;
  return last.version !== version() && now - last.at >= MIN_DAYS_BETWEEN * DAY_MS;
}

/**
 * After the story of a finished workout closes: opens the store's own review prompt when
 * `shouldAsk` allows. The store decides whether it shows, so only the ask is recorded and tracked.
 */
export function requestReviewAfterWorkout(moment: ReviewMoment) {
  const now = Date.now();
  if (!shouldAsk(moment, now)) return;
  storage.set(LAST_ASK_KEY, JSON.stringify({ at: now, version: version() } satisfies LastAsk));
  setTimeout(() => {
    void ask(moment);
  }, DELAY_MS);
}

async function ask({ workoutCount, recordCount }: ReviewMoment) {
  try {
    if (!(await StoreReview.isAvailableAsync())) return;
    await StoreReview.requestReview();
    track('review:request', { workout_count: workoutCount, record_count: recordCount });
  } catch (error) {
    console.warn('Requesting a store review failed', error);
  }
}
