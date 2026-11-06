// Reads the values of a workout file as other apps and spreadsheets write them: dates (ISO,
// 31.12.2025, 12/31/2025, "1 Nov 2025, 18:05", month names in the app's languages, Excel's day
// numbers, Unix time), durations ("1h 5m", "1:05:00") and numbers ("82,5 kg"). Times without a
// zone are the user's local time. Plain TypeScript, tested in values.test.ts.

/** How a sheet writes dates whose day and month are both numbers (read-history says). */
export type DayOrder = 'day_first' | 'month_first' | 'year_first';

/** Lower case without accents: "Mär" → "mar", "févr." → "fevr.". */
const fold = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Month names by their first three letters, in English, German, Portuguese, Spanish and French. */
const MONTHS: Record<string, number> = {
  jan: 0,
  ene: 0,
  feb: 1,
  fev: 1,
  mar: 2,
  mrz: 2,
  apr: 3,
  abr: 3,
  avr: 3,
  may: 4,
  mai: 4,
  jun: 5,
  jui: 5,
  jul: 6,
  aug: 7,
  ago: 7,
  aou: 7,
  sep: 8,
  set: 8,
  oct: 9,
  okt: 9,
  out: 9,
  nov: 10,
  dec: 11,
  dez: 11,
  dic: 11,
};

/** The month a word names, if any; French "juin" and "juil." need their fourth letter. */
function monthOf(word: string) {
  const w = fold(word).replace(/\.$/, '');
  if (w.length < 3) return undefined;
  if (w.startsWith('juil')) return 6;
  if (w.startsWith('juin')) return 5;
  if (w.startsWith('janv')) return 0;
  const month = MONTHS[w.slice(0, 3)];
  // A month's name, not a word that starts like one ("set" is September only alone or "setembro").
  return month !== undefined && /^[a-z]+$/.test(w) ? month : undefined;
}

const DAY_MS = 86_400_000;
/** Excel counts days from 30 Dec 1899. */
const EXCEL_EPOCH = Date.UTC(1899, 11, 30);

/** A date from parts, or null when they make none (31 February, a year far off). */
function make(year: number, month: number, day: number, hour = 0, minute = 0, second = 0) {
  const fullYear = year < 100 ? 2000 + year : year;
  if (fullYear < 1990 || fullYear > 2100 || month < 0 || month > 11) return null;
  if (day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) return null;
  const date = new Date(fullYear, month, day, hour, minute, second);
  return date.getMonth() === month ? date : null;
}

/** "18:05", "6:05 PM", "18.05" after a date: hours, minutes, seconds; zero when there is none. */
function timeOf(text: string) {
  const match = text.match(/(\d{1,2})[:.](\d{2})(?::(\d{2}))?\s*([ap]\.?m\.?)?/i);
  if (!match) return [0, 0, 0];
  let hour = Number(match[1]);
  const meridiem = match[4]?.toLowerCase()[0];
  if (meridiem === 'p' && hour < 12) hour += 12;
  if (meridiem === 'a' && hour === 12) hour = 0;
  return [hour, Number(match[2]), Number(match[3] ?? 0)];
}

/**
 * The date and time `raw` writes, or null. `order` settles 03/04/2025: day first unless it says
 * otherwise, or a number over 12 tells.
 */
export function parseDate(raw: string, order: DayOrder | null = null): Date | null {
  const text = raw.trim();
  if (!text) return null;

  // A number alone: Excel's day number, or Unix time in seconds or milliseconds.
  if (/^\d+(\.\d+)?$/.test(text)) {
    const value = Number(text);
    if (value > 20_000 && value < 80_000) {
      // Excel's days are local dates: read the UTC parts back as local time.
      const utc = new Date(EXCEL_EPOCH + Math.round((value * DAY_MS) / 1000) * 1000);
      return make(
        utc.getUTCFullYear(),
        utc.getUTCMonth(),
        utc.getUTCDate(),
        utc.getUTCHours(),
        utc.getUTCMinutes(),
        utc.getUTCSeconds(),
      );
    }
    if (value > 1e9 && value < 1e10) return new Date(value * 1000);
    if (value > 1e12 && value < 1e13) return new Date(value);
    return null;
  }

  // ISO: 2025-11-01, 2025-11-01 18:05:00, 2025-11-01T18:05:00Z (a zone: that moment).
  const iso = text.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?(\.\d+)?\s*(Z|[+-]\d{2}:?\d{2})?/i,
  );
  if (iso) {
    if (iso[8]) {
      const zoned = Date.parse(text.replace(' ', 'T'));
      return Number.isNaN(zoned) ? null : new Date(zoned);
    }
    return make(+iso[1], +iso[2] - 1, +iso[3], +(iso[4] ?? 0), +(iso[5] ?? 0), +(iso[6] ?? 0));
  }

  // A month by name: "1 Nov 2025, 18:05", "Nov 1, 2025 6:05 PM", "Mo., 3. November 2025".
  const words = text.match(/\p{L}+\.?/gu) ?? [];
  const month = words.map(monthOf).find((m) => m !== undefined);
  if (month !== undefined) {
    const dateText = text.replace(/\d{1,2}[:.]\d{2}(?::\d{2})?\s*([ap]\.?m\.?)?/i, ' ');
    const numbers = (dateText.match(/\d+/g) ?? []).map(Number);
    const year = numbers.find((n) => n >= 1000) ?? new Date().getFullYear();
    const day = numbers.find((n) => n >= 1 && n <= 31);
    if (day === undefined) return null;
    const [h, m, s] = timeOf(text);
    return make(year, month, day, h, m, s);
  }

  // Numbers only: 31.12.2025, 12/31/2025, 2025/12/31, 31-12-25, with a time after; a weekday
  // before is left out ("Mo., 3.11.2025").
  const parts = text
    .replace(/^\p{L}+\.?,?\s*/u, '')
    .match(/^(\d{1,4})[./-](\d{1,2})[./-](\d{1,4})(.*)$/);
  if (!parts) return null;
  const [a, b, c] = [+parts[1], +parts[2], +parts[3]];
  const [h, m, s] = timeOf(parts[4]);
  if (parts[1].length === 4 || order === 'year_first') return make(a, b - 1, c, h, m, s);
  const monthFirst = b > 12 || (order === 'month_first' && a <= 12);
  return monthFirst ? make(c, a - 1, b, h, m, s) : make(c, b - 1, a, h, m, s);
}

/**
 * A number as written: "82,5", "82.5 kg", "1,234.5"; null when there is none. The last "." or ","
 * is the decimal mark (weights and reps don't reach thousands), any before it separate thousands.
 */
export function parseNumber(raw: string): number | null {
  const match = raw.replace(/\s/g, '').match(/-?\d+(?:[.,]\d+)*/);
  if (!match) return null;
  const text = match[0];
  const lastSep = Math.max(text.lastIndexOf('.'), text.lastIndexOf(','));
  const value = Number(
    lastSep < 0
      ? text
      : `${text.slice(0, lastSep).replace(/[.,]/g, '')}.${text.slice(lastSep + 1)}`,
  );
  return Number.isFinite(value) ? value : null;
}

/** Minutes a duration writes: "1h 5m", "65 min", "1:05:00", "01:05", "3900" (seconds). */
export function parseMinutes(raw: string): number | null {
  const text = fold(raw.trim());
  if (!text) return null;
  const clock = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (clock) {
    return clock[3] !== undefined
      ? +clock[1] * 60 + +clock[2] + +clock[3] / 60
      : +clock[1] * 60 + +clock[2];
  }
  const hours = text.match(/(\d+(?:[.,]\d+)?)\s*(h|std|hr|hour)/);
  const minutes = text.match(/(\d+)\s*(m(?!s)|min)/);
  const seconds = text.match(/(\d+)\s*(s|sec|sek)\b/);
  if (hours || minutes || seconds) {
    return (
      (hours ? Number(hours[1].replace(',', '.')) * 60 : 0) +
      (minutes ? Number(minutes[1]) : 0) +
      (seconds ? Number(seconds[1]) / 60 : 0)
    );
  }
  const value = parseNumber(text);
  if (value == null || value <= 0) return null;
  // A plain number: minutes up to 10 hours, else seconds.
  return value > 600 ? value / 60 : value;
}
