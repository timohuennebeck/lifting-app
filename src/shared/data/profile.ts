import { eq } from 'drizzle-orm';

import type { AppLanguage } from '@/shared/i18n/resources';
import type { UnitSystem } from '@/shared/lib/format';
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
/**
 * How a plan's routines divide the body: full body, upper/lower, upper/lower/full body (3 a week),
 * push/pull/legs, push/pull/legs plus an arms and shoulders day (4 a week) or plus upper/lower
 * (5 a week), one area a day ("bro") or the Arnold split.
 */
export type Split =
  | 'full_body'
  | 'upper_lower'
  | 'upper_lower_full'
  | 'ppl'
  | 'ppl_arms'
  | 'ppl_upper_lower'
  | 'bro'
  | 'arnold';

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
  unitPreference: UnitSystem;
  heightCm: number | null;
  experience: Experience | null;
  goal: Goal | null;
  focus: MuscleId[];
  equipment: EquipmentAccess | null;
  /** With `equipment` 'home': the equipment ids the user has. */
  homeEquipment: string[];
  sessionMinutes: number | null;
  /** The split the last plan made from the answers used; null: none picked (the AI chose). */
  split: Split | null;
  activePlanId: string | null;
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
    unitPreference: (r.unit_preference as UnitSystem | null) ?? 'metric',
    heightCm: r.height_cm,
    experience: r.experience as Experience | null,
    goal: r.goal as Goal | null,
    focus: parseJson(r.focus, []),
    equipment: r.equipment as EquipmentAccess | null,
    homeEquipment: parseJson(r.home_equipment, []),
    sessionMinutes: r.session_minutes,
    split: r.split as Split | null,
    activePlanId: r.active_plan_id,
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
  return useProfile().profile?.unitPreference ?? 'metric';
}

export type ProfilePatch = Partial<Omit<Profile, 'id' | 'createdAt'>>;

const toJson = (value: unknown[] | undefined) => value && JSON.stringify(value);

/** Profile columns for a patch; fields left out stay undefined, so Drizzle skips them. */
const toColumns = (p: ProfilePatch) => ({
  first_name: p.firstName,
  sex: p.sex,
  birth_date: p.birthDate,
  unit_preference: p.unitPreference,
  height_cm: p.heightCm,
  experience: p.experience,
  goal: p.goal,
  focus: toJson(p.focus),
  equipment: p.equipment,
  home_equipment: toJson(p.homeEquipment),
  session_minutes: p.sessionMinutes,
  split: p.split,
  active_plan_id: p.activePlanId,
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
