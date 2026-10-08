import { useProfile } from '@/shared/data/profile';
import type { UnitSystem } from '@/shared/lib/format';

/** The signed-in user's unit system (metric until the profile loaded). */
export function useUnits(): UnitSystem {
  return useProfile().profile?.unitSystem ?? 'metric';
}
