// What read-history sees of a sheet for step 1 (see its history.ts, SheetSample): the header,
// exact statistics per column over all rows (filled, different values, share of numbers, the most
// common, first and last values) and a spread of rows: the first 40, 20 from the middle and the
// last 10. Enough to tell a log from a plan and each column's meaning without sending the file.
// Plain TypeScript.

import type { ImportTable } from './history';

/** Characters of one value in the statistics and sample. */
const CELL = 60;
/** Columns described; read-history takes no more. */
const MAX_COLUMNS = 80;

const cut = (value: string, max = CELL) => (value.length > max ? `${value.slice(0, max)}…` : value);
const isNumber = (value: string) => /^-?\d+(?:[.,]\d+)?$/.test(value.replace(/\s/g, ''));

/** A sheet as read-history's step 1 reads it. */
export function sheetSample({ name, rows }: ImportTable) {
  const [all = [], ...data] = rows;
  const header = all.slice(0, MAX_COLUMNS);
  const columns = header.map((column, i) => {
    const values = data.map((r) => r[i] ?? '').filter((v) => v !== '');
    const counts = new Map<string, number>();
    for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
    const common = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return {
      column,
      filled: values.length,
      empty: data.length - values.length,
      different: counts.size,
      numbers: values.length
        ? Math.round((values.filter(isNumber).length / values.length) * 100) / 100
        : 0,
      // A column with few values (days, routines) is listed whole.
      common: common.slice(0, counts.size <= 30 ? 30 : 6).map(([v, n]) => `${cut(v, 40)} (${n})`),
      first: cut(values[0] ?? '', 40),
      last: cut(values[values.length - 1] ?? '', 40),
    };
  });
  const picks = new Set<number>();
  for (let i = 0; i < Math.min(40, data.length); i++) picks.add(i);
  for (let k = 1; k <= 20; k++) picks.add(Math.floor((k * data.length) / 21));
  for (let i = Math.max(0, data.length - 10); i < data.length; i++) picks.add(i);
  const sample = [...picks]
    .filter((i) => i < data.length)
    .sort((a, b) => a - b)
    .map((i) => cut(`${i + 2}: ${data[i].map((v) => cut(v)).join(' | ')}`, 1000));
  return {
    name: name.slice(0, 100),
    rows: data.length,
    header: header.map((h) => cut(h, 200)),
    columns,
    sample,
  };
}
