import { eq } from 'drizzle-orm';

import { drizzle } from '@/shared/data/powersync/database';
import { plans } from '@/shared/data/powersync/schema';

export async function renamePlan(planId: string, name: string) {
  await drizzle.update(plans).set({ name: name.trim() }).where(eq(plans.id, planId));
}
