import type { CustomExercise } from '@/shared/data/exercises';
import { drizzle } from '@/shared/data/powersync/database';
import { saveProfile } from '@/shared/data/profile';
import { insertPlan, type PlanDraft } from '@/shared/data/templates';

/** Saves a plan made in the app as a new collection and makes it the plan Today follows. */
export async function saveActivePlan(
  userId: string,
  plan: PlanDraft,
  newExercises: CustomExercise[],
) {
  await drizzle.transaction(async (tx) => {
    const activeCollectionId = await insertPlan(tx, userId, plan, newExercises);
    await saveProfile(userId, { activeCollectionId }, tx);
  });
}
