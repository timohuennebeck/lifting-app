import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { AVATAR_BUCKET } from '@/shared/data/avatar';
import { newId } from '@/shared/data/json';
import { saveProfile } from '@/shared/data/profile';
import { supabase } from '@/shared/data/supabase';
import { uploadJpeg } from '@/shared/data/supabase-storage';

/** Profile photos are stored as square JPEGs this size. */
const SIZE = 512;
const JPEG_QUALITY = 0.8;

export type AvatarSource = 'camera' | 'library';

/**
 * Takes or picks a photo, cropped square by the system editor. Null when cancelled, "denied"
 * when the camera may not be used.
 */
export async function pickAvatar(source: AvatarSource): Promise<string | 'denied' | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  };
  if (source === 'camera') {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) return 'denied';
  }
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;

  const context = ImageManipulator.manipulate(asset.uri);
  context.resize({ width: SIZE, height: SIZE });
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });
  context.release();
  image.release();
  return saved.uri;
}

/** Uploads a new profile photo and links it to the profile; the old file is removed. */
export async function saveAvatar(userId: string, uri: string, previous: string | null) {
  const path = `${userId}/${newId()}.jpg`;
  await uploadJpeg(AVATAR_BUCKET, path, new File(uri));
  await saveProfile(userId, { avatarPath: path });
  if (previous) void supabase.storage.from(AVATAR_BUCKET).remove([previous]);
  return path;
}

/** Back to the initials; the photo file is removed. */
export async function removeAvatar(userId: string, previous: string) {
  await saveProfile(userId, { avatarPath: null });
  void supabase.storage.from(AVATAR_BUCKET).remove([previous]);
}
