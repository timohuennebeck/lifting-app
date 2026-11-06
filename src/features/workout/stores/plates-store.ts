import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/shared/lib/storage';

import { PLATE_WEIGHTS, type PlateUnit } from '../lib/plates';

interface PlatesState {
  /** The number pad shows the plates with their drawing; folded, on one line. */
  open: boolean;
  toggleOpen: () => void;
  /** The plates the user has, per unit, heaviest first; none turned off: all of them. */
  available: Partial<Record<PlateUnit, number[]>>;
  /** Turns a plate off or on; the last one stays on. */
  togglePlate: (unit: PlateUnit, weight: number) => void;
}

/**
 * How the number pad shows the plates and the plates the user has, kept on this device. The bar
 * of each exercise is synced (`exercise_settings`).
 */
export const usePlatesStore = create<PlatesState>()(
  persist(
    (set) => ({
      open: true,
      toggleOpen: () => set((s) => ({ open: !s.open })),
      available: {},
      togglePlate: (unit, weight) =>
        set((s) => {
          const current = s.available[unit] ?? PLATE_WEIGHTS[unit];
          const has = current.includes(weight);
          if (has && current.length === 1) return s;
          const next = PLATE_WEIGHTS[unit].filter((w) =>
            w === weight ? !has : current.includes(w),
          );
          const available = { ...s.available, [unit]: next };
          // All on again: kept as none turned off, so plates added to the app later are on too.
          if (next.length === PLATE_WEIGHTS[unit].length) delete available[unit];
          return { available };
        }),
    }),
    {
      name: 'plates',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (s) => ({ open: s.open, available: s.available }),
    },
  ),
);

/** The plates the user has in a unit, heaviest first: all but the ones they turned off. */
export function useAvailablePlates(unit: PlateUnit) {
  const picked = usePlatesStore((s) => s.available[unit]);
  return picked?.length ? picked : PLATE_WEIGHTS[unit];
}
