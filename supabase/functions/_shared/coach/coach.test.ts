// deno test --allow-env supabase/functions/_shared/coach/coach.test.ts
// The coach's tools on a small hand-made history (expected values worked out by hand), and the
// chat loop with OpenAI faked.
import { assert, assertEquals } from 'jsr:@std/assert@1';

import { type CoachData, type CoachExercise, type CoachUser, dayIn, splitShares } from './data.ts';
import { numbersIn, unmatchedNumbers } from './eval/grade.ts';
import { coachCatalog, coachData, coachRoutines, coachTurns, type RoutineRow } from './load.ts';
import { contextText } from './prompt.ts';
import { type PeriodChart, runTool, TOOLS, type TrendChart, type WorkoutChart } from './tools.ts';

Deno.env.set('OPENAI_API_KEY', 'test-key');
const { askCoach } = await import('./chat.ts');

const exercise = (
  id: string,
  measures: CoachExercise['measures'],
  shares: Record<string, number>,
  extra: Partial<CoachExercise> = {},
): CoachExercise => ({
  id,
  name: id,
  measures,
  ...splitShares(shares),
  bodyweight: false,
  assisted: false,
  cardio: false,
  ...extra,
});

const set = (weightKg: number | null, reps: number | null, seconds: number | null = null) => ({
  weightKg,
  reps,
  seconds,
  rir: null,
});

const workout = (day: string, exercises: Record<string, ReturnType<typeof set>[]>) => ({
  name: 'Push',
  startedAt: `${day}T17:00:00Z`,
  finishedAt: `${day}T18:00:00Z`,
  exercises: Object.entries(exercises).map(([exerciseId, sets]) => ({ exerciseId, sets })),
});

const catalogExercise = (
  id: string,
  equipment: string,
  muscles: Record<string, number>,
  usable = true,
): CoachData['catalog'][number] => ({
  id,
  name: id,
  equipment,
  measures: ['weight', 'reps'],
  muscles,
  usable,
});

const DATA: CoachData = {
  exercises: new Map(
    [
      exercise('bench-press', ['weight', 'reps'], { chest: 0.6, triceps: 0.25, front_delts: 0.15 }),
      exercise(
        'pull-up',
        ['weight', 'reps'],
        { lats: 0.55, upper_back: 0.25, biceps: 0.2 },
        { bodyweight: true },
      ),
      exercise('plank', ['seconds'], { abs: 0.7, obliques: 0.3 }, { bodyweight: true }),
      exercise('treadmill', ['seconds'], { quads: 1 }, { cardio: true }),
    ].map((e) => [e.id, e]),
  ),
  catalog: [
    catalogExercise('dumbbell-press', 'dumbbell', { chest: 0.75, triceps: 0.25 }),
    catalogExercise('bench-press', 'barbell', { chest: 0.6, triceps: 0.25, front_delts: 0.15 }),
    catalogExercise('cable-fly', 'cable', { chest: 1 }, false),
    catalogExercise('squat', 'barbell', { quads: 0.6, glutes: 0.4 }),
    { ...catalogExercise('plank', 'bodyweight', { abs: 1 }), measures: ['seconds'] },
  ],
  routines: [
    {
      id: 'r-push',
      name: 'Push',
      status: 'next',
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: 3,
          targetMin: 6,
          targetMax: 8,
          rir: 2,
          restSeconds: null,
        },
      ],
    },
    { id: 'r-empty', name: 'Empty', status: 'open', exercises: [] },
  ],
  workouts: [
    workout('2026-10-05', {
      'bench-press': [set(100, 5), set(100, 5)],
      'pull-up': [set(0, 8)],
      plank: [set(null, null, 45)],
    }),
    workout('2026-10-07', { 'bench-press': [set(102.5, 5)] }),
    workout('2026-10-26', { 'bench-press': [set(97.5, 6), set(95, 6)] }),
    workout('2026-11-02', { 'bench-press': [set(105, 3)], treadmill: [set(null, null, 1200)] }),
  ],
  weights: [
    { date: '2026-10-01', kg: 80 },
    { date: '2026-10-08', kg: 79.5 },
    { date: '2026-10-15', kg: 79 },
    { date: '2026-10-29', kg: 78.6 },
  ],
  checks: [
    { date: '2026-09-01', score: 60 },
    { date: '2026-10-30', score: 64 },
  ],
};

const USER: CoachUser = {
  today: '2026-11-04',
  timeZone: 'Europe/Berlin',
  units: 'metric',
  language: 'en',
};
const run = (name: string, args: Record<string, unknown>, user = USER) =>
  runTool(name, args, DATA, user);
const ALL = { from: null, to: null };

Deno.test('a workout late in the evening counts on the local day', () => {
  assertEquals(dayIn('2026-03-01T23:30:00Z', 'Europe/Berlin'), '2026-03-02');
  assertEquals(dayIn('2026-03-02T03:30:00Z', 'America/New_York'), '2026-03-01');
});

Deno.test('trend: estimated 1RM per session, with records', () => {
  const { chart, result } = run('trend', {
    metric: 'e1rm',
    exercise_id: 'bench-press',
    show_records: true,
    ...ALL,
  });
  // Epley: 100 × (1 + 5/30), 102.5 × (1 + 5/30), the better of 97.5 × 1.2 and 95 × 1.2, 105 × 1.1.
  assertEquals(
    (chart as TrendChart).points.map((p) => p.value),
    [116.7, 119.6, 117, 115.5],
  );
  assertEquals(result.change, -1.2);
  assertEquals(result.change_percent, -1);
  assertEquals(result.highest, { date: '2026-10-07', value: 119.6 });
  assertEquals(result.records, [{ date: '2026-10-07', value: 119.6 }]);
});

Deno.test('trend: bodyweight exercises add the latest body weight; imperial in lb', () => {
  const pullUp = run('trend', {
    metric: 'e1rm',
    exercise_id: 'pull-up',
    show_records: false,
    ...ALL,
  });
  // One session: too little for a chart, but the value is there (78.6 × (1 + 8/30)).
  assertEquals(pullUp.chart, null);
  assertEquals(pullUp.result.last, { date: '2026-10-05', value: 99.6 });
  const imperial = run(
    'trend',
    { metric: 'top_weight', exercise_id: 'bench-press', show_records: false, ...ALL },
    { ...USER, units: 'imperial' },
  );
  assertEquals(imperial.result.unit, 'lb');
  assertEquals(imperial.result.first, { date: '2026-10-05', value: 220.5 });
});

Deno.test('trend: body weight comes with its smoothed line; mistakes come back as errors', () => {
  const { chart, result } = run('trend', {
    metric: 'body_weight',
    exercise_id: null,
    show_records: false,
    ...ALL,
  });
  assertEquals((chart as TrendChart).points.length, 4);
  assertEquals((chart as TrendChart).line?.length, 4);
  assertEquals(result.measurements, 4);
  const trend = result.trend as { first: { value: number }; last: { value: number } };
  assert(trend.first.value === 80 && trend.last.value < 80 && trend.last.value > 78.6);

  assertEquals(
    run('trend', { metric: 'e1rm', exercise_id: 'squat', ...ALL }).result.error !== undefined,
    true,
  );
  assertEquals(
    run('trend', {
      metric: 'e1rm',
      exercise_id: 'bench-press',
      from: '2026-11-03',
      to: '2026-11-01',
    }).result.error !== undefined,
    true,
  );
  const one = run('trend', {
    metric: 'e1rm',
    exercise_id: 'bench-press',
    from: '2026-11-01',
    to: null,
  });
  assertEquals(one.chart, null);
  assertEquals(one.result.count, 1);
});

Deno.test('compare: one series per exercise, the percent view only changes the chart', () => {
  const { chart, result } = run('compare', {
    exercise_ids: ['bench-press', 'pull-up'],
    metric: 'e1rm',
    as_percent: true,
    ...ALL,
  });
  assertEquals(chart?.type, 'compare');
  assertEquals(
    (result.exercises as { count: number }[]).map((e) => e.count),
    [4, 1],
  );
  assertEquals(
    run('compare', { exercise_ids: ['bench-press'], metric: 'e1rm', as_percent: false, ...ALL })
      .result.error !== undefined,
    true,
  );
});

Deno.test('period_vs_average: this week so far against the weeks with training', () => {
  const { chart, result } = run('period_vs_average', {
    metric: 'sets',
    period: 'week',
    periods: 4,
  });
  // Weeks of 5 (two workouts), 12, 19 and 26 October: 5, 0, 0 and 2 sets; this week 1 (the
  // treadmill is cardio). The two empty weeks stay out of the average.
  assertEquals(
    (chart as PeriodChart).bars.map((b) => b.value),
    [5, 0, 0, 2, 1],
  );
  assertEquals(result.average, 3.5);
  assertEquals(result.periods_without_training, 2);
  assertEquals(result.difference, -2.5);
  assertEquals(result.last_period_as_high, '2026-10-26');
  assertEquals(result.current, {
    start: '2026-11-02',
    value: 1,
    days_in: 3,
    days_total: 7,
    partial: true,
  });
  // Monday to Wednesday: 2 sets the week before, 5 and 2 in the weeks with training.
  assertEquals(result.so_far, {
    days: 3,
    this_period: 1,
    previous_period_same_days: 2,
    average_same_days: 3.5,
  });
});

Deno.test('calendar: workouts per week, gaps and weekdays', () => {
  const { chart, result } = run('calendar', ALL);
  assertEquals(chart?.type, 'calendar');
  assertEquals(result.from, '2026-10-05');
  assertEquals(result.workouts, 4);
  assertEquals(result.per_week, 0.9);
  assertEquals(result.gaps_of_a_week_or_more, [{ from: '2026-10-08', to: '2026-10-25', days: 18 }]);
  assertEquals((result.workouts_per_weekday as Record<string, number>).mon, 3);
  // Mondays: trained on 3 of 5. Wednesdays (1 of 4, today not yet) aren't a usual day.
  assertEquals(result.usual_days, [{ day: 'mon', trained: 3, of: 5, skipped: 2 }]);
  assertEquals(
    (result.last_4_weeks as { days: string[] }[]).map((w) => w.days),
    [[], [], ['mon'], ['mon']],
  );
});

Deno.test('distribution: sets per week, main muscles fully and helpers half', () => {
  const { result } = run('distribution', { by: 'muscle', from: '2026-10-05', to: null });
  const rows = Object.fromEntries(
    (result.rows as { key: string; value: number }[]).map((r) => [r.key, r.value]),
  );
  // 31 days = 4.43 weeks. Bench: 6 sets for the chest, 3 (halved) for triceps and front delts.
  assertEquals(rows.chest, 1.4);
  assertEquals(rows.triceps, 0.7);
  assertEquals(rows.calves, 0);
  assertEquals(rows.quads, 0); // the treadmill is cardio
  assertEquals(rows.obliques, undefined); // not a main muscle
  assertEquals(result.guideline, 10);
  // Without a start: the last 4 weeks.
  assertEquals(run('distribution', { by: 'muscle', ...ALL }).result.from, '2026-10-08');
});

Deno.test('workouts: sessions newest first, sets as the app writes them', () => {
  const { chart, result } = run('workouts', { exercise_id: 'bench-press', ...ALL });
  assertEquals(chart, null);
  const sessions = result.workouts as {
    date: string;
    exercises: { name: string; sets: string }[];
  }[];
  assertEquals(sessions.length, 4);
  assertEquals(sessions[0].date, '2026-11-02');
  assertEquals(sessions[0].exercises, [{ name: 'bench-press', sets: '105 kg × 3' }]);
});

Deno.test('every tool is strict: all properties required, nothing else allowed', () => {
  for (const tool of TOOLS) {
    assertEquals(tool.parameters.required, Object.keys(tool.parameters.properties));
    assertEquals(tool.parameters.additionalProperties, false);
  }
});

Deno.test('the eval reads numbers as the language writes them', () => {
  assertEquals(
    numbersIn('Du hast **4,6 kg** abgenommen, von 84,2 auf 79,6 kg.', 'de'),
    [4.6, 84.2, 79.6],
  );
  assertEquals(numbersIn('You moved 9,600 lb, up 21 %.', 'en'), [9600, 21]);
  // 9,6 t is 9600 kg; 80 is the rounded 79.6; 5 isn't in the results.
  assertEquals(unmatchedNumbers('**9,6 t**, rund 80 kg, 5 mal', 'de', [9600, 79.6]), [5]);
});

/** A streamed Responses API answer: its text as one delta, then the finished response. */
function streamed(output: unknown[], usage: unknown, text = '') {
  const events = [
    ...(text ? [{ type: 'response.output_text.delta', delta: text }] : []),
    { type: 'response.completed', response: { status: 'completed', output, usage } },
  ];
  return events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('');
}

Deno.test(
  'chat: runs the tool the model calls, then streams its answer with the chart',
  async () => {
    const sent: {
      input: { type?: string; call_id?: string }[];
      store: boolean;
      stream: boolean;
    }[] = [];
    const replies = [
      streamed(
        [
          { type: 'reasoning', id: 'rs_1', encrypted_content: 'x' },
          {
            type: 'function_call',
            call_id: 'call_1',
            name: 'trend',
            arguments: JSON.stringify({
              metric: 'e1rm',
              exercise_id: 'bench-press',
              from: null,
              to: null,
              show_records: false,
            }),
          },
        ],
        { input_tokens: 3000, output_tokens: 80, input_tokens_details: { cached_tokens: 2000 } },
      ),
      streamed(
        [{ type: 'message', content: [{ type: 'output_text', text: 'At **115.5 kg**.' }] }],
        { input_tokens: 3400, output_tokens: 40 },
        'At **115.5 kg**.',
      ),
    ];
    globalThis.fetch = (_url, init) => {
      sent.push(JSON.parse(String(init?.body)));
      return Promise.resolve(new Response(replies[sent.length - 1]));
    };
    const events: string[] = [];
    const reply = await askCoach({
      question: 'How is my bench going?',
      history: [],
      context: 'Today: 2026-11-04',
      data: DATA,
      user: USER,
      model: 'test-model',
      effort: 'low',
      timeoutMs: 1000,
      onEvent: (event) => events.push(event.type),
    });
    assert('answer' in reply);
    assertEquals(reply.answer, 'At **115.5 kg**.');
    assertEquals(reply.chart?.type, 'trend');
    assertEquals(events, ['searched', 'found', 'text']);
    const { waits, ...totals } = reply.usage;
    assertEquals(waits.length, 2);
    assertEquals(totals, {
      requests: 2,
      input: 6400,
      cached: 2000,
      output: 120,
      reasoning: 0,
      fast: 0,
    });
    assertEquals(sent.length, 2);
    assertEquals(sent[0].store, false);
    assertEquals(sent[0].stream, true);
    // The second request carries the call and its result.
    assert(sent[1].input.some((i) => i.type === 'function_call_output' && i.call_id === 'call_1'));
  },
);

Deno.test('load: database rows become the coach data, the chat its earlier turns', () => {
  const data = coachData(
    {
      workouts: [
        {
          name: 'Pull',
          started_at: '2026-10-05T17:00:00+00:00',
          finished_at: '2026-10-05T18:00:00+00:00',
          exercises: [
            { exercise_id: 'pull-up', sets: [[0, 8, null, 2]] },
            { exercise_id: 'c0ffee00-0000-0000-0000-000000000001', sets: [[20, 12, null, null]] },
          ],
        },
      ],
      weights: [['2026-10-01', 80.4]],
      checks: [['2026-10-04T23:30:00+00:00', 64]],
      exercises: [
        {
          id: 'pull-up',
          name: { en: 'Pull-up', de: 'Klimmzug' },
          measures: ['weight', 'reps'],
          muscles: { lats: 0.55, upper_back: 0.25, biceps: 0.2 },
          equipment: 'bodyweight',
          assisted: false,
          cardio: false,
        },
      ],
      custom_exercises: [
        {
          id: 'c0ffee00-0000-0000-0000-000000000001',
          name: 'Meine Rudermaschine',
          measures: ['weight', 'reps'],
          primary: ['upper_back'],
          secondary: ['biceps'],
        },
      ],
    },
    'de',
    'Europe/Berlin',
  );
  const pullUp = data.exercises.get('pull-up')!;
  assertEquals([pullUp.name, pullUp.bodyweight, pullUp.primary], ['Klimmzug', true, ['lats']]);
  assertEquals(data.exercises.get('c0ffee00-0000-0000-0000-000000000001')?.primary, ['upper_back']);
  assertEquals(data.workouts[0].exercises[0].sets[0], {
    weightKg: 0,
    reps: 8,
    seconds: null,
    rir: 2,
  });
  // 23:30 UTC is already the next day in Berlin.
  assertEquals(data.checks, [{ date: '2026-10-05', score: 64 }]);

  const turns = coachTurns(
    [
      { id: 'q1', role: 'user', content: 'Wie läuft es?' },
      { id: 'a1', role: 'coach', content: 'Gut.' },
      { id: 'q2', role: 'user', content: 'Und sonst?' },
      { id: 'a2', role: 'coach', content: 'Auch gut.' },
    ],
    [{ answer_id: 'a1', calls: [{ name: 'calendar', args: {}, result: {} }] }],
  );
  assertEquals(
    turns.map((t) => [t.question, t.calls.length, t.answer]),
    [
      ['Wie läuft es?', 1, 'Gut.'],
      ['Und sonst?', 0, 'Auch gut.'],
    ],
  );
});

Deno.test(
  'find_exercises: main muscles, what the equipment allows, the ones done most first',
  () => {
    const ids = (equipment: string[] | null, muscles = ['chest']) =>
      (run('find_exercises', { muscles, equipment }).result.exercises as { id: string }[]).map(
        (e) => e.id,
      );
    assertEquals(ids(null), ['bench-press', 'dumbbell-press']);
    // What the user says they have today goes before the profile.
    assertEquals(ids(['cable']), ['cable-fly']);
    // Triceps helps in the presses but is no main muscle there.
    assertEquals(ids(null, ['triceps']), []);
    assertEquals(run('find_exercises', { muscles: [], equipment: null }).chart, null);
  },
);

Deno.test('create_workout: keeps values in range and leaves out what the app can not take', () => {
  const line = (exercise_id: string, values: Record<string, unknown> = {}) => ({
    exercise_id,
    sets: 3,
    target_min: 6,
    target_max: 8,
    rir: 2,
    rest_seconds: 120,
    ...values,
  });
  const { chart, result } = run('create_workout', {
    name: 'Push',
    exercises: [
      line('bench-press', { target_min: 8, target_max: 6 }),
      line('bench-press'),
      line('no-such-exercise'),
      line('treadmill'),
      line('plank', { sets: 9, target_min: 45, target_max: 60, rir: null, rest_seconds: 10 }),
    ],
  });
  assertEquals((chart as WorkoutChart).exercises, [
    {
      exerciseId: 'bench-press',
      sets: 3,
      targetMin: 6,
      targetMax: 8,
      rir: 2,
      restSeconds: 120,
    },
    { exerciseId: 'plank', sets: 6, targetMin: 45, targetMax: 60, rir: null, restSeconds: 30 },
  ]);
  // (150 + 3 × (45 + 120)) + (150 + 6 × (45 + 30)) seconds, as the app estimates it.
  assertEquals(result, {
    created: 'Push',
    exercises: 2,
    sets: 9,
    minutes: 21,
    skipped: ['bench-press', 'no-such-exercise', 'treadmill'],
  });

  const nothing = run('create_workout', { name: 'Push', exercises: [line('no-such-exercise')] });
  assertEquals(nothing.chart, null);
  assert(nothing.result.error);
  assert(run('create_workout', { name: ' ', exercises: [line('squat')] }).result.error);
});

Deno.test(
  'the catalog for a workout: no cardio, and what the equipment in the profile allows',
  () => {
    const row = (id: string, needs: string[][], cardio = false) => ({
      id,
      name: { en: `${id} en`, de: `${id} de` },
      equipment: 'x',
      needs,
      measures: ['weight', 'reps'],
      muscles: { chest: 1 },
      rest_seconds: 90,
      cardio,
    });
    const rows = [
      row('barbell-press', [['barbell']]),
      row('dumbbell-press', [['dumbbell']]),
      row('push-up', []),
      row('run', [], true),
    ];
    const gear = [
      { id: 'barbell', in_gym: true },
      { id: 'dumbbell', in_gym: true },
    ];
    const usable = (equipment: string | null, home: string[] | null = null) =>
      coachCatalog(rows, gear, { equipment, home_equipment: home }, 'de')
        .filter((e) => e.usable)
        .map((e) => e.id);
    assertEquals(usable('gym'), ['barbell-press', 'dumbbell-press', 'push-up']);
    assertEquals(usable(null), ['barbell-press', 'dumbbell-press', 'push-up']);
    assertEquals(usable('home', ['dumbbell']), ['dumbbell-press', 'push-up']);
    assertEquals(usable('bodyweight'), ['push-up']);
    assertEquals(
      coachCatalog(rows, gear, { equipment: 'gym', home_equipment: null }, 'de')[0].name,
      'barbell-press de',
    );
  },
);

Deno.test('a follow-up reads the earlier workout but not the list it was picked from', () => {
  const [turn] = coachTurns(
    [
      { id: 'q', role: 'user', content: 'Bau mir ein Training' },
      { id: 'a', role: 'coach', content: 'Hier ist es.' },
    ],
    [
      {
        answer_id: 'a',
        calls: [
          { name: 'find_exercises', args: {}, result: { exercises: [] } },
          { name: 'create_workout', args: {}, result: { minutes: 45 } },
        ],
      },
    ],
  );
  assertEquals(
    turn.calls.map((c) => c.name),
    ['create_workout'],
  );
});

Deno.test('show_workout: gives the saved workout for the card and what is in it', () => {
  const { chart, result } = run('show_workout', { routine_id: 'r-push' });
  const workout = chart as WorkoutChart;
  assertEquals(workout.routineId, 'r-push');
  assertEquals(workout.name, 'Push');
  assertEquals(workout.exercises[0].exerciseId, 'bench-press');
  assertEquals(result.status, 'next');
  assertEquals((result.exercises as { sets: number }[])[0].sets, 3);

  assertEquals(run('show_workout', { routine_id: 'r-empty' }).chart, null);
  assert(run('show_workout', { routine_id: 'r-empty' }).result.note);
  assert(run('show_workout', { routine_id: 'nope' }).result.error);
});

Deno.test('coachRoutines: finds the next one as the Training tab does', () => {
  const row = (
    id: string,
    position: number,
    plan_id: string | null,
    empty = false,
  ): RoutineRow => ({
    id,
    name: id,
    plan_id,
    position,
    routine_exercises: empty
      ? []
      : [
          {
            exercise_id: 'squat',
            position: 0,
            rest_seconds: null,
            routine_sets: [
              { position: 1, target_min: 8, target_max: 12, rir: null },
              { position: 0, target_min: 6, target_max: 8, rir: 2 },
            ],
          },
        ],
  });
  const rows = [
    row('c', 2, 'plan'),
    row('a', 0, 'plan'),
    row('empty', 1, 'plan', true),
    row('single', 0, null),
    row('other', 0, 'old-plan'),
  ];
  const plan = { id: 'plan', sessionsPerWeek: 2 };
  const statuses = (workouts: { routine_id: string; plan_week: number }[]) =>
    coachRoutines(rows, plan, workouts).map((r) => [r.id, r.status]);

  assertEquals(statuses([]), [
    ['a', 'next'],
    ['empty', 'open'],
    ['c', 'open'],
    ['single', null],
  ]);
  // Done in the week the plan is in; an earlier week doesn't count.
  assertEquals(
    statuses([
      { routine_id: 'a', plan_week: 3 },
      { routine_id: 'c', plan_week: 2 },
    ]),
    [
      ['a', 'done'],
      ['empty', 'open'],
      ['c', 'next'],
      ['single', null],
    ],
  );
  // The weekly goal reached: the next plan week starts over.
  assertEquals(
    statuses([
      { routine_id: 'a', plan_week: 3 },
      { routine_id: 'c', plan_week: 3 },
    ])[0],
    ['a', 'next'],
  );
  assertEquals(
    coachRoutines(rows, null, []).map((r) => r.id),
    ['single'],
  );
  assertEquals(coachRoutines(rows, plan, [])[0].exercises[0], {
    exerciseId: 'squat',
    sets: 2,
    targetMin: 6,
    targetMax: 12,
    rir: 2,
    restSeconds: null,
  });
});

Deno.test('contextText: lists the workouts with the next one marked', () => {
  const profile = { goal: null, experience: null, focus: [], equipment: null, plan: null };
  const text = contextText(USER, profile, {
    ...DATA,
    routines: [...DATA.routines, { id: 'r-solo', name: 'Solo', status: null, exercises: [] }],
  });
  assert(text.includes('- r-push · Push · next'));
  assert(text.includes('- r-empty · Empty · open'));
  assert(text.includes('Saved workouts outside the plan (id · name):\n- r-solo · Solo'));
});
