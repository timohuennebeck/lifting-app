import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

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
