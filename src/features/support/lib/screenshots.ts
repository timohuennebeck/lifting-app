import * as ImagePicker from 'expo-image-picker';

import { saveAsJpeg } from '@/shared/lib/jpeg';

export const MAX_SCREENSHOTS = 5;
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.7;

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
}

/** Lets the user pick up to `limit` images from the library (no permission prompt needed). */
export async function pickScreenshots(limit: number): Promise<PickedImage[]> {
  if (limit <= 0) return [];
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    orderedSelection: true,
    selectionLimit: limit,
    quality: 1,
  });
  if (result.canceled) return [];
  return result.assets
    .slice(0, limit)
    .map((a) => ({ uri: a.uri, width: a.width, height: a.height }));
}

/** Scales the long edge down to 1600 px and re-encodes as JPEG; returns the new file URI. */
export async function compressScreenshot(image: PickedImage) {
  let resize: { width: number } | { height: number } | undefined;
  if (Math.max(image.width, image.height) > MAX_EDGE) {
    resize = image.width >= image.height ? { width: MAX_EDGE } : { height: MAX_EDGE };
  }
  const result = await saveAsJpeg(image.uri, JPEG_QUALITY, resize);
  return result.uri;
}
