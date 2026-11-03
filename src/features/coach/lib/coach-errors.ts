import type { TFunction } from 'i18next';

import { formatShortDate, formatTime } from '@/shared/lib/format';
import { showError } from '@/shared/stores/error-sheet-store';

import type { CoachError, CoachFailure } from './coach-client';

/** The error sheet for a question without an answer; the ones worth another try offer it. */
export function showCoachError(
  reason: Exclude<CoachFailure, 'consent' | 'chatGone'>,
  limit: CoachError['limit'],
  t: TFunction<'coach'>,
  retry: () => void,
) {
  const values = limit && {
    count: limit.count,
    time: formatTime(new Date(limit.retryAt)),
    date: formatShortDate(limit.retryAt),
  };
  showError({
    title: t(`errors.${reason}.title`),
    message: t(`errors.${reason}.message`, values ?? {}),
    onRetry: reason === 'offline' || reason === 'failed' ? retry : undefined,
  });
}
