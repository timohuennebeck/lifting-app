// What a spreadsheet's sheet seems to hold, from its cells: a plan (days and exercises), a log of
// lifts, other numbers, text or nothing. Plain TypeScript, like workbook.ts.

import type { SheetCell, WorkbookSheet } from './workbook';

export type SheetKind =
  | { kind: 'plan'; days: number; exercises: number }
  | { kind: 'log'; entries: number }
  /** Numbers, but nothing that reads as an exercise (e.g. nutrition). */
  | { kind: 'other' }
  | { kind: 'text' }
  | { kind: 'empty' };

export type SheetSummary = SheetKind & { name: string };

/** Lower case, without accents and punctuation: "Bankdrücken (KH)" → "bankdrucken kh". */
export const fold = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Word parts gym exercises are named with, for exercises the catalog doesn't know by name. */
const STEMS = [
  // German
  'druck zieh ruder beuge heben klimmz fliegend presse strecker ausfallschritt stutz curl',
  // English
  'press squat deadlift pulldown pushdown extension crunch lunge raise thrust shrug plank',
  // Portuguese
  'supino agachamento remada rosca puxada levantamento elevacao afundo flexao prancha',
  'desenvolvimento panturrilha extensora flexora',
].flatMap((line) => line.split(' '));
/** Short ones only count as whole words ("row", not "throw"). */
const WORDS = new Set('row rows fly flys flyes dip dips pull pulls'.split(' '));

/** Training day headings: "Tag 1", "Day A: Push", "Montag", or a split's name on its own. */
const DAY_PREFIX =
  /^(tag|day|dia|training|trainingstag|workout|einheit|session|treino)( ?[0-9]{1,2}| [a-f])\b/;
const WEEKDAY =
  /^(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|monday|tuesday|wednesday|thursday|friday|saturday|sunday|segunda|terca|quarta|quinta|sexta|sabado|domingo)\b/;
const SPLITS = new Set(
  [
    'push|pull|legs|leg day|upper|lower|upper body|lower body|full body|fullbody|chest|back|arms',
    'beine|oberkorper|unterkorper|ganzkorper|brust|rucken|schultern|shoulders|arme',
    'peito|costas|pernas|ombros|bracos|superiores|inferiores',
  ].flatMap((line) => line.split('|')),
);

const isDayHeading = (folded: string) =>
  DAY_PREFIX.test(folded) ||
  WEEKDAY.test(folded) ||
  SPLITS.has(folded.replace(/ (day|tag|[a-d1-9])$/, ''));

/** Dates written as text: 12.10.2026, 12.10.26, 2026-10-12, 10/12/2026. */
const DATE_TEXT = /^(\d{1,2}\.\d{1,2}\.(\d{2}|\d{4})|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})/;
const isDate = (cell: SheetCell) => cell.type === 'date' || DATE_TEXT.test(cell.text);

/**
 * Tells exercise names from other text: a name the catalog knows (in any language), or one built
 * from a usual exercise word.
 */
export function exerciseMatcher(names: Iterable<string>) {
  const known = [...new Set([...names].map(fold).filter((n) => n.length >= 4))];
  return (text: string) => {
    if (text.length < 3 || text.length > 80) return false;
    const folded = fold(text);
    if (!/[a-z]{3}/.test(folded) || isDayHeading(folded)) return false;
    const padded = ` ${folded} `;
    return (
      folded.split(' ').some((w) => WORDS.has(w)) ||
      /\b(push|pull|chin) ?ups?\b/.test(folded) ||
      STEMS.some((s) => folded.includes(s)) ||
      known.some((n) => padded.includes(` ${n} `))
    );
  };
}

/** What the sheet seems to hold. */
export function summarizeSheet(
  sheet: WorkbookSheet,
  isExercise: (text: string) => boolean,
): SheetSummary {
  const { name, rows } = sheet;
  const cells = rows.flat();
  if (!cells.length) return { name, kind: 'empty' };
  const texts = cells.filter((c) => c.type === 'text');
  const exercises = texts.filter((c) => isExercise(c.text)).length;
  const days = new Set(texts.map((c) => fold(c.text)).filter(isDayHeading)).size;
  const dated = rows.filter((row) => row.some(isDate)).length;
  const withNumbers = rows.filter((row) => row.some((c) => c.type === 'number')).length;
  // A log has a date on most lines; a plan at most on a few (its weeks, say).
  if (dated >= 3 && withNumbers >= 3 && dated * 2 > exercises) {
    return { name, kind: 'log', entries: withNumbers };
  }
  if (exercises) return { name, kind: 'plan', days, exercises };
  return { name, kind: texts.length === cells.length ? 'text' : 'other' };
}
