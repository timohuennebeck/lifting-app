import { ageFrom, type Profile } from '@/shared/data/profile';

/** The body check is for adults only; the analysis function checks it too. */
const BODY_CHECK_MIN_AGE = 18;

/** Whether the profile's birth date allows body checks (an unknown one does not). */
export const isBodyCheckAge = (birthDate: Profile['birthDate'] | undefined) =>
  !!birthDate && ageFrom(birthDate) >= BODY_CHECK_MIN_AGE;

/** The day someone born on `birthDate` (YYYY-MM-DD) turns 18, the same day `ageFrom` counts. */
export function bodyCheckUnlockDate(birthDate: string) {
  const [year, month, day] = birthDate.split('-').map(Number);
  // Date rolls 29 February over to 1 March in other years.
  return new Date(year + BODY_CHECK_MIN_AGE, month - 1, day);
}
