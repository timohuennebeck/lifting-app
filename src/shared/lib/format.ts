import { i18n } from '@/shared/i18n';
import { getOrInsert } from '@/shared/lib/map';

export type UnitSystem = 'metric' | 'imperial';

const KG_PER_LB = 0.45359237;

/** Between a number and its unit, so a line never breaks between them. */
const NBSP = '\u00a0';

/** The weight unit's label, "kg" or "lb", the same in every app language. */
export const weightUnit = (units: UnitSystem) => (units === 'imperial' ? 'lb' : 'kg');

export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const lbToKg = (lb: number) => lb * KG_PER_LB;

// Intl formatters are costly to build and this runs per set row on every keypad press.
const numberFormats = new Map<string, Intl.NumberFormat>();

export function formatNumber(value: number, maximumFractionDigits = 1, minimumFractionDigits = 0) {
  const format = getOrInsert(
    numberFormats,
    `${i18n.language}|${maximumFractionDigits}|${minimumFractionDigits}`,
    () => new Intl.NumberFormat(i18n.language, { maximumFractionDigits, minimumFractionDigits }),
  );
  return format.format(value);
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

/** kg → value shown in the user's unit (lb rounded to 0.5). */
export const toDisplayWeight = (kg: number, units: UnitSystem) =>
  units === 'imperial' ? roundTo(kgToLb(kg), 0.5) : roundTo(kg, 0.01);

export const fromDisplayWeight = (value: number, units: UnitSystem) =>
  units === 'imperial' ? lbToKg(value) : value;

/** "60" / "57,5" in display units, without the unit label. */
export const formatWeightValue = (kg: number, units: UnitSystem) =>
  formatNumber(toDisplayWeight(kg, units), 2);

/** Formats a kg value in the user's unit system, e.g. "82,5 kg" or "182,5 lb". */
export const formatWeight = (kg: number, units: UnitSystem) =>
  `${formatWeightValue(kg, units)}${NBSP}${weightUnit(units)}`;

/** A volume total (weight × reps), whole, in the user's unit: "4,250 kg" or "9,370 lb". */
export const formatVolume = (kg: number, units: UnitSystem) =>
  `${formatNumber(units === 'imperial' ? kgToLb(kg) : kg, 0)} ${weightUnit(units)}`;

/** What a set holds; measures the exercise doesn't use are null. Shown with `formatSet`. */
export interface SetValues {
  weightKg: number | null;
  reps: number | null;
  seconds: number | null;
}

export const formatSeconds = (seconds: number) =>
  `${formatNumber(seconds, 0)}${NBSP}${i18n.t('common:units.sec')}`;

/** "8 Wdh.", "8–10 Wdh." or "8+ Wdh." (a count or range with the unit), or "30–45 s". */
const withUnit = (range: string, timed: boolean, count?: number) =>
  timed
    ? `${range} ${i18n.t('common:units.sec')}`
    : count !== undefined
      ? i18n.t('common:units.reps', { count })
      : i18n.t('common:units.repRange', { range });

/**
 * A target with its unit, for overviews: "8–10 Wdh." / "8 Wdh.", "8+ Wdh." with only a minimum,
 * "max. 12 Wdh." with only a maximum; seconds for timed exercises ("30–45 s"). Null without
 * either.
 */
export function formatTargetLabel(min: number | null, max: number | null, timed: boolean) {
  if (min != null && max != null) {
    return min === max ? withUnit(`${min}`, timed, min) : withUnit(`${min}–${max}`, timed);
  }
  if (min != null) return withUnit(`${min}+`, timed);
  if (max != null) return i18n.t('common:units.atMost', { value: withUnit(`${max}`, timed, max) });
  return null;
}

/** "1:30" or "1:02:05"; `alwaysHours` makes an elapsed clock like "0:07:20". */
export function formatDuration(totalSeconds: number, { alwaysHours = false } = {}) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h || alwaysHours ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

const dateFormats = new Map<string, Intl.DateTimeFormat>();

export function formatDate(date: Date, options: Intl.DateTimeFormatOptions) {
  const format = getOrInsert(
    dateFormats,
    `${i18n.language}|${JSON.stringify(options)}`,
    () => new Intl.DateTimeFormat(i18n.language, options),
  );
  return format.format(date);
}

/** "14:02" or "02:02 PM" */
export const formatTime = (date: Date) => formatDate(date, { hour: '2-digit', minute: '2-digit' });

/** "8 Oct", or "16 Aug 2025" for another year */
export function formatShortDate(date: Date | number | string) {
  const d = new Date(date);
  // Without the year a date from last year reads like one from this year.
  const otherYear = d.getFullYear() !== new Date().getFullYear();
  return formatDate(d, { day: 'numeric', month: 'short', ...(otherYear && { year: 'numeric' }) });
}

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

/** "14. September 2028", "September 14, 2028" or "14 de setembro de 2028" */
export const formatLongDate = (date: Date) =>
  formatDate(date, { day: 'numeric', month: 'long', year: 'numeric' });

/** "Wed, 8 Oct" */
export const formatWeekdayDate = (date: Date) =>
  formatDate(date, { weekday: 'short', day: 'numeric', month: 'short' });
