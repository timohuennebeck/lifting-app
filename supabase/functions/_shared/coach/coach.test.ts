// deno test --allow-env supabase/functions/_shared/coach/coach.test.ts
// The coach's tools on a small hand-made history (expected values worked out by hand), and the
// chat loop with OpenAI faked.
import { assert, assertEquals } from 'jsr:@std/assert@1';

import { type CoachData, type CoachExercise, type CoachUser, dayIn, splitShares } from './data.ts';
import { numbersIn, unmatchedNumbers } from './eval/grade.ts';
import { type PeriodChart, runTool, TOOLS, type TrendChart } from './tools.ts';

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

Deno.test(
  'chat: runs the tool the model calls, then returns its answer with the chart',
  async () => {
    const sent: {
      input: { type?: string; call_id?: string }[];
      store: boolean;
      tools: unknown[];
    }[] = [];
    const replies = [
      {
        status: 'completed',
        output: [
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
        usage: {
          input_tokens: 3000,
          output_tokens: 80,
          input_tokens_details: { cached_tokens: 2000 },
        },
      },
      {
        status: 'completed',
        output: [
          {
            type: 'message',
            content: [{ type: 'output_text', text: 'Your bench is at **115.5 kg**.' }],
          },
        ],
        usage: { input_tokens: 3400, output_tokens: 40 },
      },
    ];
    globalThis.fetch = (_url, init) => {
      sent.push(JSON.parse(String(init?.body)));
      return Promise.resolve(new Response(JSON.stringify(replies[sent.length - 1])));
    };
    const reply = await askCoach({
      question: 'How is my bench going?',
      history: [],
      context: 'Today: 2026-11-04',
      data: DATA,
      user: USER,
      model: 'test-model',
      effort: 'low',
      timeoutMs: 1000,
    });
    assert('answer' in reply);
    assertEquals(reply.answer, 'Your bench is at **115.5 kg**.');
    assertEquals(reply.chart?.type, 'trend');
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
    assertEquals(sent[0].tools.length, TOOLS.length);
    // The second request carries the call and its result.
    assert(sent[1].input.some((i) => i.type === 'function_call_output' && i.call_id === 'call_1'));
  },
);
