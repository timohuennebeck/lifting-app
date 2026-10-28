import type { UnitSystem } from '@/shared/lib/format';

import type { WorkoutDetail } from '../data/workout-detail';
import { useRecentSessions } from '../data/recent-sessions';
import { type SetSuggestion, suggestionsFor } from '../lib/set-suggestions';
import { useWorkoutSessionStore } from '../stores/workout-session-store';

/** The suggestions of every exercise of the live workout, by workout exercise id. */
export function useSetSuggestions(workout: WorkoutDetail, units: UnitSystem) {
  const { data: recent } = useRecentSessions(workout.exercises.map((e) => e.exerciseId));
  const logged = useWorkoutSessionStore((s) => s.logged);
  const out: Record<string, SetSuggestion[] | null> = {};
  for (const exercise of workout.exercises) {
    const sessions = recent?.[exercise.exerciseId] ?? [];
    out[exercise.id] = suggestionsFor(exercise, sessions, logged, workout.startedAt, units);
  }
  return out;
}
