import { type ActionResize, ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/**
 * Re-encodes an image file as a JPEG with `quality` (0–1), resized first when `size` is given;
 * frees the native images once it is saved.
 */
export async function saveAsJpeg(uri: string, quality: number, size?: ActionResize['resize']) {
  const context = ImageManipulator.manipulate(uri);
  if (size) context.resize(size);
  const image = await context.renderAsync();
  try {
    return await image.saveAsync({ compress: quality, format: SaveFormat.JPEG });
  } finally {
    image.release();
    context.release();
  }
}
