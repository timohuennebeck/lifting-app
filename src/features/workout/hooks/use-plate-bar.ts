import { useExerciseSetting } from '@/shared/data/exercise-settings';
import { useUnits } from '@/shared/data/profile';
import { toDisplayWeight } from '@/shared/lib/format';

import { type PlateSetup, plateUnit } from '../lib/plates';

export interface PlateBar {
  /** The bar's weight in the user's unit, also while it is off (turning it on brings it back). */
  weight: number;
  /** The plates go on without a bar. */
  noBar: boolean;
  /** What the plates are loaded on: the weight, or 0 without a bar. */
  bar: number;
}

/** The bar an exercise's plates go on: the user's setting, else the exercise's usual one. */
export function usePlateBar(exerciseId: string, setup: PlateSetup): PlateBar {
  const units = useUnits();
  const setting = useExerciseSetting(exerciseId);
  const weight = setting ? toDisplayWeight(setting.barKg, units) : setup.start[plateUnit(units)];
  const noBar = setting ? setting.noBar : setup.startOff;
  return { weight, noBar, bar: noBar ? 0 : weight };
}
