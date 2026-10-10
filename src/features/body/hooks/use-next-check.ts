import { useBodyChecks } from '@/features/body-check/data/body-checks';
import { isBodyCheckAge, MIN_CHECK_GAP_DAYS } from '@/features/body-check/lib/eligibility';
import { DEFAULT_BODY_CHECK_INTERVAL, useProfile } from '@/shared/data/profile';
import { useNow } from '@/shared/hooks/use-now';
import { DAY_MS, MINUTE_MS } from '@/shared/lib/date';

/**
 * The checks so far and when the next one is due, by the user's rhythm (only once there is a
 * first one). A check can start early, but not within MIN_CHECK_GAP_DAYS of the last one.
 */
export function useNextCheck() {
  const { data: checks = [] } = useBodyChecks();
  const { profile } = useProfile();
  const now = useNow(MINUTE_MS);
  const allowed = isBodyCheckAge(profile?.age);
  const interval = profile?.bodyCheckIntervalDays ?? DEFAULT_BODY_CHECK_INTERVAL;
  const latest = checks[checks.length - 1];
  const last = latest ? Date.parse(latest.createdAt) : 0;
  const dueAt = latest ? last + interval * DAY_MS : 0;
  const earliestAt = latest ? last + MIN_CHECK_GAP_DAYS * DAY_MS : 0;
  return {
    checks,
    /** False for under-18s: no new checks. */
    allowed,
    interval,
    dueAt,
    due: allowed && !!latest && now >= dueAt,
    /** When an early check is possible. */
    earliestAt,
    canStart: allowed && now >= earliestAt,
    daysLeft: Math.ceil((dueAt - now) / DAY_MS),
  };
}
