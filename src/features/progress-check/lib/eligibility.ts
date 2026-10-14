import { ageFrom, type Profile } from '@/shared/data/profile';

/** The progress check is for adults only; the analysis function checks it too. */
const PROGRESS_CHECK_MIN_AGE = 18;

/** Whether the profile's birth date allows progress checks (an unknown one does not). */
export const isProgressCheckAge = (birthDate: Profile['birthDate'] | undefined) =>
  !!birthDate && ageFrom(birthDate) >= PROGRESS_CHECK_MIN_AGE;

/** The day someone born on `birthDate` (YYYY-MM-DD) turns 18, the same day `ageFrom` counts. */
export function progressCheckUnlockDate(birthDate: string) {
  const [year, month, day] = birthDate.split('-').map(Number);
  // Date rolls 29 February over to 1 March in other years.
  return new Date(year + PROGRESS_CHECK_MIN_AGE, month - 1, day);
}
