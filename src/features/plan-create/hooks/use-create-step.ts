import { useDraft } from '@/features/onboarding/stores/onboarding-store';

/** The "Create plan" steps in order; "Eigene Geräte" adds the one asking what the user has. */
const STEPS = [
  'goal',
  'focus',
  'equipment',
  'homeEquipment',
  'sessions',
  'split',
  'duration',
  'planName',
] as const;

type CreateStep = (typeof STEPS)[number];

/** Where a step stands in the "Create plan" branch, for the step counter. */
export function useCreateStep(id: CreateStep) {
  const atHome = useDraft().equipment === 'home';
  const steps = STEPS.filter((s) => s !== 'homeEquipment' || atHome);
  return { step: steps.indexOf(id) + 1, total: steps.length };
}
