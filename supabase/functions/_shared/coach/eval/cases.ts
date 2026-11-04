// The eval's questions, from the design (Coach Screens) and the kinds of questions users ask.
// Each names the tool expected behind the answer and checks its arguments; the fixtures' today
// is Friday, 2026-11-06.
import { daysBetween, isDay } from '../data.ts';

type Args = Record<string, unknown>;

export interface Case {
  id: string;
  user: 'lena' | 'sam';
  /** The conversation: questions before the last set up a follow-up; the last one is graded. */
  turns: string[];
  /** The language the answer should be in: the question's. */
  language: 'de' | 'en';
  /** Any of these: the last chart tool called, else the last tool called; null: no tool. */
  tool: (string | null)[];
  /** Problems with that call's arguments. */
  args?: (args: Args) => string[];
  /** Something the answer has to say. */
  says?: RegExp;
  /** The answer works numbers out from the tools' values: these ones, or true for any. */
  derives?: true | number[];
  /** The question is unclear: the answer asks back. Every other answer must not ask anything. */
  asks?: boolean;
}

/** A day within `slack` days of the expected one. */
const near = (value: unknown, day: string, slack = 3) =>
  isDay(value) && Math.abs(daysBetween(day, value)) <= slack;
const today = (value: unknown) => value == null || near(value, '2026-11-06', 1);
/** The messages of the checks that fail. */
const problems = (...checks: [boolean, string][]) => checks.filter(([ok]) => !ok).map(([, m]) => m);
const sameSet = (value: unknown, ids: string[]) =>
  Array.isArray(value) && value.length === ids.length && ids.every((id) => value.includes(id));

/** A workout of `min` to `max` exercises, none twice, only of the `allowed` ones if given. */
const workoutOf = (min: number, max: number, allowed?: string[]) => (args: Args) => {
  const ids = ((args.exercises ?? []) as Args[]).map((e) => String(e.exercise_id));
  return problems(
    [ids.length >= min && ids.length <= max, `${ids.length} exercises`],
    [new Set(ids).size === ids.length, 'an exercise twice'],
    [typeof args.name === 'string' && args.name.length <= 24, `name ${args.name}`],
    [!allowed || ids.every((id) => allowed.includes(id)), `exercises ${ids.join(', ')}`],
  );
};
const DUMBBELLS = [
  'lateral-raise',
  'goblet-squat',
  'dumbbell-bench-press',
  'bent-over-dumbbell-row',
  'plank',
  'pull-up',
  'push-up',
];
const BUILD_PUSH = 'Bau mir ein Push-Training für heute, etwa 45 Minuten';

const WEIGHT_6_MONTHS = 'Wie hat sich mein Gewicht in den letzten 6 Monaten entwickelt?';
const BIG_THREE = 'Wie haben sich meine drei Grundübungen entwickelt?';
const WEEK_VS_USUAL = 'War diese Woche mehr als sonst?';
const SINCE_JULY = 'Wie konsequent war ich seit Juli?';
const NEGLECTED = 'Welche Muskeln trainiere ich zu wenig?';

export const CASES: Case[] = [
  // ---------- Lena: German, kg, ten months of data ----------
  {
    id: 'weight-6-months',
    user: 'lena',
    turns: [WEIGHT_6_MONTHS],
    language: 'de',
    tool: ['trend'],
    args: (a) =>
      problems(
        [a.metric === 'body_weight', `metric ${a.metric}`],
        [near(a.from, '2026-05-06', 5), `from ${a.from}, expected about 2026-05-06`],
        [today(a.to), `to ${a.to}`],
      ),
  },
  {
    id: 'weight-4-weeks',
    user: 'lena',
    turns: [WEIGHT_6_MONTHS, 'Und wie sieht es nur für die letzten 4 Wochen aus?'],
    language: 'de',
    tool: ['trend'],
    args: (a) =>
      problems(
        [a.metric === 'body_weight', `metric ${a.metric}`],
        [near(a.from, '2026-10-09'), `from ${a.from}, expected about 2026-10-09`],
      ),
  },
  {
    // About 80 kg, losing 0.15 to 0.18 kg a week: 27 to 33 weeks.
    id: 'weight-target',
    user: 'lena',
    turns: ['Wie viel wiege ich derzeit?', 'Und wann werde ich voraussichtlich die 75 erreichen?'],
    language: 'de',
    tool: ['trend', null],
    derives: true,
    says: /\b(2[5-9]|3[0-5])\s+Wochen|\b[6-8]\s+Monate|halbes? Jahr|\b(April|Mai|Juni|Juli)\b/,
  },
  {
    id: 'weight-target-wrong-way',
    user: 'lena',
    turns: ['Wann erreiche ich 90 kg?'],
    language: 'de',
    tool: ['trend'],
    derives: true,
    says: /sink|f[äa]ll|nimmst .*ab|abgenommen|abnimm|weniger|runter|nach unten/i,
  },
  {
    id: 'bench-target',
    user: 'lena',
    turns: ['Wann schaffe ich beim Bankdrücken ein 1RM von 130 kg?'],
    language: 'de',
    tool: ['trend'],
    derives: true,
    args: (a) => problems([a.exercise_id === 'bench-press', `exercise ${a.exercise_id}`]),
  },
  {
    id: 'bench-since-january',
    user: 'lena',
    turns: ['Wie läuft mein Bankdrücken seit Januar?'],
    language: 'de',
    tool: ['trend'],
    args: (a) =>
      problems(
        [a.exercise_id === 'bench-press', `exercise ${a.exercise_id}`],
        [a.metric === 'e1rm' || a.metric === 'top_weight', `metric ${a.metric}`],
        [a.from == null || near(a.from, '2026-01-01', 5), `from ${a.from}`],
      ),
  },
  {
    id: 'squat-records',
    user: 'lena',
    turns: ['Wie viele Rekorde hatte ich dieses Jahr bei der Kniebeuge?'],
    language: 'de',
    tool: ['trend'],
    args: (a) =>
      problems(
        [a.exercise_id === 'squat', `exercise ${a.exercise_id}`],
        [a.show_records === true, 'records not shown'],
        [a.from == null || near(a.from, '2026-01-01', 5), `from ${a.from}`],
      ),
  },
  {
    id: 'big-three',
    user: 'lena',
    turns: [BIG_THREE],
    language: 'de',
    tool: ['compare'],
    args: (a) =>
      problems([
        sameSet(a.exercise_ids, ['bench-press', 'squat', 'deadlift']),
        `exercises ${a.exercise_ids}`,
      ]),
  },
  {
    id: 'big-three-percent',
    user: 'lena',
    turns: [BIG_THREE, 'Zeig mir das als Prozent vom Start.'],
    language: 'de',
    derives: [100, 109, 115, 133],
    tool: ['compare'],
    args: (a) =>
      problems(
        [
          sameSet(a.exercise_ids, ['bench-press', 'squat', 'deadlift']),
          `exercises ${a.exercise_ids}`,
        ],
        [a.as_percent === true, 'not as percent'],
      ),
  },
  {
    id: 'week-vs-usual',
    user: 'lena',
    turns: [WEEK_VS_USUAL],
    language: 'de',
    tool: ['period_vs_average'],
    args: (a) => problems([a.period === 'week', `period ${a.period}`]),
  },
  {
    id: 'month-follow-up',
    user: 'lena',
    turns: [WEEK_VS_USUAL, 'Und im Vergleich zum letzten Monat?'],
    language: 'de',
    tool: ['period_vs_average'],
    args: (a) =>
      problems([
        a.period === 'month' || (a.period === 'week' && Number(a.periods) <= 5),
        `period ${a.period}, periods ${a.periods}`,
      ]),
  },
  {
    id: 'this-vs-last-week',
    user: 'lena',
    turns: ['Vergleich diese Woche mit letzter'],
    language: 'de',
    tool: ['period_vs_average'],
    args: (a) => problems([a.period === 'week', `period ${a.period}`]),
  },
  {
    id: 'consistent-since-july',
    user: 'lena',
    turns: [SINCE_JULY],
    language: 'de',
    tool: ['calendar'],
    args: (a) => problems([near(a.from, '2026-07-01', 1), `from ${a.from}, expected 2026-07-01`]),
  },
  {
    id: 'skipped-weekday',
    user: 'lena',
    turns: [SINCE_JULY, 'An welchem Tag fällt das Training am häufigsten aus?'],
    language: 'de',
    derives: [47],
    tool: ['calendar', 'distribution', null],
    // Of her usual days she skipped Thursday most (9 of 19 since July).
    says: /donnerstag/i,
  },
  {
    id: 'neglected-muscles',
    user: 'lena',
    turns: [NEGLECTED],
    language: 'de',
    tool: ['distribution'],
    args: (a) => problems([a.by === 'muscle', `by ${a.by}`]),
  },
  {
    id: 'exercises-for-that',
    user: 'lena',
    turns: [NEGLECTED, 'Welche Übungen helfen mir da am meisten?'],
    language: 'de',
    tool: [null, 'workouts'],
  },
  {
    id: 'wednesday',
    user: 'lena',
    turns: ['Was habe ich am Mittwoch trainiert?'],
    language: 'de',
    tool: ['workouts'],
    args: (a) =>
      problems(
        [near(a.from, '2026-11-04', 0), `from ${a.from}, expected 2026-11-04`],
        [near(a.to, '2026-11-04', 0), `to ${a.to}, expected 2026-11-04`],
      ),
  },
  {
    id: 'last-bench',
    user: 'lena',
    turns: ['Wie viel hatte ich zuletzt beim Bankdrücken?'],
    language: 'de',
    tool: ['workouts', 'trend'],
    args: (a) => problems([a.exercise_id === 'bench-press', `exercise ${a.exercise_id}`]),
  },
  {
    id: 'legs-how-often',
    user: 'lena',
    turns: ['Wie oft sollte ich Beine trainieren?'],
    language: 'de',
    tool: [null, 'workouts'],
  },
  {
    id: 'knee-pain',
    user: 'lena',
    turns: ['Was kann ich statt Kniebeugen machen, wenn mir die Knie wehtun?'],
    language: 'de',
    tool: [null, 'workouts'],
    says: /arzt|ärzt|physio/i,
  },
  {
    id: 'train-today',
    user: 'lena',
    turns: ['Soll ich heute trainieren oder pausieren?'],
    language: 'de',
    tool: [null, 'workouts', 'calendar'],
  },
  {
    id: 'off-topic',
    user: 'lena',
    turns: ['Schreib mir ein Gedicht über Pizza.'],
    language: 'de',
    tool: [null],
  },
  {
    id: 'bench-120',
    user: 'lena',
    turns: ['Wann schaffe ich 120 kg im Bankdrücken?'],
    language: 'de',
    tool: ['trend', null],
    args: (a) => problems([a.exercise_id === 'bench-press', `exercise ${a.exercise_id}`]),
  },
  {
    id: 'body-score',
    user: 'lena',
    turns: ['Wie hat sich mein Körper-Score entwickelt?'],
    language: 'de',
    tool: ['trend'],
    args: (a) => problems([a.metric === 'body_score', `metric ${a.metric}`]),
  },
  {
    id: 'plank',
    user: 'lena',
    turns: ['Wie lange halte ich inzwischen den Unterarmstütz?'],
    language: 'de',
    tool: ['trend', 'workouts'],
    args: (a) =>
      problems(
        [a.exercise_id === 'plank', `exercise ${a.exercise_id}`],
        [a.metric === undefined || a.metric === 'seconds', `metric ${a.metric}`],
      ),
  },
  {
    id: 'pull-ups',
    user: 'lena',
    turns: ['Wie viele Klimmzüge schaffe ich mittlerweile am Stück?'],
    language: 'de',
    tool: ['trend', 'workouts'],
    args: (a) =>
      problems(
        [a.exercise_id === 'pull-up', `exercise ${a.exercise_id}`],
        [a.metric === undefined || a.metric === 'reps', `metric ${a.metric}`],
      ),
  },
  {
    id: 'week-39',
    user: 'lena',
    turns: ['Wie viel habe ich in KW 39 trainiert?'],
    language: 'de',
    derives: [47, 251],
    tool: ['workouts', 'calendar', 'period_vs_average'],
    args: (a) =>
      a.period
        ? []
        : problems(
            [near(a.from, '2026-09-21', 0), `from ${a.from}, expected 2026-09-21`],
            [near(a.to, '2026-09-27', 0), `to ${a.to}, expected 2026-09-27`],
          ),
  },

  // ---------- Sam: English, lb, a few home workouts, no body weight ----------
  {
    id: 'weight-none',
    user: 'sam',
    turns: ['How has my weight changed?'],
    language: 'en',
    tool: ['trend', null],
    says: /log|track|enter|weigh|record|add/i,
  },
  {
    id: 'weight-target-none',
    user: 'sam',
    turns: ['How long until my body weight reaches 150 lb?'],
    language: 'en',
    tool: ['trend', null],
    says: /log|track|enter|weigh|record|add/i,
  },
  {
    id: 'dumbbell-bench',
    user: 'sam',
    turns: ["How's my dumbbell bench going?"],
    language: 'en',
    tool: ['trend'],
    args: (a) => problems([a.exercise_id === 'dumbbell-bench-press', `exercise ${a.exercise_id}`]),
  },
  {
    id: 'consistency',
    user: 'sam',
    turns: ['How consistent have I been?'],
    language: 'en',
    tool: ['calendar'],
  },
  {
    id: 'more-than-usual',
    user: 'sam',
    turns: ['Did I train more this week than usual?'],
    language: 'en',
    tool: ['period_vs_average'],
    args: (a) => problems([a.period === 'week', `period ${a.period}`]),
  },
  {
    id: 'squat-never-done',
    user: 'sam',
    turns: ['How is my squat progressing?'],
    language: 'en',
    tool: ['trend', null],
    args: (a) => problems([a.exercise_id === 'goblet-squat', `exercise ${a.exercise_id}`]),
  },
  {
    id: 'neglected-muscles-en',
    user: 'sam',
    turns: ['Which muscles am I not training enough?'],
    language: 'en',
    tool: ['distribution'],
    args: (a) => problems([a.by === 'muscle', `by ${a.by}`]),
  },
  {
    id: 'german-question',
    user: 'sam',
    turns: ['Wie oft trainiere ich pro Woche?'],
    language: 'de',
    tool: ['calendar', 'period_vs_average'],
  },

  // ---------- building a workout ----------
  {
    id: 'build-push',
    user: 'lena',
    turns: [BUILD_PUSH],
    language: 'de',
    tool: ['create_workout'],
    args: workoutOf(3, 8),
  },
  {
    id: 'build-no-length',
    user: 'lena',
    turns: ['Erstell mir ein Beintraining'],
    language: 'de',
    tool: ['create_workout'],
    args: workoutOf(3, 8),
  },
  {
    id: 'build-home',
    user: 'sam',
    turns: ['Build me a quick full body workout'],
    language: 'en',
    tool: ['create_workout'],
    args: workoutOf(2, 8, DUMBBELLS),
  },
  {
    id: 'build-dumbbells-today',
    user: 'lena',
    turns: ['Ich bin heute im Hotel und hab nur Kurzhanteln. Bau mir ein Ganzkörpertraining.'],
    language: 'de',
    tool: ['create_workout'],
    args: workoutOf(2, 8, DUMBBELLS),
  },
  {
    id: 'build-shorter',
    user: 'lena',
    turns: [BUILD_PUSH, 'Mach es kürzer, ich hab nur 30 Minuten'],
    language: 'de',
    tool: ['create_workout'],
    args: workoutOf(2, 6),
  },
  {
    id: 'build-swap',
    user: 'lena',
    turns: [BUILD_PUSH, 'Tausch das Bankdrücken gegen was mit Kurzhanteln'],
    language: 'de',
    tool: ['create_workout'],
    args: (a) => {
      const ids = ((a.exercises ?? []) as Args[]).map((e) => e.exercise_id);
      return problems(
        [!ids.includes('bench-press'), 'still bench press'],
        [ids.includes('dumbbell-bench-press'), `exercises ${ids.join(', ')}`],
      );
    },
  },
  {
    id: 'build-several',
    user: 'lena',
    turns: ['Bau mir drei Trainings für diese Woche'],
    language: 'de',
    tool: ['create_workout'],
  },
  {
    id: 'build-not-asked',
    user: 'lena',
    turns: ['Welche Übungen sind gut für die seitliche Schulter?'],
    language: 'de',
    tool: [null, 'find_exercises'],
    // General advice may name a rep range.
    derives: true,
  },

  // ---------- unclear questions: the only time the coach asks back ----------
  {
    id: 'unclear',
    user: 'lena',
    turns: ['Ist das gut so?'],
    language: 'de',
    tool: [null],
    asks: true,
  },
  {
    id: 'unclear-en',
    user: 'sam',
    turns: ['What about the other one?'],
    language: 'en',
    tool: [null],
    asks: true,
  },
];
