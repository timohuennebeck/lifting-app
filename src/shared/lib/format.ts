import { i18n } from '@/shared/i18n';

export type UnitSystem = 'metric' | 'imperial';

const KG_PER_LB = 0.45359237;

export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const lbToKg = (lb: number) => lb * KG_PER_LB;

export function formatNumber(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat(i18n.language, { maximumFractionDigits }).format(value);
}

/** Formats a kg value in the user's unit system, e.g. "82,5 kg" or "182 lb". */
export function formatWeight(kg: number, units: UnitSystem = 'metric') {
  return units === 'imperial'
    ? `${formatNumber(Math.round(kgToLb(kg)), 0)} lb`
    : `${formatNumber(kg, 2)} kg`;
}

export function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

export function formatDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(i18n.language, options).format(date);
}

/** Monday-based weekday index (0 = Monday … 6 = Sunday). */
export const mondayIndex = (date: Date) => (date.getDay() + 6) % 7;
