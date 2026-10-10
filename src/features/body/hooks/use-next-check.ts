import { useBodyChecks } from '@/features/body-check/data/body-checks';
import { useNow } from '@/shared/hooks/use-now';
import { DAY_MS, MINUTE_MS } from '@/shared/lib/date';

/** A new check is due this many days after the last one. */
const CHECK_INTERVAL_DAYS = 21;

/** The checks so far and when the next one is due (only once there is a first one). */
export function useNextCheck() {
  const { data: checks = [] } = useBodyChecks();
  const now = useNow(MINUTE_MS);
  const latest = checks[checks.length - 1];
  const dueAt = latest ? Date.parse(latest.createdAt) + CHECK_INTERVAL_DAYS * DAY_MS : 0;
  return {
    checks,
    dueAt,
    due: !!latest && now >= dueAt,
    daysLeft: Math.ceil((dueAt - now) / DAY_MS),
  };
}
