import { nowIso } from '@/shared/data/json';
import { db } from '@/shared/data/powersync/database';
import { saveProfile } from '@/shared/data/profile';
import { insertPlan } from '@/shared/data/templates';

import type { OnboardingDraft } from '../stores/onboarding-store';

/**
 * Writes the onboarding answers as the user's profile and stores the drafted plan
 * as their active collection. Safe to call again: the plan is only inserted once.
 */
export async function persistOnboarding(userId: string, draft: OnboardingDraft) {
  const existing = await db.getOptional<{ active_collection_id: string | null }>(
    'SELECT active_collection_id FROM profiles WHERE id = ?',
    [userId],
  );
  let activeCollectionId = existing?.active_collection_id ?? null;
  if (!activeCollectionId && draft.plan?.days.length) {
    activeCollectionId = await insertPlan(userId, draft.plan);
  }
  await saveProfile(userId, {
    firstName: draft.firstName.trim(),
    sex: draft.sex,
    age: draft.age,
    unitSystem: draft.unitSystem,
    weightKg: draft.weightKg,
    heightCm: draft.heightCm,
    experience: draft.experience,
    complaints: draft.complaints,
    goal: draft.goal,
    focus: draft.focus,
    equipment: draft.equipment,
    trainingDays: draft.trainingDays,
    sessionMinutes: draft.sessionMinutes,
    activeCollectionId,
    onboardedAt: nowIso(),
  });
}

/** Waits (bounded) for the first PowerSync download, then tells whether onboarding is done. */
export async function isOnboardedAfterSync(userId: string, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await db.waitForFirstSync(controller.signal);
  } catch {
    // Offline or slow: fall back to whatever is already local.
  } finally {
    clearTimeout(timer);
  }
  const row = await db.getOptional<{ onboarded_at: string | null }>(
    'SELECT onboarded_at FROM profiles WHERE id = ?',
    [userId],
  );
  return !!row?.onboarded_at;
}
