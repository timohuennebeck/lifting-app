import { AGE_RANGE, ageFrom } from '@/shared/data/profile';
import { formatDate } from '@/shared/lib/format';

// The birth date is typed as eight digits in the language's field order (14092010 or 09142010)
// and stored as an ISO date (YYYY-MM-DD).

export type DateField = 'day' | 'month' | 'year';

export const FIELD_DIGITS = { day: 2, month: 2, year: 4 } as const;
export const DATE_DIGITS = 8;

const SAMPLE = new Date(2001, 10, 22);
const SAMPLE_PARTS = { day: '22', month: '11', year: '2001' } as const;

/** The app language's field order and the mark between the fields ("22.11.2001", "11/22/2001"). */
export function dateLayout() {
  const text = formatDate(SAMPLE, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const fields = (['day', 'month', 'year'] as const)
    .slice()
    .sort((a, b) => text.indexOf(SAMPLE_PARTS[a]) - text.indexOf(SAMPLE_PARTS[b]));
  return { fields, separator: text.replace(/\d/g, '')[0] ?? '.' };
}

/** The typed digits per field; a field not reached yet is shorter or empty. */
export function splitDigits(digits: string, fields: readonly DateField[]) {
  const parts = { day: '', month: '', year: '' };
  let start = 0;
  for (const field of fields) {
    parts[field] = digits.slice(start, start + FIELD_DIGITS[field]);
    start += FIELD_DIGITS[field];
  }
  return parts;
}

/** A stored birth date as the digits typed for it. */
export function toDigits(birthDate: string, fields: readonly DateField[]) {
  const [year, month, day] = birthDate.split('-');
  const parts = { day, month, year };
  return fields.map((field) => parts[field]).join('');
}

export type BirthDateInput =
  | { status: 'incomplete' | 'invalid' | 'tooYoung' }
  | { status: 'valid'; birthDate: string; age: number };

/**
 * Reads the typed digits. A day or month that can't exist is invalid as soon as it is typed;
 * a complete date must be a real day and give an age within AGE_RANGE.
 */
export function readBirthDate(
  digits: string,
  fields: readonly DateField[],
  today = new Date(),
): BirthDateInput {
  const { day, month, year } = splitDigits(digits, fields);
  const d = Number(day);
  const m = Number(month);
  if ((day.length === 2 && (d < 1 || d > 31)) || (month.length === 2 && (m < 1 || m > 12))) {
    return { status: 'invalid' };
  }
  if (digits.length < DATE_DIGITS) return { status: 'incomplete' };
  // Date rolls a day past the month's end over into the next month (31.02. → 3 March).
  if (new Date(Number(year), m - 1, d).getDate() !== d) return { status: 'invalid' };
  const birthDate = `${year}-${month}-${day}`;
  const age = ageFrom(birthDate, today);
  // In the future or a typo like 1900 for 1990.
  if (age < 0 || age > AGE_RANGE.max) return { status: 'invalid' };
  if (age < AGE_RANGE.min) return { status: 'tooYoung' };
  return { status: 'valid', birthDate, age };
}
