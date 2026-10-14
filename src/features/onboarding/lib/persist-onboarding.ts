import type { User } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';

import { nowIso } from '@/shared/data/json';
import { db, drizzle } from '@/shared/data/powersync/database';
import { profiles } from '@/shared/data/powersync/schema';
import { saveProfile } from '@/shared/data/profile';
import { supabase } from '@/shared/data/supabase';
import { insertPlan } from '@/shared/data/templates';
import { saveWeightEntry } from '@/shared/data/weight-entries';
import { type AppLanguage, i18n } from '@/shared/i18n';
import { toIsoDate } from '@/shared/lib/date';

import { type OnboardingDraft, useOnboardingStore } from '../stores/onboarding-store';

/**
 * Writes the onboarding answers as the user's profile, the weight as their first weight entry,
 * and stores the drafted plan as their active collection. Safe to call again: the plan is only
 * inserted once, and the weight replaces the day's entry.
 */
export async function persistOnboarding(userId: string, draft: OnboardingDraft) {
  // One transaction: a failed profile write must not leave a plan behind that a retry duplicates.
  await drizzle.transaction(async (tx) => {
    const existing = await tx
      .select({ active_collection_id: profiles.active_collection_id })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .get();
    let activeCollectionId = existing?.active_collection_id ?? null;
    if (!activeCollectionId && draft.plan?.days.length) {
      activeCollectionId = await insertPlan(tx, userId, draft.plan, draft.customExercises ?? []);
    }
    await saveProfile(
      userId,
      {
        firstName: draft.firstName.trim(),
        sex: draft.sex,
        birthDate: draft.birthDate,
        unitSystem: draft.unitSystem,
        heightCm: draft.heightCm,
        experience: draft.experience,
        complaints: draft.complaints,
        goal: draft.goal,
        focus: draft.focus,
        equipment: draft.equipment,
        trainingDays: draft.trainingDays,
        sessionMinutes: draft.sessionMinutes,
        activeCollectionId,
        language: i18n.language as AppLanguage,
        onboardedAt: nowIso(),
      },
      tx,
    );
  });
  // On its own: an upload the server rejects is dropped whole, and an entry must not take the
  // profile and plan with it.
  await saveWeightEntry(userId, toIsoDate(new Date()), draft.weightKg);
}

/** How long an onboarded account waits for its data before the app opens without it. */
const FIRST_SYNC_TIMEOUT_MS = 8000;

/**
 * Tells whether the account finished onboarding, asking the server: right after sign-in the local
 * database may not hold the profile yet. Throws when the server can't be reached, so a slow
 * connection never passes for a new account (onboarding again would overwrite its profile).
 * An onboarded account then waits (bounded) for its first download, so the app opens with its data.
 */
export async function isOnboardedAfterSync(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('onboarded_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.onboarded_at) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FIRST_SYNC_TIMEOUT_MS);
  try {
    await db.waitForFirstSync(controller.signal);
  } catch {
    // Slow: the rest arrives in the background.
  } finally {
    clearTimeout(timer);
  }
  return true;
}

/** Signed in, onboarding goes on: a draft without a name takes the one given at sign-up. */
export function adoptSignUpName(user: User) {
  const { draft, update } = useOnboardingStore.getState();
  const { first_name: firstName, full_name: fullName } = user.user_metadata ?? {};
  // Email sign-up stores the first name; Google gives the full name.
  const name =
    typeof firstName === 'string'
      ? firstName
      : typeof fullName === 'string'
        ? fullName.split(' ')[0]
        : undefined;
  if (!draft.firstName && name) update({ firstName: name });
}
