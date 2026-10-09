import { eq } from 'drizzle-orm';

import { useUserId } from '@/shared/stores/session-store';
import type { UnitSystem } from '@/shared/lib/format';
import type { MuscleId } from '@/shared/ui/muscle-map/body-paths';

import { parseJson, nowIso } from './json';
import { drizzle, type Executor } from './powersync/database';
import { profiles, type ProfileRecord } from './powersync/schema';
import { queryKeys } from './query-keys';
import { useDrizzleQuery } from './use-drizzle-query';

export type Sex = 'male' | 'female' | 'unspecified';
export type Experience = 'none' | 'beginner' | 'intermediate' | 'advanced';
export type Goal = 'hypertrophy' | 'strength' | 'strength_hypertrophy';
export type EquipmentAccess = 'gym' | 'home' | 'bodyweight';

export interface Profile {
  id: string;
  firstName: string;
  sex: Sex | null;
  age: number | null;
  unitSystem: UnitSystem;
  weightKg: number | null;
  heightCm: number | null;
  experience: Experience | null;
  complaints: string[];
  goal: Goal | null;
  focus: MuscleId[];
  equipment: EquipmentAccess | null;
  /** Monday-based weekday indexes. */
  trainingDays: number[];
  sessionMinutes: number | null;
  activeCollectionId: string | null;
  onboardedAt: string | null;
  createdAt: string | null;
}

function toProfile(r: ProfileRecord): Profile {
  return {
    id: r.id,
    firstName: r.first_name ?? '',
    sex: r.sex as Sex | null,
    age: r.age,
    unitSystem: (r.unit_system as UnitSystem | null) ?? 'metric',
    weightKg: r.weight_kg,
    heightCm: r.height_cm,
    experience: r.experience as Experience | null,
    complaints: parseJson(r.complaints, []),
    goal: r.goal as Goal | null,
    focus: parseJson(r.focus, []),
    equipment: r.equipment as EquipmentAccess | null,
    trainingDays: parseJson(r.training_days, []),
    sessionMinutes: r.session_minutes,
    activeCollectionId: r.active_collection_id,
    onboardedAt: r.onboarded_at,
    createdAt: r.created_at,
  };
}

const firstProfile = (rows: ProfileRecord[]) => (rows[0] ? toProfile(rows[0]) : null);

export function useProfile() {
  const userId = useUserId();
  const query = useDrizzleQuery({
    queryKey: queryKeys.profile.current(userId ?? '').queryKey,
    query: drizzle
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId ?? '')),
    enabled: !!userId,
    map: firstProfile,
  });
  return { ...query, profile: query.data ?? null };
}

/** The signed-in user's unit system (metric until the profile loaded). */
export function useUnits(): UnitSystem {
  return useProfile().profile?.unitSystem ?? 'metric';
}

export type ProfilePatch = Partial<Omit<Profile, 'id' | 'createdAt'>>;

const toJson = (value: unknown[] | undefined) => value && JSON.stringify(value);

/** Profile columns for a patch; fields left out stay undefined, so Drizzle skips them. */
const toColumns = (p: ProfilePatch) => ({
  first_name: p.firstName,
  sex: p.sex,
  age: p.age,
  unit_system: p.unitSystem,
  weight_kg: p.weightKg,
  height_cm: p.heightCm,
  experience: p.experience,
  complaints: toJson(p.complaints),
  goal: p.goal,
  focus: toJson(p.focus),
  equipment: p.equipment,
  training_days: toJson(p.trainingDays),
  session_minutes: p.sessionMinutes,
  active_collection_id: p.activeCollectionId,
  onboarded_at: p.onboardedAt,
});

/**
 * Inserts or updates the signed-in user's profile row (PowerSync views have no UPSERT).
 * Pass a transaction to make it part of a larger write.
 */
export async function saveProfile(
  userId: string,
  patch: ProfilePatch,
  executor: Executor = drizzle,
) {
  const columns = toColumns(patch);
  const existing = await executor
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .get();
  if (existing) {
    await executor
      .update(profiles)
      .set({ ...columns, updated_at: nowIso() })
      .where(eq(profiles.id, userId));
    return;
  }
  await executor.insert(profiles).values({
    id: userId,
    user_id: userId,
    created_at: nowIso(),
    updated_at: nowIso(),
    ...columns,
  });
}
