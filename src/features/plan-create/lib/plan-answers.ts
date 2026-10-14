import type { OnboardingDraft } from '@/features/onboarding/stores/onboarding-store';
import type { ImportFailure } from '@/features/plan-import/lib/plan-import-service';
import type { EquipmentAccess, Experience, Goal } from '@/shared/data/profile';
import type { MuscleId } from '@/shared/ui/muscle-map/body-paths';

/** What the AI makes the plan from (generate-plan); no name, no body data. */
export interface PlanAnswers {
  goal: Goal;
  focus: MuscleId[];
  equipment: EquipmentAccess;
  /** Monday-based weekday indexes. */
  trainingDays: number[];
  sessionMinutes: number;
  experience: Experience | null;
}

/** The flow's answers, with a default for each one skipped. */
export function answersFromDraft(draft: OnboardingDraft): PlanAnswers {
  return {
    goal: draft.goal ?? 'hypertrophy',
    focus: draft.focus,
    equipment: draft.equipment ?? 'gym',
    trainingDays: draft.trainingDays.length ? draft.trainingDays : [0, 2, 4],
    sessionMinutes: draft.sessionMinutes,
    experience: draft.experience,
  };
}

/** Why the AI made no plan, as the user is told (planCreate:generate.errors). */
export const generateFailure = (reason: ImportFailure) =>
  reason === 'offline' || reason === 'limit' ? reason : 'failed';
