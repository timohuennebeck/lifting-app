// Reads the sheets of an Excel (.xlsx) or OpenDocument (.ods) workbook for the workout import:
// each cell's text, whether it is a number or a date, and its column. Dates come as Excel's day
// numbers or ISO text; the import's date reading takes both.

import { strFromU8, unzipSync } from 'fflate';

export interface SheetCell {
  text: string;
  type: 'text' | 'number' | 'date';
  /** Its column, from 0. */
  column: number;
}

export interface WorkbookSheet {
  name: string;
  /** Rows with their filled cells, in order; empty rows left out. */
  rows: SheetCell[][];
}

/** Rows read per sheet: years of one row per set. */
const MAX_ROWS = 100_000;

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

const unescapeXml = (text: string) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] !== '#') return ENTITIES[entity] ?? match;
    const hex = entity[1] === 'x' || entity[1] === 'X';
    return String.fromCodePoint(parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10));
  });

/** An attribute of an opening tag (its text up to `>`), unescaped. */
/** Each attribute's pattern, made once: they run several times per cell. */
const attrPatterns = new Map<string, RegExp>();

function attr(tag: string, name: string) {
  let pattern = attrPatterns.get(name);
  if (!pattern) {
    pattern = new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`);
    attrPatterns.set(name, pattern);
  }
  const match = tag.match(pattern);
  return match ? unescapeXml(match[1] ?? match[2]) : undefined;
}

/** Every match of a global pattern. */
const all = (text: string, pattern: RegExp) => Array.from(text.matchAll(pattern));

// Excel ---------------------------------------------------------------------------------------

/** Excel's built-in number formats that show a date (times of day and durations are numbers). */
const DATE_FORMATS = new Set([
  14, 15, 16, 17, 22, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 50, 51, 52, 53, 54, 55, 56, 57, 58,
]);

/**
 * A custom format shows a date when, outside quotes and [colours], it has a day or year: "m"
 * alone can be minutes, as in a rest time of "1:30" (mm:ss).
 */
const isDateCode = (code: string) =>
  /[dy]/i.test(code.replace(/"[^"]*"|\\.|\[[^\]]*\]|General/gi, ''));

/** Per cell style (the cells' `s`), whether its number is a date. */
function dateStyles(styles: string | undefined) {
  if (!styles) return [];
  const custom = new Map(
    all(styles, /<numFmt\b[^>]*>/g).map(([tag]) => [
      Number(attr(tag, 'numFmtId')),
      attr(tag, 'formatCode') ?? '',
    ]),
  );
  const xfs = styles.match(/<cellXfs\b[^>]*>([\s\S]*?)<\/cellXfs>/)?.[1] ?? '';
  return all(xfs, /<xf\b[^>]*>/g).map(([tag]) => {
    const id = Number(attr(tag, 'numFmtId') ?? 0);
    const code = custom.get(id);
    return code === undefined ? DATE_FORMATS.has(id) : isDateCode(code);
  });
}

/** The text of the `<t>` runs inside an element, leaving out phonetic hints. */
const runsText = (xml: string) =>
  all(xml.replace(/<rPh\b[\s\S]*?<\/rPh>/g, ''), /<t\b[^>]*>([^<]*)<\/t>/g)
    .map((m) => unescapeXml(m[1]))
    .join('');

/** A column's letters as its index: A = 0, Z = 25, AA = 26. */
const columnIndex = (letters: string) =>
  [...letters.toUpperCase()].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;

function excelSheet(xml: string, strings: string[], dates: boolean[]): SheetCell[][] {
  const rows: SheetCell[][] = [];
  // Matched one at a time, so the scan stops at the cap.
  for (const [, body] of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    if (rows.length >= MAX_ROWS) break;
    const cells: SheetCell[] = [];
    let column = -1;
    for (const [, tag, inner = ''] of all(body, /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      // "C12" is the third column; a cell without a reference follows the one before.
      const ref = attr(tag, 'r')?.match(/^[A-Z]+/i)?.[0];
      column = ref ? columnIndex(ref) : column + 1;
      const type = attr(tag, 't');
      const value = inner.match(/<v>([^<]*)<\/v>/)?.[1];
      let cell: Omit<SheetCell, 'column'> | null = null;
      if (type === 's') cell = { text: strings[Number(value)] ?? '', type: 'text' };
      else if (type === 'inlineStr') cell = { text: runsText(inner), type: 'text' };
      else if (type === 'str' || type === 'b')
        cell = { text: unescapeXml(value ?? ''), type: 'text' };
      else if (type === 'd') cell = { text: value ?? '', type: 'date' };
      else if (type !== 'e' && value !== undefined) {
        cell = { text: value, type: dates[Number(attr(tag, 's') ?? 0)] ? 'date' : 'number' };
      }
      if (cell && cell.text.trim()) cells.push({ ...cell, text: cell.text.trim(), column });
    }
    if (cells.length) rows.push(cells);
  }
  return rows;
}

/** A part's path from a workbook relationship's target (relative to xl/, or absolute). */
const partPath = (target: string) =>
  target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`;

function readExcel(files: Record<string, Uint8Array>): WorkbookSheet[] {
  // Some writers prefix every element (<x:sheet>); the patterns below expect none. The workbook
  // tells (its root is prefixed too), so the other parts are only copied without when needed.
  const prefixed = /<[a-z]\w*:workbook\b/i.test(strFromU8(files['xl/workbook.xml']));
  const text = (path: string) => {
    const xml = files[path] && strFromU8(files[path]);
    return xml && prefixed ? xml.replace(/<(\/?)[a-z]\w*:(?=\w)/gi, '<$1') : xml;
  };
  const strings = all(text('xl/sharedStrings.xml') ?? '', /<si\b[^>]*>([\s\S]*?)<\/si>/g).map((m) =>
    runsText(m[1]),
  );
  const dates = dateStyles(text('xl/styles.xml'));
  const targets = new Map(
    all(text('xl/_rels/workbook.xml.rels') ?? '', /<Relationship\b[^>]*>/g).map(([tag]) => [
      attr(tag, 'Id'),
      attr(tag, 'Target') ?? '',
    ]),
  );
  return all(text('xl/workbook.xml') ?? '', /<sheet\b[^>]*>/g)
    .map(([tag]) => tag)
    .filter((tag) => !attr(tag, 'state')?.endsWith('hidden'))
    .map((tag) => {
      // The relationship id's prefix is usually r:, but needn't be.
      const id = attr(tag, 'r:id') ?? tag.match(/\s\w+:id="([^"]*)"/)?.[1];
      const sheet = text(partPath(targets.get(id) ?? ''));
      return {
        name: attr(tag, 'name') ?? '',
        rows: sheet ? excelSheet(sheet, strings, dates) : [],
      };
    });
}

// OpenDocument --------------------------------------------------------------------------------

/** A cell's shown text: its paragraphs, with spaces and tabs written as elements. */
const odsText = (inner: string) =>
  unescapeXml(
    inner
      .replace(/<text:s\b([^>]*)\/>/g, (_, tag: string) =>
        ' '.repeat(Number(attr(tag, 'text:c') ?? 1)),
      )
      .replace(/<text:(?:tab|line-break)\b[^>]*\/>|<\/text:p>/g, ' ')
      .replace(/<[^>]+>/g, ''),
  ).trim();

function readOds(content: string): WorkbookSheet[] {
  // Hidden sheets have a table style that doesn't display them.
  const hidden = new Set(
    all(content, /<style:style\b([^>]*)>([\s\S]*?)<\/style:style>/g)
      .filter(([, , props]) => /table:display="false"/.test(props))
      .map(([, tag]) => attr(tag, 'style:name')),
  );
  const tables = all(content, /<table:table(?=[\s>])([^>]*)>([\s\S]*?)<\/table:table>/g);
  return tables
    .filter(([, tag]) => !hidden.has(attr(tag, 'table:style-name')))
    .map(([, tag, body]) => {
      const rows: SheetCell[][] = [];
      for (const [, row = ''] of body.matchAll(
        /<table:table-row(?=[\s>/])[^>]*?(?:\/>|>([\s\S]*?)<\/table:table-row>)/g,
      )) {
        if (rows.length >= MAX_ROWS) break;
        const cells: SheetCell[] = [];
        let column = 0;
        for (const [, cellTag, inner = ''] of all(
          row,
          /<table:(?:covered-)?table-cell(?=[\s>/])([^>]*?)(?:\/>|>([\s\S]*?)<\/table:(?:covered-)?table-cell>)/g,
        )) {
          const at = column;
          // Empty cells in a row are written once with how often they repeat.
          column += Number(attr(cellTag, 'table:number-columns-repeated') ?? 1);
          const shown = odsText(inner);
          if (!shown) continue;
          const kind = attr(cellTag, 'office:value-type');
          const type = kind === 'date' ? 'date' : kind && kind !== 'string' ? 'number' : 'text';
          // Dates by their value (ISO), not as shown ("Mo, 3. Nov.").
          const text = type === 'date' ? (attr(cellTag, 'office:date-value') ?? shown) : shown;
          cells.push({ text, type, column: at });
        }
        if (cells.length) rows.push(cells);
      }
      return { name: attr(tag, 'table:name') ?? '', rows };
    });
}

// ---------------------------------------------------------------------------------------------

const EXCEL_PARTS =
  /^xl\/(workbook\.xml|_rels\/workbook\.xml\.rels|sharedStrings\.xml|styles\.xml|worksheets\/[^/]+\.xml)$/;

/**
 * The visible sheets of an .xlsx or .ods file, or null for anything else (a CSV, an old .xls, a
 * damaged file): those go to read-workout-file whole.
 */
export function readWorkbook(bytes: Uint8Array): WorkbookSheet[] | null {
  // Zip files start with "PK".
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) return null;
  try {
    const files = unzipSync(bytes, {
      filter: (f) => EXCEL_PARTS.test(f.name) || f.name === 'content.xml',
    });
    if (files['xl/workbook.xml']) return readExcel(files);
    if (files['content.xml']) return readOds(strFromU8(files['content.xml']));
    return null;
  } catch {
    return null;
  }
}
