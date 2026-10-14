import type { CustomExercise } from '@/shared/data/exercises';
import { drizzle } from '@/shared/data/powersync/database';
import { type ProfilePatch, saveProfile } from '@/shared/data/profile';
import { insertPlan, type PlanDraft } from '@/shared/data/plans';

/**
 * Saves a plan made in the app and makes it the plan Today follows; `answers` (the flow's, when
 * the plan was made from them) go into the profile with it.
 */
export async function saveActivePlan(
  userId: string,
  plan: PlanDraft,
  newExercises: CustomExercise[],
  answers: ProfilePatch = {},
) {
  await drizzle.transaction(async (tx) => {
    const activePlanId = await insertPlan(tx, userId, plan, newExercises);
    await saveProfile(userId, { ...answers, activePlanId }, tx);
  });
}
