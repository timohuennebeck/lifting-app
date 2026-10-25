import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { i18n } from '@/shared/i18n';
import { showError } from '@/shared/stores/error-sheet-store';

import type { ImportFile, ImportPhoto } from './plan-import-service';

const PLAN_FILE_TYPES = [
  'application/pdf',
  'text/csv',
  'text/comma-separated-values',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel.sheet.macroEnabled.12',
  'application/vnd.oasis.opendocument.spreadsheet',
  'image/*',
];

/** Lets the user pick a PDF, spreadsheet, CSV or screenshot. Null when cancelled. */
export async function pickPlanFile(): Promise<ImportFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: PLAN_FILE_TYPES,
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
 * pickPlanFile for a button: a picked file goes to `onPicked`. A file that can't be opened shows
 * the error sheet, whose "Try again" opens the picker again.
 */
export async function choosePlanFile(onPicked: (file: ImportFile) => void) {
  try {
    const file = await pickPlanFile();
    if (file) onPicked(file);
  } catch {
    showError({
      title: i18n.t('planImport:errors.file.title'),
      message: i18n.t('planImport:errors.file.message'),
      onRetry: () => void choosePlanFile(onPicked),
    });
  }
}

/** Lets the user pick up to `limit` (at least 1) photos of their plan from the library. */
export async function pickPlanPhotos(limit: number): Promise<ImportPhoto[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: limit > 1,
    selectionLimit: limit,
    quality: 0.8,
  });
  if (result.canceled) return [];
  return result.assets.map((a) => ({ uri: a.uri, width: a.width, height: a.height }));
}
