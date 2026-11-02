// Turns what the coach-chat function reads from the database into what the coach takes: the
// user's training (coach_history), the profile with its active plan, and the chat's earlier
// questions with the tool calls their answers came from. Plain TypeScript without Deno APIs.
import type { CoachCall, CoachTurn } from './chat.ts';
import { type CoachData, type CoachExercise, dayIn, type Measure, splitShares } from './data.ts';
import type { CoachProfile } from './prompt.ts';

/** A set from coach_history: [weight_kg, reps, seconds, rir]. */
type SetRow = [number | null, number | null, number | null, number | null];

/** coach_history's answer (supabase/migrations/20261102130000_coach.sql). */
export interface HistoryRow {
  workouts: {
    name: string;
    started_at: string;
    finished_at: string;
    exercises: { exercise_id: string; sets: SetRow[] }[];
  }[];
  weights: [string, number][];
  checks: [string, number][];
  exercises: {
    id: string;
    name: Record<string, string>;
    measures: Measure[];
    muscles: Record<string, number>;
    equipment: string;
    assisted: boolean;
    cardio: boolean;
  }[];
  custom_exercises: {
    id: string;
    name: string;
    measures: Measure[];
    primary: string[];
    secondary: string[];
  }[];
}

const numberOrNull = (value: unknown) => (value == null ? null : Number(value));

/** The user's training, with exercise names in `language` (English when a catalog name lacks it). */
export function coachData(row: HistoryRow, language: string, timeZone: string): CoachData {
  const exercises = new Map<string, CoachExercise>();
  for (const x of row.exercises) {
    exercises.set(x.id, {
      id: x.id,
      name: x.name[language] ?? x.name.en ?? x.id,
      measures: x.measures,
      ...splitShares(x.muscles),
      bodyweight: x.equipment === 'bodyweight',
      assisted: x.assisted,
      cardio: x.cardio,
    });
  }
  for (const c of row.custom_exercises) {
    exercises.set(c.id, {
      id: c.id,
      name: c.name,
      measures: c.measures,
      primary: c.primary,
      secondary: c.secondary,
      bodyweight: false,
      assisted: false,
      cardio: false,
    });
  }
  return {
    exercises,
    workouts: row.workouts.map((w) => ({
      name: w.name,
      startedAt: w.started_at,
      finishedAt: w.finished_at,
      exercises: w.exercises.map((e) => ({
        exerciseId: e.exercise_id,
        sets: e.sets.map(([weightKg, reps, seconds, rir]) => ({
          weightKg: numberOrNull(weightKg),
          reps: numberOrNull(reps),
          seconds: numberOrNull(seconds),
          rir: numberOrNull(rir),
        })),
      })),
    })),
    weights: row.weights.map(([date, kg]) => ({ date, kg: Number(kg) })),
    checks: row.checks.map(([at, score]) => ({ date: dayIn(at, timeZone), score: Number(score) })),
  };
}

export interface ProfileRow {
  birth_date: string | null;
  unit_preference: 'metric' | 'imperial';
  goal: string | null;
  experience: string | null;
  focus: string[] | null;
  equipment: string | null;
  active_plan_id: string | null;
  language: string | null;
  coach_consent_at: string | null;
}

export const coachProfile = (
  profile: ProfileRow,
  plan: { name: string; sessions_per_week: number } | null,
): CoachProfile => ({
  goal: profile.goal,
  experience: profile.experience,
  focus: profile.focus ?? [],
  equipment: profile.equipment,
  plan: plan ? { name: plan.name, sessionsPerWeek: plan.sessions_per_week } : null,
});

export interface MessageRow {
  id: string;
  role: 'user' | 'coach';
  content: string;
}

/**
 * The chat's questions with their answers, oldest first, from its messages (oldest first) and the
 * runs that wrote them: each answer's tool calls come from the run that saved it.
 */
export function coachTurns(
  messages: MessageRow[],
  runs: { answer_id: string | null; calls: CoachCall[] | null }[],
): CoachTurn[] {
  const callsOf = new Map(runs.map((run) => [run.answer_id, run.calls ?? []]));
  const turns: CoachTurn[] = [];
  let question: string | null = null;
  for (const message of messages) {
    if (message.role === 'user') question = message.content;
    else if (question != null) {
      turns.push({ question, calls: callsOf.get(message.id) ?? [], answer: message.content });
      question = null;
    }
  }
  return turns;
}
