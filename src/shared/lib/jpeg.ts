import { File } from 'expo-file-system';
import { type ActionResize, ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { decode } from 'jpeg-js';

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

/** Width an image is shrunk to before its brightness is measured. */
const SAMPLE_WIDTH = 32;

/** Average brightness of an image from 0 (black) to 255 (white), measured on a tiny copy. */
export async function averageBrightness(uri: string) {
  const sample = new File((await saveAsJpeg(uri, 1, { width: SAMPLE_WIDTH })).uri);
  try {
    const { data } = decode(await sample.bytes(), { useTArray: true });
    let sum = 0;
    // RGBA; luma weights for perceived brightness.
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    return sum / (data.length / 4);
  } finally {
    sample.delete();
  }
}
