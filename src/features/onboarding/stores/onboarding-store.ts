import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { EquipmentAccess, Experience, Goal, Sex } from '@/shared/data/profile';
import type { PlanDraft } from '@/shared/data/templates';
import type { UnitSystem } from '@/shared/lib/format';
import { zustandStorage } from '@/shared/lib/storage';
import type { MuscleId } from '@/shared/ui/muscle-map/body-paths';

export interface OnboardingDraft {
  firstName: string;
  sex: Sex | null;
  age: number;
  unitSystem: UnitSystem;
  weightKg: number;
  heightCm: number;
  experience: Experience | null;
  complaints: string[];
  hasPlan: boolean | null;
  goal: Goal | null;
  focus: MuscleId[];
  equipment: EquipmentAccess | null;
  /** Monday-based weekday indexes. */
  trainingDays: number[];
  sessionMinutes: number;
  /** Plan built by the generator or detected by the import. */
  plan: PlanDraft | null;
}

/** Set targets as drafts stored them before v1 of the persisted state. */
interface LegacyTargets {
  repsMin?: number;
  repsMax?: number;
}

const IMPERIAL_REGIONS = ['US', 'LR', 'MM'];

const initialDraft = (): OnboardingDraft => ({
  firstName: '',
  sex: null,
  age: 28,
  unitSystem: IMPERIAL_REGIONS.includes(getLocales()[0]?.regionCode ?? '') ? 'imperial' : 'metric',
  weightKg: 78,
  heightCm: 178,
  experience: null,
  complaints: [],
  hasPlan: null,
  goal: null,
  focus: [],
  equipment: null,
  trainingDays: [0, 2, 4],
  sessionMinutes: 60,
  plan: null,
});

interface OnboardingState {
  draft: OnboardingDraft;
  /** Set once the whole flow (incl. optional body check prompt) is done. */
  completed: boolean;
  update: (patch: Partial<OnboardingDraft>) => void;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      draft: initialDraft(),
      completed: false,
      update: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      complete: () => set({ completed: true }),
      reset: () => set({ draft: initialDraft(), completed: false }),
    }),
    {
      name: 'onboarding',
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as OnboardingState;
        // v1 renamed plan set targets from repsMin/repsMax to targetMin/targetMax.
        if (version < 1) {
          for (const day of state.draft?.plan?.days ?? []) {
            for (const exercise of day.exercises) {
              exercise.sets = exercise.sets.map((set) => {
                const { repsMin, repsMax, ...rest } = set as typeof set & LegacyTargets;
                return {
                  ...rest,
                  targetMin: repsMin ?? set.targetMin,
                  targetMax: repsMax ?? set.targetMax,
                };
              });
            }
          }
        }
        return state;
      },
    },
  ),
);

export const useDraft = () => useOnboardingStore((s) => s.draft);
export const useUpdateDraft = () => useOnboardingStore((s) => s.update);
