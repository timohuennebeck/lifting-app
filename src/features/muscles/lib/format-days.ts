import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format';

/**
 * A day, "22. Okt.", or days, "16.–22. Okt.", in the app language; the year only when it isn't
 * this one. Without `formatRange` in the JS engine the two dates are written out in full.
 */
export function formatDays(from: number, to: number) {
  if (from === to) return formatShortDate(from);
  const thisYear = new Date().getFullYear();
  const otherYear =
    new Date(from).getFullYear() !== thisYear || new Date(to).getFullYear() !== thisYear;
  const format = new Intl.DateTimeFormat(i18n.language, {
    day: 'numeric',
    month: 'short',
    ...(otherYear && { year: 'numeric' }),
  });
  if (typeof format.formatRange === 'function') return format.formatRange(from, to);
  return `${formatShortDate(from)}–${formatShortDate(to)}`;
}
