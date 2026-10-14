import { File } from 'expo-file-system';

import { useCatalogStore, useCustomExerciseStore } from '@/shared/data/exercises';

import type { ImportFile } from './plan-import-service';
import { exerciseMatcher, type SheetSummary, summarizeSheet } from './sheet-summary';
import { readWorkbook } from './workbook';

/** Workbooks the app reads the sheets of; old .xls files go to the analysis whole. */
const isWorkbook = (file: ImportFile) =>
  /\.(xlsx|xlsm|ods)$/i.test(file.name) ||
  /spreadsheetml|opendocument\.spreadsheet/.test(file.mimeType ?? '');

/** Exercise names in every language the catalog has, and the user's own exercises. */
function knownNames() {
  const catalog = Object.values(useCatalogStore.getState().rows);
  const custom = Object.values(useCustomExerciseStore.getState().exercises);
  return [...catalog.flatMap((row) => Object.values(row.name)), ...custom.map((e) => e.name)];
}

async function read(file: ImportFile): Promise<SheetSummary[] | null> {
  if (!isWorkbook(file)) return null;
  try {
    const sheets = readWorkbook(new Uint8Array(await new File(file.uri).arrayBuffer()));
    if (!sheets) return null;
    const isExercise = exerciseMatcher(knownNames());
    const summaries = sheets.map((sheet) => summarizeSheet(sheet, isExercise));
    // One sheet with something in it leaves nothing to choose.
    return summaries.filter((s) => s.kind !== 'empty').length > 1 ? summaries : null;
  } catch (error) {
    console.warn('Reading the sheets failed', error);
    return null;
  }
}

let last: { uri: string; sheets: Promise<SheetSummary[] | null> } | null = null;

/**
 * The file's sheets and what each seems to hold, when there are several to choose from: else
 * null, and the analysis reads the file whole. Read once per file.
 */
export function loadSheets(file: ImportFile) {
  if (last?.uri !== file.uri) last = { uri: file.uri, sheets: read(file) };
  return last.sheets;
}

/** Sheets that look like the plan; the picker recommends and preselects them. */
export const recommendedSheets = (sheets: SheetSummary[]) => {
  const plans = sheets.filter((s) => s.kind === 'plan');
  // Nothing reads as a plan: all with content, and the analysis looks.
  return (plans.length ? plans : sheets.filter((s) => s.kind !== 'empty')).map((s) => s.name);
};
