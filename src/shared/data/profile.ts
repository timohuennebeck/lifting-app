import { useUserId } from '@/shared/stores/session-store';
import type { UnitSystem } from '@/shared/lib/format';
import type { MuscleId } from '@/shared/ui/muscle-map/body-paths';

import { parseJson, nowIso } from './json';
import { db } from './powersync/database';
import type { ProfileRecord } from './powersync/schema';
import { queryKeys } from './query-keys';
import { useSqlQuery } from './use-sql-query';

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

type ProfileRow = ProfileRecord & { id: string };

function toProfile(r: ProfileRow): Profile {
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

const firstProfile = (rows: ProfileRow[]) => (rows[0] ? toProfile(rows[0]) : null);

export function useProfile() {
  const userId = useUserId();
  const query = useSqlQuery({
    queryKey: queryKeys.profile.current(userId ?? '').queryKey,
    sql: 'SELECT * FROM profiles WHERE id = ?',
    parameters: [userId],
    enabled: !!userId,
    map: firstProfile,
  });
  return { ...query, profile: query.data ?? null };
}

/** The signed-in user's unit system (metric until the profile loaded). */
export function useUnits(): UnitSystem {
  return useProfile().profile?.unitSystem ?? 'metric';
}

const COLUMNS: Record<keyof Omit<Profile, 'id' | 'createdAt'>, string> = {
  firstName: 'first_name',
  sex: 'sex',
  age: 'age',
  unitSystem: 'unit_system',
  weightKg: 'weight_kg',
  heightCm: 'height_cm',
  experience: 'experience',
  complaints: 'complaints',
  goal: 'goal',
  focus: 'focus',
  equipment: 'equipment',
  trainingDays: 'training_days',
  sessionMinutes: 'session_minutes',
  activeCollectionId: 'active_collection_id',
  onboardedAt: 'onboarded_at',
};

export type ProfilePatch = Partial<Omit<Profile, 'id' | 'createdAt'>>;

/** Inserts or updates the signed-in user's profile row (PowerSync views have no UPSERT). */
export async function saveProfile(userId: string, patch: ProfilePatch) {
  const entries = Object.entries(patch).map(([key, value]) => [
    COLUMNS[key as keyof ProfilePatch],
    Array.isArray(value) ? JSON.stringify(value) : value,
  ]);
  const existing = await db.getOptional('SELECT id FROM profiles WHERE id = ?', [userId]);
  if (existing) {
    const sets = [...entries.map(([c]) => `${c} = ?`), 'updated_at = ?'].join(', ');
    await db.execute(`UPDATE profiles SET ${sets} WHERE id = ?`, [
      ...entries.map(([, v]) => v),
      nowIso(),
      userId,
    ]);
    return;
  }
  const cols = ['id', 'user_id', 'created_at', 'updated_at', ...entries.map(([c]) => c)];
  await db.execute(
    `INSERT INTO profiles (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
    [userId, userId, nowIso(), nowIso(), ...entries.map(([, v]) => v)],
  );
}
