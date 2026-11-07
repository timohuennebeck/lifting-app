import type { UnitSystem } from '@/shared/lib/format';

import type { WorkoutDetail } from '../data/workout-detail';
import { type RecentSession, useRecentSessions } from '../data/recent-sessions';
import { type SetSuggestion, suggestionsFor } from '../lib/set-suggestions';
import { useWorkoutSessionStore } from '../stores/workout-session-store';

/**
 * The suggestions of every exercise of the live workout, and its sets last time (the newest of
 * its recent workouts), by workout exercise id.
 */
export function useSetSuggestions(workout: WorkoutDetail, units: UnitSystem) {
  const { data: recent } = useRecentSessions(
    workout.id,
    workout.exercises.map((e) => e.exerciseId),
  );
  const logged = useWorkoutSessionStore((s) => s.logged);
  const suggestions: Record<string, (SetSuggestion | null)[] | null> = {};
  const last: Record<string, RecentSession | undefined> = {};
  for (const exercise of workout.exercises) {
    const sessions = recent?.[exercise.exerciseId] ?? [];
    suggestions[exercise.id] = suggestionsFor(exercise, sessions, logged, workout.startedAt, units);
    last[exercise.id] = sessions[0];
  }
  return { suggestions, last };
}
