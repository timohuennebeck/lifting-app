import { useTranslation } from 'react-i18next';

import { daysInMonth, isoDate } from '@/shared/lib/date';
import { dateFieldOrder, formatMonthName } from '@/shared/lib/format';
import { clamp } from '@/shared/lib/math';

import { WheelGroup, WheelPicker } from './wheel-picker';

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export interface DateWheelProps {
  /** ISO date (YYYY-MM-DD). */
  value: string;
  onChange: (value: string) => void;
  /** First and last year on the year wheel. */
  minYear: number;
  maxYear: number;
  className?: string;
}

/**
 * Day, month and year wheels in the app language's order (14 | September | 1997, or month
 * first in English). The day follows a shorter month or a non-leap year (31 → 30, 29 or 28).
 */
export function DateWheel({ value, onChange, minYear, maxYear, className }: DateWheelProps) {
  const { t } = useTranslation();
  const [year, month, day] = value.split('-').map(Number);
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => String(minYear + i));
  const set = (y: number, m: number, d: number) =>
    onChange(isoDate(y, m, Math.min(d, daysInMonth(y, m))));

  const wheels = {
    day: (
      <WheelPicker
        key="day"
        items={DAYS.slice(0, daysInMonth(year, month))}
        index={day - 1}
        onChange={(i) => set(year, month, i + 1)}
        accessibilityLabel={t('dateWheel.day')}
        className="w-18"
      />
    ),
    month: (
      <WheelPicker
        key="month"
        items={MONTHS.map(formatMonthName)}
        index={month - 1}
        onChange={(i) => set(year, i + 1, day)}
        accessibilityLabel={t('dateWheel.month')}
        className="flex-1"
      />
    ),
    year: (
      <WheelPicker
        key="year"
        items={years}
        index={clamp(year - minYear, 0, years.length - 1)}
        onChange={(i) => set(minYear + i, month, day)}
        accessibilityLabel={t('dateWheel.year')}
        className="w-24"
      />
    ),
  };

  return (
    <WheelGroup className={className}>{dateFieldOrder().map((field) => wheels[field])}</WheelGroup>
  );
}
