import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

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
  const context = ImageManipulator.manipulate(image.uri);
  if (Math.max(image.width, image.height) > MAX_EDGE) {
    context.resize(image.width >= image.height ? { width: MAX_EDGE } : { height: MAX_EDGE });
  }
  const rendered = await context.renderAsync();
  try {
    const result = await rendered.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });
    return result.uri;
  } finally {
    rendered.release();
    context.release();
  }
}
