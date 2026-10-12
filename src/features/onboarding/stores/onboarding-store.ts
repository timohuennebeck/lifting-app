import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { type CustomExercise, useCustomExerciseStore } from '@/shared/data/exercises';
import type { EquipmentAccess, Experience, Goal, Sex } from '@/shared/data/profile';
import type { PlanDraft } from '@/shared/data/templates';
import type { UnitSystem } from '@/shared/lib/format';
import { mmkvStorage } from '@/shared/lib/storage';
import type { MuscleId } from '@/shared/ui/muscle-map/body-paths';

export interface OnboardingDraft {
  firstName: string;
  sex: Sex | null;
  /** ISO date (YYYY-MM-DD); null until an allowed one is picked. */
  birthDate: string | null;
  unitSystem: UnitSystem;
  weightKg: number;
  heightCm: number;
  experience: Experience | null;
  complaints: string[];
  goal: Goal | null;
  focus: MuscleId[];
  equipment: EquipmentAccess | null;
  /** Monday-based weekday indexes. */
  trainingDays: number[];
  sessionMinutes: number;
  /** Plan built by the generator or detected by the import. */
  plan: PlanDraft | null;
  /** Exercises an imported plan uses that the catalog doesn't have; created with the account. */
  customExercises: CustomExercise[];
}

const IMPERIAL_REGIONS = ['US', 'LR', 'MM'];

const initialDraft = (): OnboardingDraft => ({
  firstName: '',
  sex: null,
  birthDate: null,
  unitSystem: IMPERIAL_REGIONS.includes(getLocales()[0]?.regionCode ?? '') ? 'imperial' : 'metric',
  weightKg: 78,
  heightCm: 178,
  experience: null,
  complaints: [],
  goal: null,
  focus: [],
  equipment: null,
  trainingDays: [0, 2, 4],
  sessionMinutes: 60,
  plan: null,
  customExercises: [],
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
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

// The draft's own exercises resolve like saved ones, also after a restart (MMKV hydrates on create).
const showDraftExercises = ({ draft }: OnboardingState) =>
  useCustomExerciseStore.setState({
    drafts: Object.fromEntries((draft.customExercises ?? []).map((e) => [e.id, e])),
  });
showDraftExercises(useOnboardingStore.getState());
useOnboardingStore.subscribe((state, previous) => {
  if (state.draft.customExercises !== previous.draft.customExercises) showDraftExercises(state);
});

export const useDraft = () => useOnboardingStore((s) => s.draft);
export const useUpdateDraft = () => useOnboardingStore((s) => s.update);
