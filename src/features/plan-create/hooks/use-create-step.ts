import { useDraft } from '@/features/onboarding/stores/onboarding-store';

import { splitsFor } from '../lib/splits';

/**
 * The "Create plan" steps in order; "Eigene Geräte" adds the one asking what the user has, and
 * the split is asked only when more than one suits the workouts a week.
 */
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
  const { equipment, sessionsPerWeek, experience } = useDraft();
  const skip = new Set<CreateStep>();
  if (equipment !== 'home') skip.add('homeEquipment');
  if (splitsFor(sessionsPerWeek, experience).length < 2) skip.add('split');
  const steps = STEPS.filter((s) => !skip.has(s));
  return { step: steps.indexOf(id) + 1, total: steps.length };
}
