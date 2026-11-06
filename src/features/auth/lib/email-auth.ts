import type { AuthError, User } from '@supabase/supabase-js';

import { supabase } from '@/shared/data/supabase';

/** Why an email sign-up or sign-in didn't work, as the screens say it. */
export type EmailAuthReason =
  | 'exists'
  | 'wrongPassword'
  | 'confirmEmail'
  | 'weakPassword'
  | 'wrongCode'
  | 'samePassword'
  | 'generic';

export class EmailAuthError extends Error {
  constructor(readonly reason: EmailAuthReason) {
    super(reason);
  }
}

/** Passwords are at least this long (Supabase allows shorter; the app asks for more). */
export const MIN_PASSWORD = 8;

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

const reasonOf = (error: AuthError): EmailAuthReason => {
  switch (error.code) {
    case 'user_already_exists':
    case 'email_exists':
      return 'exists';
    case 'invalid_credentials':
      return 'wrongPassword';
    case 'email_not_confirmed':
      return 'confirmEmail';
    case 'weak_password':
      return 'weakPassword';
    case 'same_password':
      return 'samePassword';
    default:
      return 'generic';
  }
};

/**
 * Makes an account with email and password. The user once signed in; null when the project asks
 * for the email to be confirmed first (the link in the email, then sign in).
 */
export async function signUpWithEmail(email: string, password: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
  if (error) throw new EmailAuthError(reasonOf(error));
  // With confirmation on, an email that has an account answers with a user without identities.
  if (data.user && !data.user.identities?.length) throw new EmailAuthError('exists');
  return data.session ? data.user : null;
}

/** Signs in to an account made with email and password. */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new EmailAuthError(reasonOf(error));
  return data.user;
}

/** Sends the 6-digit code for a new password (the reset email shows it, see supabase/templates). */
export async function sendResetCode(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
  if (error) throw new EmailAuthError(reasonOf(error));
}

/** Checks the code; signs in for the new password. Throws `wrongCode` when it doesn't fit. */
export async function verifyResetCode(email: string, code: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: code,
    type: 'recovery',
  });
  if (error || !data.user) throw new EmailAuthError('wrongCode');
}

/** The signed-in user's new password. */
export async function setNewPassword(password: string): Promise<User> {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw new EmailAuthError(reasonOf(error));
  return data.user;
}

/** How strong a new password looks, 0–4: its length, mixed case with digits, other signs. */
export function passwordStrength(password: string) {
  if (!password) return 0;
  let score = password.length >= MIN_PASSWORD ? 1 : 0;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.max(1, score);
}
