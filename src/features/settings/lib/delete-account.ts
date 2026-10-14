import { revokeAppleSignIn } from '@/features/auth/lib/apple-sign-in';
import { appleSignInAvailable } from '@/features/auth/lib/social-sign-in';
import { ATTACHMENT_BUCKET } from '@/features/support/data/attachments';
import { PHOTO_BUCKET } from '@/features/progress-check/lib/photo-files';
import { AVATAR_BUCKET } from '@/shared/data/avatar';
import { supabase } from '@/shared/data/supabase';

const PAGE = 1000;

/** Every file under `folder`, subfolders included (a folder is listed with no id). */
async function listFiles(bucket: string, folder: string): Promise<string[]> {
  const files: string[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, { limit: PAGE, offset });
    if (error) throw error;
    for (const item of data) {
      const path = `${folder}/${item.name}`;
      if (item.id) files.push(path);
      else files.push(...(await listFiles(bucket, path)));
    }
    if (data.length < PAGE) return files;
  }
}

/** Whether the signed-in account has signed in with Apple. */
async function usesApple() {
  const { data } = await supabase.auth.getSession();
  const providers: unknown = data.session?.user.app_metadata?.providers;
  return Array.isArray(providers) && providers.includes('apple');
}

/**
 * Deletes the signed-in user's account for good: their files (profile photo, progress-check photos,
 * support screenshots), then the user, which removes all their rows; then signs out on this device.
 * An Apple account first lets Apple revoke the app's access; closing Apple's sheet cancels, and
 * then this resolves false with nothing deleted.
 */
export async function deleteAccount(userId: string) {
  // Only possible where Sign in with Apple exists; an Apple account deleted on Android stays linked.
  if (appleSignInAvailable && (await usesApple()) && !(await revokeAppleSignIn())) return false;
  for (const bucket of [AVATAR_BUCKET, PHOTO_BUCKET, ATTACHMENT_BUCKET]) {
    const paths = await listFiles(bucket, userId);
    for (let i = 0; i < paths.length; i += PAGE) {
      const { error } = await supabase.storage.from(bucket).remove(paths.slice(i, i + PAGE));
      if (error) throw error;
    }
  }
  const { error } = await supabase.rpc('delete_own_account');
  if (error) throw error;
  // The user is gone, so there is no server session left to end: only this device's.
  await supabase.auth.signOut({ scope: 'local' });
  return true;
}
