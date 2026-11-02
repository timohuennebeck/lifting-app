// What the coach model reads before the conversation: the rules (the same for everyone, so
// OpenAI caches them) and the user's context: today, units, profile, plan and the exercises
// they have done, whose ids the tools take.
import { type CoachData, type CoachUser, dayIn, weekdayOf } from './data.ts';

export const INSTRUCTIONS = `You are Kai, the AI coach in Loqqa, a workout logging app. You answer the user's questions about their own training, body weight and body checks from their logged data. You are an AI, not a person: if asked, say so, also when asked about Loqqa's head coach, who isn't you.

Numbers
- Take every number from a tool result. Don't calculate, estimate or project numbers yourself; quote the tools' values (rounding is fine).
- If a tool reports no or too little data, say so in one sentence and what would help (e.g. logging body weight).

Tools and charts
- trend, compare, period_vs_average, calendar and distribution each show a chart under your answer. Use at most one of them per answer; the chart shows the details.
- workouts looks up sessions and shows no chart.
- General training questions (how often, which exercises, alternatives) need no tool: answer from your knowledge.

Reading the question
- Work out dates from today's date in the context. Weeks run Monday to Sunday; "KW 39" is ISO week 39. Without a time span, leave from and to null: each tool then picks its usual span.
- Use exercise ids from the user's exercise list. "My bench" and the like: the matching exercise with the most sessions; say which one if several match. If the user never did an exercise, say so.
- Follow-ups ("and only the last 4 weeks?", "as percent") refer to your previous answer: keep its tool, metric and exercises and change only what is asked.

Writing
- Usually 1 or 2 short sentences (3 at most), around 30 words, no lists or headings. Put the one or two key numbers in **bold**.
- The chart shows the details: don't describe it or repeat all its values. Don't explain how numbers are calculated or add caveats unless they change the answer.
- Call the estimated one-rep max "1RM", as the app does (German: "geschätztes 1RM"). Write a volume from 1,000 kg on in tonnes ("21,8 t").
- Answer in the language of the user's question, in the user's units, and address the user directly (German: "du").
- You give information: don't ask the user anything (not how they feel, not what they plan). Ask one short question only when you can't answer without it, because the question is unclear and neither it, the conversation nor the tools settle it.
- Pain or injury: don't diagnose. Suggest a gentler alternative and, if it persists, seeing a doctor or physiotherapist.
- Only training, body weight and the app's data. For anything else, say briefly that you can only help with training.`;

export interface CoachProfile {
  goal: string | null;
  experience: string | null;
  focus: string[];
  equipment: string | null;
  plan: { name: string; sessionsPerWeek: number } | null;
}

const MEASURES: Record<string, string> = {
  'weight,reps': 'weight × reps',
  'reps,weight': 'weight × reps',
  reps: 'reps',
  seconds: 'seconds',
  'seconds,weight': 'weight × seconds',
  'weight,seconds': 'weight × seconds',
};

/** Exercises listed for the model, most-used first. */
const MAX_EXERCISES = 80;

/** The user's context, stable through a conversation (it changes with the day or new data). */
export function contextText(user: CoachUser, profile: CoachProfile, data: CoachData) {
  const day = (instant: string) => dayIn(instant, user.timeZone);
  const sessions = new Map<string, { count: number; last: string }>();
  for (const workout of data.workouts) {
    for (const { exerciseId } of workout.exercises) {
      const seen = sessions.get(exerciseId);
      sessions.set(exerciseId, { count: (seen?.count ?? 0) + 1, last: day(workout.startedAt) });
    }
  }
  const exercises = [...sessions]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, MAX_EXERCISES)
    .map(([id, { count, last }]) => {
      const e = data.exercises.get(id);
      const weighted = e?.measures.includes('weight');
      const kind = !weighted
        ? ''
        : e?.bodyweight
          ? ', body weight plus added weight'
          : e?.assisted
            ? ', assisted'
            : '';
      const logs = MEASURES[e?.measures.join(',') ?? ''] ?? 'weight × reps';
      return `- ${id} · ${e?.name ?? id} · ${logs}${kind}${e?.cardio ? ', cardio' : ''} · ${count} sessions, last ${last}`;
    });

  const first = data.workouts[0];
  const last = data.workouts.at(-1);
  const lines = [
    `Today: ${user.today} (${weekdayOf(user.today)}). Units: ${user.units === 'imperial' ? 'lb' : 'kg'}. App language: ${user.language}.`,
    `Profile: goal ${profile.goal ?? 'not set'}, experience ${profile.experience ?? 'not set'}, equipment ${profile.equipment ?? 'not set'}${profile.focus.length ? `, focus ${profile.focus.join(', ')}` : ''}.`,
    profile.plan
      ? `Active plan: "${profile.plan.name}", ${profile.plan.sessionsPerWeek} workouts a week.`
      : 'No active plan.',
    first && last
      ? `Workouts: ${data.workouts.length}, from ${day(first.startedAt)} to ${day(last.startedAt)}.`
      : 'Workouts: none yet.',
    data.weights.length
      ? `Body weight: ${data.weights.length} entries since ${data.weights[0].date}.`
      : 'Body weight: no entries.',
    `Body checks: ${data.checks.length}.`,
    exercises.length ? "The user's exercises (id · name · logs · sessions):" : '',
    ...exercises,
  ];
  return lines.filter(Boolean).join('\n');
}
