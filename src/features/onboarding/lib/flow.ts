import type { BodyPartId } from '@/shared/ui/muscle-map/body-paths';

/** Step counts per onboarding phase ("About you" and "Let's go"). */
export const ABOUT_STEPS = 9;
export const START_STEPS = 3;

interface ComplaintArea {
  id: string;
  /** Body parts highlighted on the map for this area (prototype's MMP). */
  muscles: readonly BodyPartId[];
}

export const COMPLAINT_AREAS = [
  { id: 'neck', muscles: ['neck', 'traps'] },
  { id: 'shoulders', muscles: ['front_delts', 'side_delts', 'rear_delts'] },
  { id: 'elbows', muscles: ['forearms'] },
  { id: 'wrists', muscles: ['hands'] },
  { id: 'upper_back', muscles: ['upper_back', 'lats'] },
  { id: 'lower_back', muscles: ['lower_back'] },
  { id: 'hips', muscles: ['glutes', 'adductors'] },
  { id: 'knees', muscles: ['knees'] },
  { id: 'ankles', muscles: ['feet'] },
] as const satisfies readonly ComplaintArea[];

export const EXPERIENCE_LEVELS = ['none', 'beginner', 'intermediate', 'advanced'] as const;
