import type { OnboardingDraft } from '@/features/onboarding/stores/onboarding-store';
import type { ImportFailure } from '@/features/plan-import/lib/plan-import-service';
import type { EquipmentAccess, Experience, Goal, ProfilePatch, Split } from '@/shared/data/profile';
import type { MuscleId } from '@/shared/ui/muscle-map/body-paths';

import { chosenSplit } from './splits';

/** What the AI makes the plan from (generate-plan); no name, no body data. */
export interface PlanAnswers {
  goal: Goal;
  focus: MuscleId[];
  equipment: EquipmentAccess;
  /** With `equipment` 'home': the ticked equipment ids. */
  homeEquipment: string[];
  /** Workouts per week. */
  sessionsPerWeek: number;
  /** How the routines divide the body; one that suits the workouts a week. */
  split: Split;
  sessionMinutes: number;
  experience: Experience | null;
}

/** The flow's answers, with a default for each one skipped. */
export function answersFromDraft(draft: OnboardingDraft): PlanAnswers {
  return {
    goal: draft.goal ?? 'hypertrophy',
    focus: draft.focus,
    equipment: draft.equipment ?? 'gym',
    homeEquipment: draft.equipment === 'home' ? draft.homeEquipment : [],
    sessionsPerWeek: draft.sessionsPerWeek,
    split: chosenSplit(draft),
    sessionMinutes: draft.sessionMinutes,
    experience: draft.experience,
  };
}

/**
 * The answers the "create" steps ask, as the profile keeps them (workouts per week go into the
 * plan). The ticked home equipment stays also with another answer, for the next time "Eigene
 * Geräte" is picked.
 */
export function profileAnswers(draft: OnboardingDraft): ProfilePatch {
  const { goal, focus, equipment, split, sessionMinutes } = answersFromDraft(draft);
  return { goal, focus, equipment, homeEquipment: draft.homeEquipment, split, sessionMinutes };
}

/** Why the AI made no plan, as the user is told (planCreate:generate.errors). */
export const generateFailure = (reason: ImportFailure) =>
  reason === 'offline' || reason === 'limit' ? reason : 'failed';
