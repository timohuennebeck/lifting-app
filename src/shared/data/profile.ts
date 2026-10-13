import { eq } from 'drizzle-orm';

import type { AppLanguage } from '@/shared/i18n/resources';
import { CM_PER_INCH, type UnitSystem } from '@/shared/lib/format';
import { clamp } from '@/shared/lib/math';
import { useUserId } from '@/shared/stores/session-store';
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

/** Limits of the body measurements, in onboarding and in Settings. Ages in whole years. */
export const AGE_RANGE = { min: 14, max: 99 } as const;
const HEIGHT_CM = { min: 120, max: 230 } as const;
const HEIGHT_IN = { min: 47, max: 91 } as const;

/** Height range in the user's unit (cm or inches). */
export const heightRange = (units: UnitSystem) => (units === 'imperial' ? HEIGHT_IN : HEIGHT_CM);

/** Stored cm → value edited in the user's unit (whole inches), clamped to the range. */
export function heightToDisplay(cm: number, units: UnitSystem) {
  const { min, max } = heightRange(units);
  return clamp(units === 'imperial' ? Math.round(cm / CM_PER_INCH) : cm, min, max);
}

/** Edited value → whole centimetres as the profile stores them. */
export function heightFromDisplay(value: number, units: UnitSystem) {
  const { min, max } = heightRange(units);
  const v = clamp(value, min, max);
  return units === 'imperial' ? Math.round(v * CM_PER_INCH) : v;
}

/**
 * Whole years someone born on `birthDate` (YYYY-MM-DD) is on `today`, counting the birthday
 * itself. A 29 February birthday falls on 1 March in other years.
 */
export function ageFrom(birthDate: string, today = new Date()) {
  const [year, month, day] = birthDate.split('-').map(Number);
  const todayMonth = today.getMonth() + 1;
  const hadBirthday = todayMonth > month || (todayMonth === month && today.getDate() >= day);
  return today.getFullYear() - year - (hadBirthday ? 0 : 1);
}

export interface Profile {
  id: string;
  firstName: string;
  sex: Sex | null;
  /** ISO date (YYYY-MM-DD); see `ageFrom`. */
  birthDate: string | null;
  unitSystem: UnitSystem;
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
  /** App language, mirrored for the team and server-side messages. */
  language: AppLanguage | null;
  /** Profile photo in the "avatars" bucket; null shows the initials. */
  avatarPath: string | null;
  /** "About you", written by the user. */
  bio: string | null;
  onboardedAt: string | null;
  createdAt: string;
}

function toProfile(r: ProfileRecord): Profile {
  return {
    id: r.id,
    firstName: r.first_name ?? '',
    sex: r.sex as Sex | null,
    birthDate: r.birth_date,
    unitSystem: (r.unit_system as UnitSystem | null) ?? 'metric',
    heightCm: r.height_cm,
    experience: r.experience as Experience | null,
    complaints: parseJson(r.complaints, []),
    goal: r.goal as Goal | null,
    focus: parseJson(r.focus, []),
    equipment: r.equipment as EquipmentAccess | null,
    trainingDays: parseJson(r.training_days, []),
    sessionMinutes: r.session_minutes,
    activeCollectionId: r.active_collection_id,
    language: r.language as AppLanguage | null,
    avatarPath: r.avatar_path,
    bio: r.bio,
    onboardedAt: r.onboarded_at,
    createdAt: r.created_at,
  };
}

const firstProfile = (rows: ProfileRecord[]) => (rows[0] ? toProfile(rows[0]) : null);

export function useProfile() {
  const userId = useUserId();
  const { data, isLoading } = useDrizzleQuery({
    queryKey: queryKeys.profile.current(userId ?? '').queryKey,
    query: drizzle
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId ?? '')),
    enabled: !!userId,
    map: firstProfile,
  });
  return { profile: data ?? null, isLoading };
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
  birth_date: p.birthDate,
  unit_system: p.unitSystem,
  height_cm: p.heightCm,
  experience: p.experience,
  complaints: toJson(p.complaints),
  goal: p.goal,
  focus: toJson(p.focus),
  equipment: p.equipment,
  training_days: toJson(p.trainingDays),
  session_minutes: p.sessionMinutes,
  active_collection_id: p.activeCollectionId,
  language: p.language,
  avatar_path: p.avatarPath,
  bio: p.bio,
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
