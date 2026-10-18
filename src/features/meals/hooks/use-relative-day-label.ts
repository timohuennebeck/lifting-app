import { useTranslation } from 'react-i18next';

import { useDayLabel } from '@/shared/hooks/use-day-label';
import { useToday } from '@/shared/hooks/use-today';
import { fromIsoDate, toIsoDate } from '@/shared/lib/date';
import { formatShortDate } from '@/shared/lib/format';

import { shiftDay } from '../lib/intake';

/** "Heute, 18. Okt.", "Gestern, 17. Okt." or "Do, 16. Okt." for an ISO date. */
export function useRelativeDayLabel() {
  const { t } = useTranslation('meals');
  const dayLabel = useDayLabel();
  const today = toIsoDate(new Date(useToday()));
  return (iso: string) => {
    const date = formatShortDate(fromIsoDate(iso));
    if (iso === today) return t('today', { date });
    if (iso === shiftDay(today, -1)) return t('yesterday', { date });
    return dayLabel(iso);
  };
}
