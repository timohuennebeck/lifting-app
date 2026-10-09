import { i18n } from '@/shared/i18n';
import { getOrInsert } from '@/shared/lib/map';

export type UnitSystem = 'metric' | 'imperial';

const KG_PER_LB = 0.45359237;
export const CM_PER_INCH = 2.54;

/** Unit key for weights: `units.kg` or `units.lb` in the common namespace. */
export const weightUnit = (units: UnitSystem) => (units === 'imperial' ? 'lb' : 'kg');

export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const lbToKg = (lb: number) => lb * KG_PER_LB;

// Intl formatters are costly to build and this runs per set row on every keypad press.
const numberFormats = new Map<string, Intl.NumberFormat>();

export function formatNumber(value: number, maximumFractionDigits = 1) {
  const format = getOrInsert(
    numberFormats,
    `${i18n.language}|${maximumFractionDigits}`,
    () => new Intl.NumberFormat(i18n.language, { maximumFractionDigits }),
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
  `${formatWeightValue(kg, units)} ${weightUnit(units)}`;

/** A volume total (weight × reps) as a whole number in the user's unit, without the label. */
export const formatVolumeValue = (kg: number, units: UnitSystem) =>
  formatNumber(units === 'imperial' ? kgToLb(kg) : kg, 0);

/** A volume total in the user's unit, e.g. "4,250 kg" or "9,370 lb". */
export const formatVolume = (kg: number, units: UnitSystem) =>
  `${formatVolumeValue(kg, units)} ${weightUnit(units)}`;

/** What a set holds; measures the exercise doesn't use are null. */
export interface SetValues {
  weightKg: number | null;
  reps: number | null;
  seconds: number | null;
}

export const formatSeconds = (seconds: number) =>
  `${formatNumber(seconds, 0)} ${i18n.t('common:units.sec')}`;

/** A logged set: "60 kg × 8", "12 reps", "45 s" or "20 kg × 45 s". */
export function formatSet({ weightKg, reps, seconds }: SetValues, units: UnitSystem) {
  if (seconds != null) {
    return weightKg != null
      ? `${formatWeight(weightKg, units)} × ${formatSeconds(seconds)}`
      : formatSeconds(seconds);
  }
  return weightKg != null
    ? `${formatWeight(weightKg, units)} × ${reps ?? 0}`
    : i18n.t('common:units.reps', { count: reps ?? 0 });
}

/** "8" or "8–10". */
const formatRepRange = (min: number, max: number) => (min === max ? `${min}` : `${min}–${max}`);

/** A target: "8–10" reps, or "30–45 s" for timed exercises. */
export const formatTarget = (min: number, max: number, timed: boolean) =>
  timed ? `${formatRepRange(min, max)} ${i18n.t('common:units.sec')}` : formatRepRange(min, max);

/** A target with its unit, for overviews: "8–10 Wdh." / "8–10 reps", or "30–45 s". */
export const formatTargetLabel = (min: number, max: number, timed: boolean) =>
  timed
    ? formatTarget(min, max, true)
    : i18n.t('common:units.repRange', { range: formatRepRange(min, max) });

/** 70 → 5′10″ */
export function feetInches(totalInches: number) {
  const inches = Math.round(totalInches);
  return `${Math.floor(inches / 12)}′${inches % 12}″`;
}

/** "178 cm" or "5′10″" depending on the unit system. */
export function formatHeight(cm: number, units: UnitSystem) {
  return units === 'imperial' ? feetInches(cm / CM_PER_INCH) : `${Math.round(cm)} cm`;
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

/** "8 Oct" */
export const formatShortDate = (date: Date | number | string) =>
  formatDate(new Date(date), { day: 'numeric', month: 'short' });

/** "Wed, 8 Oct" */
export const formatWeekdayDate = (date: Date) =>
  formatDate(date, { weekday: 'short', day: 'numeric', month: 'short' });
