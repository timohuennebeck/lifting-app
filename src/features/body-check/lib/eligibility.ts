import type { Profile } from '@/shared/data/profile';

/** The body check is for adults only; the analysis function checks it too. */
export const BODY_CHECK_MIN_AGE = 18;

/** Whether the profile's age allows body checks (an unknown age does not). */
export const isBodyCheckAge = (age: Profile['age'] | undefined) => (age ?? 0) >= BODY_CHECK_MIN_AGE;
