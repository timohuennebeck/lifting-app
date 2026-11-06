import { useProfile } from '@/shared/data/profile';

import { PLATE_WEIGHTS, type PlateUnit } from '../lib/plates';

/** The plates the user's gym has in a unit, heaviest first: all until they turn some off. */
export function useAvailablePlates(unit: PlateUnit) {
  const { profile } = useProfile();
  const picked = unit === 'kg' ? profile?.platesKg : profile?.platesLb;
  return picked?.length ? picked : PLATE_WEIGHTS[unit];
}
