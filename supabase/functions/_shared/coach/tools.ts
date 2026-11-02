// The coach's tools: what the model can ask for and the code that answers. Each tool returns the
// numbers for the model (`result`, which it quotes rather than computes) and, for the five chart
// tools, the chart the app draws under the answer (`chart`; null without enough data).
import {
  addDays,
  type CoachData,
  type CoachExercise,
  type CoachSet,
  type CoachUser,
  type CoachWorkout,
  dayIn,
  daysBetween,
  daysInMonth,
  type ExerciseMetric,
  inUnits,
  isDay,
  latestBodyWeight,
  monthStart,
  previousMonth,
  round,
  sessionValue,
  WEEKDAYS,
  weekdayOf,
  weekStart,
  weightUnit,
  workoutMinutes,
  workoutSets,
  workoutVolumeKg,
} from './data.ts';

export interface Point {
  date: string;
  value: number;
}

export type TrendMetric = ExerciseMetric | 'body_weight' | 'body_score';
export type PeriodMetric = 'volume' | 'sets' | 'workouts' | 'minutes';
export type Period = 'week' | 'month';
export type DistributionBy = 'muscle' | 'exercise' | 'weekday';

export interface TrendChart {
  type: 'trend';
  metric: TrendMetric;
  unit: string;
  exerciseId: string | null;
  points: Point[];
  /** Body weight: the smoothed line through the measurements. */
  line: Point[] | null;
  /** Each new all-time best, when asked for. */
  records: Point[] | null;
}

export interface CompareChart {
  type: 'compare';
  metric: ExerciseMetric;
  unit: string;
  /** Each line as % of its first value. */
  asPercent: boolean;
  series: { exerciseId: string; points: Point[] }[];
}

export interface PeriodChart {
  type: 'period_vs_average';
  metric: PeriodMetric;
  unit: string;
  period: Period;
  /** One bar per period, oldest first; the last is the current one. */
  bars: Point[];
  average: number | null;
}

export interface CalendarChart {
  type: 'calendar';
  from: string;
  to: string;
  /** Training days with their number of workouts and sets (how bright the day shows). */
  days: (Point & { sets: number })[];
}

export interface DistributionChart {
  type: 'distribution';
  by: DistributionBy;
  unit: string;
  /** The guideline line (10 sets a week per muscle). */
  reference: number | null;
  rows: { key: string; value: number }[];
}

export type Chart = TrendChart | CompareChart | PeriodChart | CalendarChart | DistributionChart;

export interface ToolResult {
  chart: Chart | null;
  result: Record<string, unknown>;
}

type Args = Record<string, unknown>;

// ---------- definitions ----------

const EXERCISE_METRICS: ExerciseMetric[] = ['e1rm', 'top_weight', 'reps', 'seconds', 'volume'];
const PERIOD_METRICS: PeriodMetric[] = ['volume', 'sets', 'workouts', 'minutes'];
const DISTRIBUTION_BY: DistributionBy[] = ['muscle', 'exercise', 'weekday'];
const METRIC_HELP =
  'e1rm: estimated one-rep max of the best set, the usual measure of strength. top_weight: ' +
  'heaviest weight lifted. reps: most reps in a set (bodyweight exercises). seconds: longest ' +
  'hold. volume: weight × reps of all sets.';

const FROM = {
  type: ['string', 'null'],
  description: 'First day, YYYY-MM-DD. null: from the start.',
};
const TO = { type: ['string', 'null'], description: 'Last day, YYYY-MM-DD. null: today.' };

/** A function tool in strict mode: every property required, nothing else allowed. */
const tool = (name: string, description: string, properties: Record<string, unknown>) => ({
  type: 'function',
  name,
  description,
  strict: true,
  parameters: {
    type: 'object',
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  },
});

export const TOOLS = [
  tool(
    'trend',
    'Chart: how one value developed over time. Body weight (with its smoothed trend), the body ' +
      "check score, or one exercise's value per session.",
    {
      metric: {
        type: 'string',
        enum: ['body_weight', 'body_score', ...EXERCISE_METRICS],
        description: `For an exercise: ${METRIC_HELP}`,
      },
      exercise_id: {
        type: ['string', 'null'],
        description: "An id from the user's exercises; null for body_weight and body_score.",
      },
      from: FROM,
      to: TO,
      show_records: {
        type: 'boolean',
        description: 'Mark every new all-time best, for questions about records.',
      },
    },
  ),
  tool('compare', 'Chart: 2 to 4 exercises over the same time, one line each.', {
    exercise_ids: { type: 'array', items: { type: 'string' }, description: '2 to 4 exercise ids.' },
    metric: { type: 'string', enum: EXERCISE_METRICS, description: METRIC_HELP },
    from: FROM,
    to: TO,
    as_percent: {
      type: 'boolean',
      description: 'Show each line as % of its start (start = 100 %).',
    },
  }),
  tool(
    'period_vs_average',
    'Chart: the current week or month against the average of the earlier ones with training, ' +
      'e.g. "more than usual?". Also gives the previous period ("this week vs last week") and, ' +
      'while the current one runs, the same days of the previous period and on average.',
    {
      metric: {
        type: 'string',
        enum: PERIOD_METRICS,
        description: 'volume: weight × reps. sets: completed sets. minutes: time trained.',
      },
      period: { type: 'string', enum: ['week', 'month'] },
      periods: {
        type: ['integer', 'null'],
        description:
          'How many periods before the current one make the average. null: 12 weeks or 6 months.',
      },
    },
  ),
  tool(
    'calendar',
    'Chart: the days the user trained, for consistency. Gives workouts per week, gaps of a week ' +
      'or more, workouts per weekday, the weekdays of the last 4 weeks, and the usual training ' +
      'days with how often each was skipped (plans have no fixed weekdays).',
    { from: FROM, to: TO },
  ),
  tool(
    'distribution',
    'Chart: how the training is spread. muscle: sets per week for the main muscles (an ' +
      "exercise's main muscles count a set fully, helping muscles half) against the guideline of " +
      '10. exercise: sets per week per exercise. weekday: workouts per weekday.',
    {
      by: { type: 'string', enum: DISTRIBUTION_BY },
      from: {
        type: ['string', 'null'],
        description: 'First day, YYYY-MM-DD. null: 4 weeks ago, the current state.',
      },
      to: TO,
    },
  ),
  tool(
    'workouts',
    'No chart: looks up sessions with their exercises and sets, newest first (at most 10).',
    {
      from: FROM,
      to: TO,
      exercise_id: {
        type: ['string', 'null'],
        description: 'Only sessions with this exercise, and only its sets. null: all.',
      },
    },
  ),
];

export const CHART_TOOLS = new Set([
  'trend',
  'compare',
  'period_vs_average',
  'calendar',
  'distribution',
]);

/** Runs a tool the model called; a mistake in the call comes back as `error` for it to fix. */
export function runTool(name: string, args: unknown, data: CoachData, user: CoachUser): ToolResult {
  const run = RUNNERS[name];
  if (!run) return failed(`There is no tool "${name}".`);
  if (!args || typeof args !== 'object') return failed('The arguments are missing.');
  return run(args as Args, data, user);
}

const failed = (error: string): ToolResult => ({ chart: null, result: { error } });

const RUNNERS: Record<string, (args: Args, data: CoachData, user: CoachUser) => ToolResult> = {
  trend,
  compare,
  period_vs_average: periodVsAverage,
  calendar,
  distribution,
  workouts,
};

// ---------- shared ----------

interface Range {
  from: string;
  to: string;
}

/** The days asked for: from the start of the data to today unless given; null when invalid. */
/** `range`, starting at the first workout at the earliest: the days before it were not missed. */
const fromFirstWorkout = (range: Range, first: string | undefined): Range => ({
  from: first && first > range.from ? first : range.from,
  to: range.to,
});

function rangeOf(args: Args, start: string | undefined, user: CoachUser): Range | null {
  const from = args.from ?? start ?? user.today;
  const to = args.to ?? user.today;
  if (!isDay(from) || !isDay(to) || from > to) return null;
  return { from, to: to > user.today ? user.today : to };
}

const BAD_RANGE = 'from and to must be days (YYYY-MM-DD), from not after to.';
const inRange = (date: string, { from, to }: Range) => date >= from && date <= to;
const dayOf = (workout: CoachWorkout, user: CoachUser) => dayIn(workout.startedAt, user.timeZone);

function exerciseOf(id: unknown, data: CoachData) {
  return typeof id === 'string' ? data.exercises.get(id) : undefined;
}

const UNKNOWN_EXERCISE = "Unknown exercise_id: use an id from the user's exercises.";

/** First, last and the extremes of a series, for the model to quote. */
function summary(points: Point[], digits: number) {
  if (!points.length) return { count: 0 };
  const first = points[0];
  const last = points.at(-1)!;
  const lowest = points.reduce((a, b) => (b.value < a.value ? b : a));
  const highest = points.reduce((a, b) => (b.value > a.value ? b : a));
  const change = round(last.value - first.value, digits);
  return {
    count: points.length,
    first,
    last,
    change,
    change_percent: first.value ? Math.round((change / first.value) * 100) : null,
    lowest,
    highest,
  };
}

/** At most `max` points, evenly picked with the first and last: enough to read the shape. */
function sample(points: Point[], max = 24) {
  if (points.length <= max) return points;
  return Array.from(
    { length: max },
    (_, i) => points[Math.round((i * (points.length - 1)) / (max - 1))],
  );
}

/** Most points a chart's line or dots keep: about one per 2 pt of a phone's plot. */
const CHART_POINTS = 150;
/** Single weigh-ins drawn as dots under the trend line. */
const CHART_DOTS = 120;
/** Each line of a comparison. */
const COMPARE_POINTS = 100;
/** The calendar shows the last year at most (a phone fits about 50 weeks). */
const CALENDAR_WEEKS = 53;

/**
 * At most `max` points for a chart (it is saved with the answer and drawn on a phone): evenly
 * spread, with the first, last, lowest and highest kept so the line keeps its shape.
 */
function thin(points: Point[], max: number) {
  if (points.length <= max) return points;
  const keep = new Set(sample(points, max - 2));
  const values = points.map((p) => p.value);
  keep.add(points[values.indexOf(Math.min(...values))]);
  keep.add(points[values.indexOf(Math.max(...values))]);
  return points.filter((p) => keep.has(p));
}

/** A series' points that set a new best over everything before them (the first value doesn't). */
function recordsOf(all: Point[], range: Range) {
  const records: Point[] = [];
  let best = -Infinity;
  all.forEach((point, i) => {
    if (i > 0 && point.value > best && inRange(point.date, range)) records.push(point);
    best = Math.max(best, point.value);
  });
  return records;
}

const unitOf = (metric: TrendMetric | PeriodMetric, user: CoachUser) =>
  ({
    e1rm: weightUnit(user.units),
    top_weight: weightUnit(user.units),
    volume: weightUnit(user.units),
    body_weight: weightUnit(user.units),
    body_score: 'points',
    reps: 'reps',
    seconds: 's',
    sets: 'sets',
    workouts: 'workouts',
    minutes: 'min',
  })[metric];

/** A value in the user's units, rounded as the model should quote it. */
function shown(metric: ExerciseMetric, kgOrCount: number, user: CoachUser) {
  if (metric === 'reps' || metric === 'seconds') return Math.round(kgOrCount);
  const value = inUnits(kgOrCount, user.units);
  return metric === 'volume' ? Math.round(value) : round(value);
}

/** Every session's value of one exercise, oldest first. */
function exerciseSeries(
  exercise: CoachExercise,
  metric: ExerciseMetric,
  data: CoachData,
  user: CoachUser,
) {
  const bodyKg = latestBodyWeight(data);
  const points: Point[] = [];
  for (const workout of data.workouts) {
    const sets = workout.exercises
      .filter((e) => e.exerciseId === exercise.id)
      .flatMap((e) => e.sets);
    const value = sets.length ? sessionValue(metric, exercise, sets, bodyKg) : null;
    if (value != null)
      points.push({ date: dayOf(workout, user), value: shown(metric, value, user) });
  }
  return points;
}

const tooLittle = (count: number) =>
  count ? 'Only one value in this time: too little for a chart.' : 'No data in this time.';

// ---------- trend ----------

function trend(args: Args, data: CoachData, user: CoachUser): ToolResult {
  const metric = args.metric as TrendMetric;
  if (metric === 'body_weight') return bodyWeight(args, data, user);
  let all: Point[];
  let exercise: CoachExercise | undefined;
  if (metric === 'body_score') {
    all = data.checks.map((c) => ({ date: c.date, value: c.score }));
  } else if (EXERCISE_METRICS.includes(metric)) {
    exercise = exerciseOf(args.exercise_id, data);
    if (!exercise) return failed(UNKNOWN_EXERCISE);
    all = exerciseSeries(exercise, metric, data, user);
  } else {
    return failed(`Unknown metric "${String(metric)}".`);
  }
  const range = rangeOf(args, all[0]?.date, user);
  if (!range) return failed(BAD_RANGE);
  const points = all.filter((p) => inRange(p.date, range));
  const records = args.show_records ? recordsOf(all, range) : null;
  const unit = unitOf(metric, user);
  const result = {
    metric,
    exercise: exercise?.name ?? null,
    unit,
    ...range,
    ...summary(points, metric === 'volume' ? 0 : 1),
    ...(records ? { records } : {}),
    points: sample(points),
  };
  if (points.length < 2)
    return { chart: null, result: { ...result, note: tooLittle(points.length) } };
  return {
    chart: {
      type: 'trend',
      metric,
      unit,
      exerciseId: exercise?.id ?? null,
      points: thin(points, CHART_POINTS),
      line: null,
      records,
    },
    result,
  };
}

/** Each entry pulls the trend line 10 % of the way per day since the last one. */
function smoothed(entries: CoachData['weights']) {
  let value = entries[0]?.kg ?? 0;
  let previous = entries[0]?.date ?? '';
  return entries.map(({ date, kg }) => {
    value += (1 - 0.9 ** Math.max(1, daysBetween(previous, date))) * (kg - value);
    previous = date;
    return { date, value };
  });
}

function bodyWeight(args: Args, data: CoachData, user: CoachUser): ToolResult {
  const range = rangeOf(args, data.weights[0]?.date, user);
  if (!range) return failed(BAD_RANGE);
  const toPoint = ({ date, value }: Point) => ({ date, value: round(inUnits(value, user.units)) });
  const points = data.weights
    .filter((w) => inRange(w.date, range))
    .map((w) => toPoint({ date: w.date, value: w.kg }));
  const line = smoothed(data.weights)
    .filter((p) => inRange(p.date, range))
    .map(toPoint);
  const unit = weightUnit(user.units);
  const result: Record<string, unknown> = {
    metric: 'body_weight',
    unit,
    ...range,
    measurements: points.length,
  };
  if (points.length < 2)
    return { chart: null, result: { ...result, note: tooLittle(points.length) } };
  const trendSummary = summary(line, 1);
  const measured = summary(points, 1);
  const weeks = daysBetween(line[0].date, line.at(-1)!.date) / 7;
  Object.assign(result, {
    // The trend, not single weigh-ins, is what changed: it evens out water and meals.
    trend: trendSummary,
    change_per_week: weeks >= 1 ? round((line.at(-1)!.value - line[0].value) / weeks, 2) : null,
    lowest_measurement: measured.lowest,
    highest_measurement: measured.highest,
    trend_points: sample(line),
  });
  return {
    chart: {
      type: 'trend',
      metric: 'body_weight',
      unit,
      exerciseId: null,
      points: thin(points, CHART_DOTS),
      line: thin(line, CHART_POINTS),
      records: null,
    },
    result,
  };
}

// ---------- compare ----------

function compare(args: Args, data: CoachData, user: CoachUser): ToolResult {
  const ids = Array.isArray(args.exercise_ids) ? args.exercise_ids : [];
  if (ids.length < 2 || ids.length > 4) return failed('Give 2 to 4 exercise_ids.');
  const exercises = ids.map((id) => exerciseOf(id, data));
  if (exercises.some((e) => !e)) return failed(UNKNOWN_EXERCISE);
  const metric = args.metric as ExerciseMetric;
  if (!EXERCISE_METRICS.includes(metric)) return failed(`Unknown metric "${String(metric)}".`);
  const all = exercises.map((e) => exerciseSeries(e!, metric, data, user));
  const start = all
    .map((points) => points[0]?.date)
    .filter(Boolean)
    .sort()[0];
  const range = rangeOf(args, start, user);
  if (!range) return failed(BAD_RANGE);
  const series = all.map((points, i) => ({
    exerciseId: exercises[i]!.id,
    points: points.filter((p) => inRange(p.date, range)),
  }));
  const unit = unitOf(metric, user);
  const result = {
    metric,
    unit,
    ...range,
    as_percent: !!args.as_percent,
    exercises: series.map(({ points }, i) => ({
      name: exercises[i]!.name,
      ...summary(points, metric === 'volume' ? 0 : 1),
      ...(points.length < 2 ? { note: tooLittle(points.length) } : {}),
    })),
  };
  if (series.every((s) => s.points.length < 2)) return { chart: null, result };
  const lines = series.map((s) => ({ ...s, points: thin(s.points, COMPARE_POINTS) }));
  return {
    chart: { type: 'compare', metric, unit, asPercent: !!args.as_percent, series: lines },
    result,
  };
}

// ---------- period vs average ----------

function periodValue(
  metric: PeriodMetric,
  workout: CoachWorkout,
  data: CoachData,
  user: CoachUser,
) {
  if (metric === 'volume') return inUnits(workoutVolumeKg(workout, data), user.units);
  if (metric === 'sets') return workoutSets(workout, data);
  if (metric === 'minutes') return workoutMinutes(workout);
  return 1;
}

function periodVsAverage(args: Args, data: CoachData, user: CoachUser): ToolResult {
  const metric = args.metric as PeriodMetric;
  if (!PERIOD_METRICS.includes(metric)) {
    return failed(`Unknown metric "${String(metric)}".`);
  }
  const period: Period = args.period === 'month' ? 'month' : 'week';
  if (!data.workouts.length)
    return { chart: null, result: { metric, period, note: 'No workouts yet.' } };
  const startOf = period === 'week' ? weekStart : monthStart;
  const before = (start: string) => (period === 'week' ? addDays(start, -7) : previousMonth(start));
  const byDay = new Map<string, number>();
  const totals = new Map<string, number>();
  for (const workout of data.workouts) {
    const day = dayOf(workout, user);
    const value = periodValue(metric, workout, data, user);
    byDay.set(day, (byDay.get(day) ?? 0) + value);
    totals.set(startOf(day), (totals.get(startOf(day)) ?? 0) + value);
  }
  const valueOf = (start: string) => Math.round(totals.get(start) ?? 0);
  const first = startOf(dayOf(data.workouts[0], user));
  const current = startOf(user.today);
  const count = Math.min(52, Math.max(1, Number(args.periods) || (period === 'week' ? 12 : 6)));
  // The periods before the current one, oldest first; none before the first workout's.
  const earlier: string[] = [];
  for (
    let start = before(current);
    earlier.length < count && start >= first;
    start = before(start)
  ) {
    earlier.unshift(start);
  }
  const bars = [...earlier, current].map((date) => ({ date, value: valueOf(date) }));
  const now = valueOf(current);
  // "Usual" means a period with training: a vacation doesn't pull the average down.
  const trainedIn = earlier.filter((start) => totals.has(start));
  const mean = (values: number[]) =>
    values.length ? round(values.reduce((a, b) => a + b, 0) / values.length) : null;
  const average = mean(trainedIn.map(valueOf));
  // The latest earlier period at least as high as the current one: "your highest since August".
  let asHigh: string | null = null;
  for (let start = before(current); start >= first; start = before(start)) {
    if (valueOf(start) >= now) {
      asHigh = start;
      break;
    }
  }
  const daysIn = daysBetween(current, user.today) + 1;
  const daysTotal = period === 'week' ? 7 : daysInMonth(current);
  // While the current period runs, its first days against the same days of earlier ones.
  const firstDays = (start: string) => {
    let sum = 0;
    for (let i = 0; i < Math.min(daysIn, period === 'week' ? 7 : daysInMonth(start)); i++) {
      sum += byDay.get(addDays(start, i)) ?? 0;
    }
    return Math.round(sum);
  };
  const previous = earlier.at(-1);
  const soFar =
    daysIn < daysTotal
      ? {
          days: daysIn,
          this_period: now,
          previous_period_same_days: previous ? firstDays(previous) : null,
          average_same_days: mean(trainedIn.map(firstDays)),
        }
      : null;
  const unit = unitOf(metric, user);
  const difference = average == null ? null : round(now - average);
  return {
    chart: { type: 'period_vs_average', metric, unit, period, bars, average },
    result: {
      metric,
      unit,
      period,
      current: {
        start: current,
        value: now,
        days_in: daysIn,
        days_total: daysTotal,
        partial: daysIn < daysTotal,
      },
      previous: bars.at(-2) ?? null,
      average,
      periods_averaged: trainedIn.length,
      periods_without_training: earlier.length - trainedIn.length,
      difference,
      difference_percent: average ? Math.round(((now - average) / average) * 100) : null,
      // null: higher than every earlier period.
      last_period_as_high: asHigh,
      so_far: soFar,
      periods: bars,
    },
  };
}

// ---------- calendar ----------

function calendar(args: Args, data: CoachData, user: CoachUser): ToolResult {
  const days = data.workouts.map((w) => dayOf(w, user));
  const asked = rangeOf(args, days[0], user);
  if (!asked) return failed(BAD_RANGE);
  const range = fromFirstWorkout(asked, days[0]);
  const counts = new Map<string, number>();
  const sets = new Map<string, number>();
  data.workouts.forEach((workout, i) => {
    if (!inRange(days[i], range)) return;
    counts.set(days[i], (counts.get(days[i]) ?? 0) + 1);
    sets.set(days[i], (sets.get(days[i]) ?? 0) + workoutSets(workout, data));
  });
  const trained = [...counts.keys()].sort();
  const workouts = [...counts.values()].reduce((a, b) => a + b, 0);
  const weeks = (daysBetween(range.from, range.to) + 1) / 7;

  // Stretches of at least 7 days without training, the longest three in order.
  const gaps: { from: string; to: string; days: number }[] = [];
  const edges = [addDays(range.from, -1), ...trained, addDays(range.to, 1)];
  for (let i = 1; i < edges.length; i++) {
    const free = daysBetween(edges[i - 1], edges[i]) - 1;
    if (free >= 7)
      gaps.push({ from: addDays(edges[i - 1], 1), to: addDays(edges[i], -1), days: free });
  }
  const longest = gaps
    .sort((a, b) => b.days - a.days)
    .slice(0, 3)
    .sort((a, b) => a.from.localeCompare(b.from));

  const weekdays = Object.fromEntries(WEEKDAYS.map((d) => [d, 0]));
  for (const day of trained) weekdays[weekdayOf(day)] += counts.get(day)!;
  // Usual days: weekdays trained on at least every other time. Today counts once it's trained.
  const dates = Object.fromEntries(WEEKDAYS.map((d) => [d, 0]));
  const trainedOn = Object.fromEntries(WEEKDAYS.map((d) => [d, 0]));
  for (let day = range.from; day <= range.to; day = addDays(day, 1)) {
    if (day < user.today || counts.has(day)) dates[weekdayOf(day)] += 1;
  }
  for (const day of trained) trainedOn[weekdayOf(day)] += 1;
  const usualDays = WEEKDAYS.filter((d) => dates[d] && trainedOn[d] >= dates[d] / 2).map((d) => ({
    day: d,
    trained: trainedOn[d],
    of: dates[d],
    skipped: dates[d] - trainedOn[d],
  }));
  const recentWeeks = [3, 2, 1, 0].map((back) => {
    const start = addDays(weekStart(range.to), -7 * back);
    return {
      week_start: start,
      days: trained.filter((d) => d >= start && d <= addDays(start, 6)).map(weekdayOf),
    };
  });

  // The chart shows the range's last weeks, or the last weeks trained when those had none.
  const yearBefore = (day: string) => addDays(weekStart(day), -7 * (CALENDAR_WEEKS - 1));
  const lastTrained = trained.at(-1);
  const shownTo = lastTrained && lastTrained < yearBefore(range.to) ? lastTrained : range.to;
  const shownFrom = [range.from, yearBefore(shownTo)].sort()[1];
  return {
    chart: trained.length
      ? {
          type: 'calendar',
          from: shownFrom,
          to: shownTo,
          days: trained
            .filter((date) => date >= shownFrom)
            .map((date) => ({
              date,
              value: counts.get(date)!,
              sets: sets.get(date) ?? 0,
            })),
        }
      : null,
    result: {
      ...range,
      workouts,
      training_days: trained.length,
      weeks: round(weeks),
      per_week: weeks > 0 ? round(workouts / weeks) : null,
      gaps_of_a_week_or_more: longest,
      workouts_per_weekday: weekdays,
      usual_days: usualDays,
      last_4_weeks: recentWeeks,
      ...(trained.length ? {} : { note: 'No workouts in this time.' }),
    },
  };
}

// ---------- distribution ----------

/**
 * The muscles listed, also when untrained (an empty bar answers "what do I neglect?"). Forearms,
 * traps and the like get their work from the big lifts and stay out.
 */
const MAIN_MUSCLES = [
  'chest',
  'lats',
  'upper_back',
  'front_delts',
  'side_delts',
  'rear_delts',
  'biceps',
  'triceps',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'abs',
];
const SETS_GUIDELINE = 10;

function distribution(args: Args, data: CoachData, user: CoachUser): ToolResult {
  const by = args.by as DistributionBy;
  if (!DISTRIBUTION_BY.includes(by)) return failed(`Unknown by "${String(by)}".`);
  const first = data.workouts[0] ? dayOf(data.workouts[0], user) : undefined;
  // Without a start the last 4 weeks: the current state, not one diluted by old breaks.
  const asked = rangeOf(args, addDays(user.today, -27), user);
  if (!asked) return failed(BAD_RANGE);
  const range = fromFirstWorkout(asked, first);
  const weeks = Math.max(1, (daysBetween(range.from, range.to) + 1) / 7);
  const inside = data.workouts.filter((w) => inRange(dayOf(w, user), range));

  const totals = new Map<string, number>();
  const add = (key: string, n: number) => totals.set(key, (totals.get(key) ?? 0) + n);
  for (const workout of inside) {
    if (by === 'weekday') {
      add(weekdayOf(dayOf(workout, user)), 1);
      continue;
    }
    for (const { exerciseId, sets } of workout.exercises) {
      const exercise = data.exercises.get(exerciseId);
      if (!exercise || exercise.cardio || !sets.length) continue;
      if (by === 'exercise') add(exerciseId, sets.length);
      else {
        for (const m of exercise.primary) add(m, sets.length);
        for (const m of exercise.secondary) add(m, sets.length / 2);
      }
    }
  }
  if (by === 'muscle') for (const m of MAIN_MUSCLES) add(m, 0);
  if (by === 'weekday') for (const d of WEEKDAYS) add(d, 0);

  const perWeek = by !== 'weekday';
  let rows = [...totals]
    .filter(([key]) => by !== 'muscle' || MAIN_MUSCLES.includes(key))
    .map(([key, n]) => ({ key, value: perWeek ? round(n / weeks) : n }));
  rows =
    by === 'weekday'
      ? WEEKDAYS.map((d) => rows.find((r) => r.key === d)!)
      : rows.sort((a, b) => b.value - a.value).slice(0, by === 'exercise' ? 12 : undefined);
  const unit = perWeek ? 'sets_per_week' : 'workouts';
  const reference = by === 'muscle' ? SETS_GUIDELINE : null;
  return {
    chart: inside.length ? { type: 'distribution', by, unit, reference, rows } : null,
    result: {
      by,
      ...range,
      weeks: round(weeks),
      workouts: inside.length,
      unit,
      ...(reference ? { guideline: reference } : {}),
      rows: rows.map((r) => ({
        ...r,
        ...(by === 'exercise' ? { name: data.exercises.get(r.key)?.name ?? r.key } : {}),
      })),
      ...(inside.length ? {} : { note: 'No workouts in this time.' }),
    },
  };
}

// ---------- workouts ----------

/** A set as the app writes it: "80 kg × 8", "+10 kg × 6", "12 reps", "45 s", with its RIR. */
function formatSet(exercise: CoachExercise, set: CoachSet, user: CoachUser) {
  const unit = weightUnit(user.units);
  const weight =
    set.weightKg == null
      ? null
      : `${exercise.bodyweight ? '+' : ''}${round(inUnits(set.weightKg, user.units))} ${unit}`;
  let text =
    set.seconds != null
      ? `${weight ? `${weight} × ` : ''}${set.seconds} s`
      : weight && set.reps != null
        ? `${weight} × ${set.reps}`
        : `${set.reps ?? 0} reps`;
  if (exercise.assisted && weight) text += ' (assisted)';
  return set.rir == null ? text : `${text} (RIR ${set.rir})`;
}

const MAX_WORKOUTS = 10;

function workouts(args: Args, data: CoachData, user: CoachUser): ToolResult {
  const exercise = args.exercise_id == null ? null : exerciseOf(args.exercise_id, data);
  if (exercise === undefined) return failed(UNKNOWN_EXERCISE);
  const first = data.workouts[0] ? dayOf(data.workouts[0], user) : undefined;
  const range = rangeOf(args, first, user);
  if (!range) return failed(BAD_RANGE);
  const found = data.workouts
    .filter((w) => inRange(dayOf(w, user), range))
    .filter((w) => !exercise || w.exercises.some((e) => e.exerciseId === exercise.id))
    .reverse();
  return {
    chart: null,
    result: {
      ...range,
      found: found.length,
      shown: Math.min(found.length, MAX_WORKOUTS),
      workouts: found.slice(0, MAX_WORKOUTS).map((w) => ({
        date: dayOf(w, user),
        weekday: weekdayOf(dayOf(w, user)),
        name: w.name,
        minutes: workoutMinutes(w),
        exercises: w.exercises
          .filter((e) => !exercise || e.exerciseId === exercise.id)
          .map((e) => {
            const ex = data.exercises.get(e.exerciseId);
            return {
              name: ex?.name ?? e.exerciseId,
              sets: ex
                ? e.sets.map((s) => formatSet(ex, s, user)).join(', ')
                : `${e.sets.length} sets`,
            };
          }),
      })),
    },
  };
}
