import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { strFromU8 } from 'fflate';

import { useCatalogStore, useCustomExerciseStore } from '@/shared/data/exercises';
import { i18n } from '@/shared/i18n';
import { showError } from '@/shared/stores/error-sheet-store';

import { parseCsv } from './csv';
import type { ImportTable } from './history';
import { exerciseMatcher, type SheetSummary, summarizeSheet } from './sheet-summary';
import { parseDate } from './values';
import { readWorkbook, type WorkbookSheet } from './workbook';

/** A file the user picked. */
export interface ImportFile {
  uri: string;
  name: string;
  size: number | null;
  mimeType: string | null;
}

const FILE_TYPES = [
  'text/csv',
  'text/comma-separated-values',
  'text/tab-separated-values',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel.sheet.macroEnabled.12',
  'application/vnd.oasis.opendocument.spreadsheet',
];

/** Lets the user pick a CSV, TSV or Excel file. Null when cancelled. */
async function pickFile(): Promise<ImportFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: FILE_TYPES,
    copyToCacheDirectory: true,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;
  return {
    uri: asset.uri,
    name: asset.name,
    size: asset.size ?? null,
    mimeType: asset.mimeType ?? null,
  };
}

/**
 * Lets the user pick a file and reads it (readImportFile); a read file goes to `onRead`. A picker
 * that fails shows the error sheet, whose "Try again" opens it again; a file without rows says so
 * (13ie), with "Choose a different file".
 */
export async function chooseImportFile(onRead: (file: ImportFile, read: ReadFile) => void) {
  const again = () => void chooseImportFile(onRead);
  let file: ImportFile | null;
  try {
    file = await pickFile();
  } catch {
    showError({
      title: i18n.t('workoutImport:errors.picker.title'),
      message: i18n.t('workoutImport:errors.picker.message'),
      onRetry: again,
    });
    return;
  }
  if (!file) return;
  const read = await readImportFile(file).catch(() => null);
  if (read?.tables.some((t) => t.rows.length >= 2)) {
    onRead(file, read);
    return;
  }
  showError({
    title: i18n.t('workoutImport:errors.unreadable.title'),
    message: i18n.t('workoutImport:errors.unreadable.message'),
    action: { label: i18n.t('workoutImport:errors.retry'), onPress: again },
    dismissLabel: i18n.t('workoutImport:errors.close'),
  });
}

/** A workbook (Excel, OpenDocument), not a text file. */
const isWorkbook = (file: ImportFile) =>
  /\.(xlsx|xlsm|ods)$/i.test(file.name) ||
  /spreadsheetml|opendocument\.spreadsheet/.test(file.mimeType ?? '');

/** Whether the bytes are valid UTF-8 (else the file is Windows-1252, as Excel saves CSV). */
function isUtf8(bytes: Uint8Array) {
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    const extra = b < 0x80 ? 0 : b >> 5 === 6 ? 1 : b >> 4 === 14 ? 2 : b >> 3 === 30 ? 3 : -1;
    if (extra < 0) return false;
    for (let k = 1; k <= extra; k++) if (bytes[i + k] >> 6 !== 2) return false;
    i += extra + 1;
  }
  return true;
}

/** Windows-1252's characters for 0x80–0x9F; the rest is Latin-1. */
const CP1252 = '€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008DŽ\u008F\u0090‘’“”•–—˜™š›œ\u009DžŸ';

const decodeText = (bytes: Uint8Array) =>
  isUtf8(bytes)
    ? strFromU8(bytes)
    : Array.from(bytes, (b) =>
        b >= 0x80 && b < 0xa0 ? CP1252[b - 0x80] : String.fromCharCode(b),
      ).join('');

const pad = (n: number) => String(n).padStart(2, '0');

/** A date cell as text the model and the history reading both read: "2025-11-01 18:05". */
function dateText(text: string) {
  const date = parseDate(text);
  if (!date) return text;
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time =
    date.getHours() || date.getMinutes()
      ? ` ${pad(date.getHours())}:${pad(date.getMinutes())}`
      : '';
  return day + time;
}

/** A sheet's rows by column, empty cells as "". */
const sheetRows = (sheet: WorkbookSheet) =>
  sheet.rows.map((cells) => {
    const row: string[] = [];
    for (const cell of cells) {
      while (row.length < cell.column) row.push('');
      row[cell.column] = cell.type === 'date' ? dateText(cell.text) : cell.text;
    }
    return row;
  });

/**
 * The rows from the header on: titles above it ("4-Day Upper/Lower – Block 1") are left out. The
 * header is the first of the top rows with nearly as many cells as the fullest one.
 */
function fromHeader(rows: string[][]) {
  const filled = (row: string[]) => row.filter((v) => v !== '').length;
  const top = rows.slice(0, 10);
  const most = Math.max(0, ...top.map(filled));
  const at = top.findIndex((row) => filled(row) >= Math.max(2, most * 0.6));
  return at > 0 ? rows.slice(at) : rows;
}

/** Exercise names in every language the catalog has, and the user's own exercises. */
function knownNames() {
  const catalog = Object.values(useCatalogStore.getState().rows);
  const custom = Object.values(useCustomExerciseStore.getState().exercises);
  return [...catalog.flatMap((row) => Object.values(row.name)), ...custom.map((e) => e.name)];
}

/** A file's sheets: one for a CSV or TSV file, each visible one of a workbook. */
export interface ReadFile {
  tables: ImportTable[];
  /** For a workbook, what each sheet seems to hold (see summarizeSheet), in the same order. */
  summaries: SheetSummary[] | null;
}

/** Reads the file's sheets; throws when it can't be opened or isn't a file of rows. */
async function readImportFile(file: ImportFile): Promise<ReadFile> {
  const bytes = new Uint8Array(await new File(file.uri).arrayBuffer());
  if (isWorkbook(file)) {
    const sheets = readWorkbook(bytes);
    if (!sheets) throw new Error('Not a workbook');
    const isExercise = exerciseMatcher(knownNames());
    return {
      tables: sheets.map((s) => ({ name: s.name, rows: fromHeader(sheetRows(s)) })),
      summaries: sheets.map((s) => summarizeSheet(s, isExercise)),
    };
  }
  const name = file.name.replace(/\.[^.]+$/, '') || file.name;
  return { tables: [{ name, rows: fromHeader(parseCsv(decodeText(bytes))) }], summaries: null };
}
