import { i18n } from '@/shared/i18n';

export type UnitSystem = 'metric' | 'imperial';

const KG_PER_LB = 0.45359237;
export const CM_PER_INCH = 2.54;

export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const lbToKg = (lb: number) => lb * KG_PER_LB;

// Intl formatters are costly to build and this runs per set row on every keypad press.
const numberFormats = new Map<string, Intl.NumberFormat>();

export function formatNumber(value: number, maximumFractionDigits = 1) {
  const key = `${i18n.language}|${maximumFractionDigits}`;
  let format = numberFormats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(i18n.language, { maximumFractionDigits });
    numberFormats.set(key, format);
  }
  return format.format(value);
}

/** Formats a kg value in the user's unit system, e.g. "82,5 kg" or "182 lb". */
export function formatWeight(kg: number, units: UnitSystem = 'metric') {
  return units === 'imperial'
    ? `${formatNumber(Math.round(kgToLb(kg)), 0)} lb`
    : `${formatNumber(kg, 2)} kg`;
}

/** A logged set, e.g. "60 kg × 8". */
export const formatSet = (kg: number, reps: number, units: UnitSystem) =>
  `${formatWeight(kg, units)} × ${reps}`;

/** "8" or "8–10". */
export const formatRepRange = (min: number, max: number) =>
  min === max ? `${min}` : `${min}–${max}`;

/** 70 → 5′10″ */
export function feetInches(totalInches: number) {
  const inches = Math.round(totalInches);
  return `${Math.floor(inches / 12)}′${inches % 12}″`;
}

/** "178 cm" or "5′10″" depending on the unit system. */
export function formatHeight(cm: number, units: UnitSystem) {
  return units === 'imperial' ? feetInches(cm / CM_PER_INCH) : `${Math.round(cm)} cm`;
}

export function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

/** Elapsed clock that always shows hours, e.g. "0:07:20". */
export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  return `${h}:${m}:${String(s % 60).padStart(2, '0')}`;
}

export function formatDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(i18n.language, options).format(date);
}

/** "8 Oct" */
export const formatShortDate = (date: Date | number | string) =>
  formatDate(new Date(date), { day: 'numeric', month: 'short' });

/** "Wed, 8 Oct" */
export const formatWeekdayDate = (date: Date) =>
  formatDate(date, { weekday: 'short', day: 'numeric', month: 'short' });
