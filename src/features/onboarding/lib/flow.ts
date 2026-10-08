import type { MuscleId } from '@/shared/ui/muscle-map/body-paths';

/** Step counts per onboarding phase ("About you" and "Let's go"). */
export const ABOUT_STEPS = 9;
export const START_STEPS = 3;

export const AGE_RANGE = { min: 14, max: 99 } as const;
export const WEIGHT_KG = { min: 35, max: 200, step: 0.5 } as const;
export const WEIGHT_LB = { min: 80, max: 440, step: 1 } as const;
export const HEIGHT_CM = { min: 130, max: 220 } as const;
export const HEIGHT_IN = { min: 48, max: 90 } as const;

interface ComplaintArea {
  id: string;
  /** Muscles highlighted on the body map for this area. */
  muscles: readonly MuscleId[];
}

export const COMPLAINT_AREAS = [
  { id: 'neck', muscles: ['neck', 'traps'] },
  { id: 'shoulders', muscles: ['front_delts', 'side_delts', 'rear_delts'] },
  { id: 'elbows', muscles: ['forearms'] },
  { id: 'wrists', muscles: ['forearms'] },
  { id: 'upper_back', muscles: ['upper_back', 'lats'] },
  { id: 'lower_back', muscles: ['lower_back'] },
  { id: 'hips', muscles: ['glutes', 'adductors'] },
  { id: 'knees', muscles: ['quads'] },
  { id: 'ankles', muscles: ['tibialis', 'calves'] },
] as const satisfies readonly ComplaintArea[];

export type ComplaintId = (typeof COMPLAINT_AREAS)[number]['id'];

export const EXPERIENCE_LEVELS = ['none', 'beginner', 'intermediate', 'advanced'] as const;
