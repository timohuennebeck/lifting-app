import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { type CustomExercise, useCustomExerciseStore } from '@/shared/data/exercises';
import type { EquipmentAccess, Experience, Goal, Sex } from '@/shared/data/profile';
import type { PlanDraft } from '@/shared/data/templates';
import { DEFAULT_BODY_WEIGHT_KG } from '@/shared/lib/body-weight';
import type { UnitSystem } from '@/shared/lib/format';
import { mmkvStorage } from '@/shared/lib/storage';
import type { MuscleId } from '@/shared/ui/muscle-map/body-paths';

export interface OnboardingDraft {
  firstName: string;
  sex: Sex | null;
  /** ISO date (YYYY-MM-DD); null until an allowed one is picked. */
  birthDate: string | null;
  unitPreference: UnitSystem;
  weightKg: number;
  heightCm: number;
  experience: Experience | null;
  goal: Goal | null;
  focus: MuscleId[];
  equipment: EquipmentAccess | null;
  /** With `equipment` 'home': the ticked equipment ids. */
  homeEquipment: string[];
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
  unitPreference: IMPERIAL_REGIONS.includes(getLocales()[0]?.regionCode ?? '')
    ? 'imperial'
    : 'metric',
  weightKg: DEFAULT_BODY_WEIGHT_KG,
  heightCm: 178,
  experience: null,
  goal: null,
  focus: [],
  equipment: null,
  homeEquipment: [],
  trainingDays: [0, 2, 4],
  sessionMinutes: 60,
  plan: null,
  customExercises: [],
});

interface OnboardingState {
  draft: OnboardingDraft;
  /** Set once the whole flow (incl. optional progress check prompt) is done. */
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
      // A draft saved by an earlier version gets the fields added since from the defaults.
      merge: (persisted, current) => {
        const saved = persisted as Partial<OnboardingState> | undefined;
        return { ...current, ...saved, draft: { ...current.draft, ...saved?.draft } };
      },
    },
  ),
);

// The draft's own exercises resolve like saved ones, also after a restart (MMKV hydrates on create).
const showDraftExercises = ({ draft }: OnboardingState) =>
  useCustomExerciseStore.setState({
    drafts: Object.fromEntries(draft.customExercises.map((e) => [e.id, e])),
  });
showDraftExercises(useOnboardingStore.getState());
useOnboardingStore.subscribe((state, previous) => {
  if (state.draft.customExercises !== previous.draft.customExercises) showDraftExercises(state);
});

export const useDraft = () => useOnboardingStore((s) => s.draft);
export const useUpdateDraft = () => useOnboardingStore((s) => s.update);
