import { useTranslation } from 'react-i18next';

import { fromIsoDate, mondayIndex } from '@/shared/lib/date';
import { formatShortDate } from '@/shared/lib/format';

/** "So, 11. Okt.": the app's short weekday (without Intl's dot) and the day. */
export function useDayLabel() {
  const { t } = useTranslation();
  const weekdays = t('weekdays.short', { returnObjects: true }) as string[];
  return (iso: string) => {
    const date = fromIsoDate(iso);
    return `${weekdays[mondayIndex(date)]}, ${formatShortDate(date)}`;
  };
}
