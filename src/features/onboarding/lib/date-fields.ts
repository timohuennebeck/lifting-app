import { formatDate } from '@/shared/lib/format';

const SAMPLE_DATE = new Date(2001, 10, 22);
const SAMPLE_PARTS = { day: '22', month: '11', year: '2001' } as const;

/** The app language's order of day, month and year, as in "22.11.2001" or "11/22/2001". */
export function dateFieldOrder() {
  const text = formatDate(SAMPLE_DATE, { day: '2-digit', month: '2-digit', year: 'numeric' });
  return (['day', 'month', 'year'] as const)
    .slice()
    .sort((a, b) => text.indexOf(SAMPLE_PARTS[a]) - text.indexOf(SAMPLE_PARTS[b]));
}

/** "September", "September" or "setembro" for a month (1–12). */
export const formatMonthName = (month: number) =>
  formatDate(new Date(2000, month - 1, 1), { month: 'long' });
