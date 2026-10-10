import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { POSES, type BodyPose } from './poses';

/** Private Supabase Storage bucket for check photos. */
export const PHOTO_BUCKET = 'body-checks';

const ROOT = 'body-checks';
const MAX_WIDTH = 1080;
const JPEG_QUALITY = 0.75;

export interface StoredPhoto {
  uri: string;
  width: number;
  height: number;
}

const rootDirectory = () => new Directory(Paths.document, ROOT);
const checkDirectory = (checkId: string) => new Directory(Paths.document, ROOT, checkId);

/** Final local file of a saved check's photo: `<documents>/body-checks/<checkId>/<pose>.jpg`. */
export const photoFile = (checkId: string, pose: BodyPose) =>
  new File(Paths.document, ROOT, checkId, `${pose}.jpg`);

/** Object path in the bucket; RLS requires the user id as the first folder. */
export const storagePathOf = (userId: string, checkId: string, pose: BodyPose) =>
  `${userId}/${checkId}/${pose}.jpg`;

/**
 * Resizes and compresses a camera shot into the check's folder. Drafts get a unique
 * name so a retake never shows a cached image; `finalizePhotos` copies them to their final
 * names on save.
 */
export async function storeShot(
  source: StoredPhoto,
  checkId: string,
  pose: BodyPose,
): Promise<StoredPhoto> {
  const context = ImageManipulator.manipulate(source.uri);
  if (source.width > MAX_WIDTH) context.resize({ width: MAX_WIDTH });
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });
  context.release();
  image.release();

  const directory = checkDirectory(checkId);
  directory.create({ intermediates: true, idempotent: true });
  const target = new File(directory, `draft-${pose}-${Date.now()}.jpg`);
  new File(saved.uri).moveSync(target);
  deleteFile(source.uri);
  return { uri: target.uri, width: saved.width, height: saved.height };
}

/** Copies the drafts to their final names; returns a rollback for a failed save. */
export function finalizePhotos(checkId: string, drafts: Record<BodyPose, StoredPhoto>) {
  for (const pose of POSES) {
    new File(drafts[pose].uri).copySync(photoFile(checkId, pose), { overwrite: true });
  }
  return () => POSES.forEach((pose) => deleteFile(photoFile(checkId, pose).uri));
}

export function deleteFile(uri: string) {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (error) {
    console.warn('Could not delete photo', error);
  }
}

/**
 * Deletes a check's draft photos and then its folder if nothing else is left.
 * Final photos of saved checks are never touched.
 */
export function deleteDrafts(checkId: string) {
  try {
    const directory = checkDirectory(checkId);
    if (!directory.exists) return;
    for (const entry of directory.list()) {
      if (entry instanceof File && entry.name.startsWith('draft-')) entry.delete();
    }
    if (!directory.list().length) directory.delete();
  } catch (error) {
    console.warn('Could not delete draft photos', error);
  }
}

/** Deletes a check's folder with all its photos, e.g. when the check is deleted. */
export function deleteCheckFiles(checkId: string) {
  try {
    const directory = checkDirectory(checkId);
    if (directory.exists) directory.delete();
  } catch (error) {
    console.warn('Could not delete check photos', error);
  }
}

/** Removes every local check photo, e.g. when the account signs out. */
export function clearLocalPhotos() {
  try {
    const root = rootDirectory();
    if (root.exists) root.delete();
  } catch (error) {
    console.warn('Could not delete local photos', error);
  }
}

/** Clears drafts left behind by unfinished checks, e.g. after the app was killed mid-check. */
export function deleteAbandonedDrafts(currentCheckId: string) {
  try {
    const root = rootDirectory();
    if (!root.exists) return;
    for (const entry of root.list()) {
      if (entry instanceof Directory && entry.name !== currentCheckId) deleteDrafts(entry.name);
    }
  } catch (error) {
    console.warn('Could not clean up draft photos', error);
  }
}
