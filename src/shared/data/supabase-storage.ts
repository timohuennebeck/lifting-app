import type { File } from 'expo-file-system';

import { supabase } from './supabase';

/** Uploads a device JPEG to a private bucket; retrying the same path overwrites a partial upload. */
export async function uploadJpeg(bucket: string, path: string, file: File) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, await file.arrayBuffer(), { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
}

/** Time-limited URL of an object in a private bucket. */
export async function signedUrl(bucket: string, path: string, seconds: number) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, seconds);
  if (error) throw error;
  return data.signedUrl;
}
