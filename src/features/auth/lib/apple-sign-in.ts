import { AppleAuthenticationScope, formatFullName, signInAsync } from 'expo-apple-authentication';
import { CryptoDigestAlgorithm, digestStringAsync, randomUUID } from 'expo-crypto';

import { supabase } from '@/shared/data/supabase';

const isCancel = (error: unknown) =>
  (error as { code?: string } | null)?.code === 'ERR_REQUEST_CANCELED';

/**
 * Apple's sign-in sheet, then a Supabase session from the identity token it returns (a new
 * account the first time). Null when the user closes the sheet. Apple devices only.
 */
export async function signInWithApple() {
  // Apple signs a hash of the nonce into the token; Supabase checks it against the raw one.
  const nonce = randomUUID();
  try {
    const credential = await signInAsync({
      requestedScopes: [AppleAuthenticationScope.FULL_NAME, AppleAuthenticationScope.EMAIL],
      nonce: await digestStringAsync(CryptoDigestAlgorithm.SHA256, nonce),
    });
    if (!credential.identityToken) throw new Error('Apple returned no identity token');
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce,
    });
    if (error) throw error;
    // Apple shares the name only on the first sign-in and never in the token: kept on the
    // account like an email sign-up's, so a later sign-in on a new device finds it.
    const firstName = credential.fullName?.givenName;
    if (!firstName || !credential.fullName) return data.user;
    const { data: named, error: nameError } = await supabase.auth.updateUser({
      data: { first_name: firstName, full_name: formatFullName(credential.fullName) },
    });
    if (nameError) console.warn('Saving the name from Apple failed', nameError);
    return named.user ?? data.user;
  } catch (error) {
    if (isCancel(error)) return null;
    // Setup mistakes (capability, Supabase provider) only show up here.
    console.warn('Apple sign-in failed', error);
    throw error;
  }
}

/**
 * Account deletion: Apple's sheet once more for a fresh authorization code, with which the server
 * revokes the app's Apple tokens (App Store guideline 5.1.1(v)). False when the user closes the
 * sheet; a failed revocation doesn't hold up the deletion.
 */
export async function revokeAppleSignIn() {
  let code: string | null;
  try {
    ({ authorizationCode: code } = await signInAsync());
  } catch (error) {
    if (isCancel(error)) return false;
    console.warn('Apple sign-in for the revocation failed', error);
    return true;
  }
  if (!code) return true;
  const { error } = await supabase.functions.invoke('revoke-apple-token', { body: { code } });
  if (error) console.warn('Revoking the Apple tokens failed', error);
  return true;
}
