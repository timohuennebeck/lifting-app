import type { AuthError } from '@supabase/supabase-js';

export const MIN_PASSWORD_LENGTH = 8;

/** Steps of the password reset (email, code, new password). */
export const RESET_STEPS = 3;

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

export type PasswordScore = 0 | 1 | 2 | 3 | 4;

/** 0–4: length ≥ 8, length ≥ 12, mixed case, digit or symbol (prototype rule). */
export function passwordScore(password: string): PasswordScore {
  if (!password) return 0;
  const points =
    Number(password.length >= MIN_PASSWORD_LENGTH) +
    Number(password.length >= 12) +
    Number(/[A-Z]/.test(password) && /[a-z]/.test(password)) +
    Number(/[0-9\W]/.test(password));
  return Math.min(4, points) as PasswordScore;
}

export type AuthErrorKey =
  | 'alreadyRegistered'
  | 'invalidCredentials'
  | 'weakPassword'
  | 'emailNotConfirmed'
  | 'rateLimited'
  | 'invalidCode'
  | 'samePassword'
  | 'network'
  | 'generic';

/** Maps Supabase auth errors to translation keys in `auth:errors`. */
export function authErrorKey(error: AuthError): AuthErrorKey {
  switch (error.code) {
    case 'user_already_exists':
    case 'email_exists':
      return 'alreadyRegistered';
    case 'invalid_credentials':
      return 'invalidCredentials';
    case 'weak_password':
      return 'weakPassword';
    case 'email_not_confirmed':
      return 'emailNotConfirmed';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'rateLimited';
    case 'otp_expired':
      return 'invalidCode';
    case 'same_password':
      return 'samePassword';
    default:
      return error.name === 'AuthRetryableFetchError' ? 'network' : 'generic';
  }
}
