// Writes made-up CSVs to test the CSV import lab with, in the shape tracker apps export (one row
// per set): history-strong-style.csv (146 workouts, a quarter without a date), plan-and-log-de.csv
// (a plan on top, a log below) and history-1y/2y/5y.csv (3.5 workouts a week, changing blocks).
// Usage: node scripts/csv-import-lab/make-sample.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const HERE = import.meta.dirname;
let seed = 7;
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = (list) => list[Math.floor(random() * list.length)];

const DAYS = {
  Push: [
    'Bench Press (Barbell)',
    'Incline Bench Press (Dumbbell)',
    'Overhead Press (Barbell)',
    'Lateral Raise (Dumbbell)',
    'Triceps Pushdown (Cable - Straight Bar)',
    'Chest Fly',
  ],
  Pull: [
    'Deadlift (Barbell)',
    'Lat Pulldown (Cable)',
    'Bent Over Row (Barbell)',
    'Face Pull (Cable)',
    'Bicep Curl (Dumbbell)',
    'Hammer DB ?',
  ],
  Legs: [
    'Squat (Barbell)',
    'Romanian Deadlift (Barbell)',
    'Leg Press',
    'Leg Extension (Machine)',
    'Seated Leg Curl (Machine)',
    'Standing Calf Raise (Machine)',
  ],
  Upper: [
    'Bench Press (Barbell)',
    'Pull Up',
    'Seated Row (Cable)',
    'Arnold Press (Dumbbell)',
    'Plank',
  ],
};
const START = {
  'Bench Press (Barbell)': 60,
  'Incline Bench Press (Dumbbell)': 22,
  'Overhead Press (Barbell)': 40,
  'Lateral Raise (Dumbbell)': 8,
  'Triceps Pushdown (Cable - Straight Bar)': 25,
  'Chest Fly': 14,
  'Deadlift (Barbell)': 100,
  'Lat Pulldown (Cable)': 50,
  'Bent Over Row (Barbell)': 55,
  'Face Pull (Cable)': 20,
  'Bicep Curl (Dumbbell)': 12,
  'Hammer DB ?': 12,
  'Squat (Barbell)': 80,
  'Romanian Deadlift (Barbell)': 70,
  'Leg Press': 140,
  'Leg Extension (Machine)': 40,
  'Seated Leg Curl (Machine)': 35,
  'Standing Calf Raise (Machine)': 60,
  'Pull Up': 0,
  'Seated Row (Cable)': 50,
  'Arnold Press (Dumbbell)': 16,
  Plank: 0,
};

const csv = (rows) =>
  rows
    .map((row) =>
      row
        .map((v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v))
        .join(','),
    )
    .join('\n') + '\n';

function history(workouts) {
  const rows = [];
  const order = ['Push', 'Pull', 'Legs', 'Upper'];
  let date = new Date('2023-09-04T18:00:00Z');
  for (let w = 0; w < workouts; w++) {
    const name = order[w % order.length];
    const progress = w / workouts;
    // About a quarter of the workouts lost their date (as in a broken export).
    const stamp = random() < 0.26 ? '' : date.toISOString().replace('T', ' ').slice(0, 19);
    const duration = `${55 + Math.floor(random() * 30)}m`;
    for (const exercise of DAYS[name]) {
      const sets = exercise === 'Plank' ? 3 : 3 + (random() < 0.3 ? 1 : 0);
      for (let s = 1; s <= sets; s++) {
        const weight = START[exercise]
          ? Math.round((START[exercise] * (1 + progress * 0.35)) / 2.5) * 2.5
          : '';
        const reps = exercise === 'Plank' ? '' : 6 + Math.floor(random() * 7);
        const seconds = exercise === 'Plank' ? 45 + Math.floor(random() * 30) : '';
        const rpe = random() < 0.4 ? pick([7, 7.5, 8, 8.5, 9]) : '';
        rows.push([stamp, name, duration, exercise, s, weight, reps, '', seconds, '', '', rpe]);
      }
    }
    date = new Date(
      date.getTime() + (random() < 0.8 ? 2 : 4) * 86_400_000 + 3_600_000 * (random() - 0.5),
    );
  }
  return [
    [
      'Date',
      'Workout Name',
      'Duration',
      'Exercise Name',
      'Set Order',
      'Weight',
      'Reps',
      'Distance',
      'Seconds',
      'Notes',
      'Workout Notes',
      'RPE',
    ],
    ...rows,
  ];
}

writeFileSync(join(HERE, 'samples', 'history-strong-style.csv'), csv(history(146)));

// A plan (no dates, sets x reps) followed by a short log, in German as a gym note would be.
const plan = [
  ['Tag', 'Übung', 'Sätze', 'Wdh', 'Gewicht', 'Datum'],
  ['Push', 'BD LH', '4', '6-8', '', ''],
  ['Push', 'Schrägbank KH', '3', '8-12', '', ''],
  ['Push', 'Seitheben', '3', '12-15', '', ''],
  ['Push', 'Trizepsdrücken Kabel', '3', '10-12', '', ''],
  ['Pull', 'Kreuzheben', '3', '5', '', ''],
  ['Pull', 'Lat ziehen', '3', '8-10', '', ''],
  ['Pull', 'Rudern Kabel', '3', '10-12', '', ''],
  ['Pull', 'SZ Curls', '3', '10', '', ''],
  ['Beine', 'Kniebeuge', '4', '5', '', ''],
  ['Beine', 'Beinpresse', '3', '10', '', ''],
  ['Beine', 'Beinstrecker', '3', '12', '', ''],
  ['Beine', 'Wadenheben', '4', '15', '', ''],
];
for (let w = 0; w < 12; w++) {
  const day = ['Push', 'Pull', 'Beine'][w % 3];
  const date = new Date(Date.UTC(2026, 0, 5 + w * 2))
    .toISOString()
    .slice(0, 10)
    .split('-')
    .reverse()
    .join('.');
  for (const row of plan.slice(1).filter((r) => r[0] === day)) {
    plan.push([
      day,
      row[1],
      '1',
      String(6 + Math.floor(random() * 6)),
      String(20 + Math.floor(random() * 80)),
      date,
    ]);
  }
}
writeFileSync(join(HERE, 'samples', 'plan-and-log-de.csv'), csv(plan));
console.log('Wrote samples/history-strong-style.csv and samples/plan-and-log-de.csv');

// Longer histories: 1, 2 and 5 years at about 3.5 workouts a week, with a break now and then. Every
// training block (about 4 months) swaps some exercises for a variant, so the number of different
// exercise names grows with the years as in a real log. About 5% of the workouts have no date.
const VARIANTS = {
  'Bench Press (Barbell)': [
    'Incline Bench Press (Barbell)',
    'Bench Press (Dumbbell)',
    'Bench Press (Smith Machine)',
  ],
  'Incline Bench Press (Dumbbell)': [
    'Chest Press (Machine)',
    'Incline Chest Press (Machine)',
    'Decline Bench Press (Barbell)',
  ],
  'Overhead Press (Barbell)': [
    'Shoulder Press (Dumbbell)',
    'Shoulder Press (Machine)',
    'Seated Overhead Press (Barbell)',
  ],
  'Lateral Raise (Dumbbell)': ['Lateral Raise (Cable)', 'Lateral Raise (Machine)'],
  'Triceps Pushdown (Cable - Straight Bar)': [
    'Triceps Pushdown (Cable - Rope)',
    'Skullcrusher (Barbell)',
    'Triceps Extension (Dumbbell)',
  ],
  'Chest Fly': ['Cable Crossover', 'Pec Deck (Machine)', 'Chest Fly (Dumbbell)'],
  'Deadlift (Barbell)': ['Trap Bar Deadlift', 'Sumo Deadlift (Barbell)', 'Rack Pull (Barbell)'],
  'Lat Pulldown (Cable)': [
    'Lat Pulldown - Close Grip (Cable)',
    'Lat Pulldown (Machine)',
    'Chin Up',
  ],
  'Bent Over Row (Barbell)': [
    'Pendlay Row (Barbell)',
    'T Bar Row',
    'Bent Over One Arm Row (Dumbbell)',
  ],
  'Face Pull (Cable)': ['Reverse Fly (Dumbbell)', 'Reverse Fly (Machine)'],
  'Bicep Curl (Dumbbell)': [
    'Bicep Curl (Barbell)',
    'EZ Bar Curl',
    'Preacher Curl (Machine)',
    'Bicep Curl (Cable)',
  ],
  'Hammer DB ?': ['Hammer Curl (Dumbbell)', 'Hammer Curl (Cable - Rope)'],
  'Squat (Barbell)': [
    'Front Squat (Barbell)',
    'Hack Squat',
    'Squat (Smith Machine)',
    'Goblet Squat (Kettlebell)',
  ],
  'Romanian Deadlift (Barbell)': [
    'Romanian Deadlift (Dumbbell)',
    'Good Morning (Barbell)',
    'Hip Thrust (Barbell)',
  ],
  'Leg Press': ['Bulgarian Split Squat', 'Lunge (Dumbbell)', 'Walking Lunge'],
  'Leg Extension (Machine)': ['Sissy Squat', 'Leg Extension single leg'],
  'Seated Leg Curl (Machine)': ['Lying Leg Curl (Machine)', 'Nordic Curl'],
  'Standing Calf Raise (Machine)': ['Seated Calf Raise (Machine)', 'Calf Press on Leg Press'],
  'Pull Up': ['Pull Up (Assisted)', 'Chin Up', 'Pull Up (Weighted)'],
  'Seated Row (Cable)': ['Seated Row (Machine)', 'Chest Supported Row (Dumbbell)'],
  'Arnold Press (Dumbbell)': ['Upright Row (Cable)', 'Shrug (Dumbbell)'],
  Plank: ['Hanging Leg Raise', 'Cable Crunch', 'Ab Wheel', 'Side Plank'],
};
const TIMED = new Set(['Plank', 'Side Plank']);
const BODYWEIGHT = new Set([
  ...TIMED,
  'Pull Up',
  'Chin Up',
  'Pull Up (Assisted)',
  'Hanging Leg Raise',
  'Ab Wheel',
  'Nordic Curl',
  'Sissy Squat',
]);

function historyYears(years) {
  const rows = [];
  const order = ['Push', 'Pull', 'Legs', 'Upper'];
  const start = new Date(Date.UTC(2026, 10, 1) - years * 365.25 * 86_400_000);
  const end = new Date(Date.UTC(2026, 10, 1));
  let date = new Date(start.getTime() + 18 * 3_600_000);
  let w = 0;
  let block = -1;
  let days = {};
  while (date < end) {
    // A new training block every ~4 months: each exercise has a 40% chance to become a variant.
    const b = Math.floor((date - start) / (122 * 86_400_000));
    if (b !== block) {
      block = b;
      days = Object.fromEntries(
        Object.entries(DAYS).map(([day, list]) => [
          day,
          list.map((e) => (b > 0 && random() < 0.4 ? pick(VARIANTS[e]) : e)),
        ]),
      );
    }
    const name = order[w % order.length];
    const progress = (date - start) / (end - start);
    const stamp = random() < 0.05 ? '' : date.toISOString().replace('T', ' ').slice(0, 19);
    const minutes = 50 + Math.floor(random() * 40);
    const duration = `${minutes}m`;
    for (const exercise of days[name]) {
      const timed = TIMED.has(exercise);
      const sets = timed ? 3 : 3 + (random() < 0.3 ? 1 : 0);
      const base = START[exercise] ?? 30;
      for (let s = 1; s <= sets; s++) {
        const weight = BODYWEIGHT.has(exercise)
          ? ''
          : Math.round((base * (1 + progress * 0.25 * Math.sqrt(years))) / 2.5) * 2.5;
        const reps = timed ? '' : 5 + Math.floor(random() * 8);
        const seconds = timed ? 30 + Math.floor(random() * 45) : '';
        const rpe = random() < 0.4 ? pick([7, 7.5, 8, 8.5, 9, 9.5]) : '';
        const notes =
          random() < 0.01 ? pick(['felt heavy', 'new PR!', 'left shoulder, careful']) : '';
        rows.push([
          stamp,
          name,
          duration,
          exercise,
          s,
          weight,
          reps,
          '',
          seconds,
          notes,
          '',
          rpe,
          date,
          minutes,
        ]);
      }
    }
    w++;
    // Mostly every other day; a week or two off now and then (holidays, illness).
    const gap = random() < 0.03 ? 7 + Math.floor(random() * 10) : random() < 0.75 ? 2 : 1;
    date = new Date(date.getTime() + gap * 86_400_000 + 3_600_000 * (random() - 0.5));
  }
  return [history(0)[0], ...rows];
}

// Hevy's export: one row per set, start and end like "28 Oct 2024, 18:46", set_index from 0, a
// set_type (normal, warmup, failure, dropset), weights in kg, every workout dated.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const hevyDate = (d) =>
  `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
const HEVY_TITLES = { Push: 'Push Day', Pull: 'Pull Day', Legs: 'Leg Day', Upper: 'Upper Body' };

// Its own random sequence, so adding Hevy files leaves the other files as they were.
let hevySeed = 99;
const hevyRandom = () => ((hevySeed = (hevySeed * 16807) % 2147483647) - 1) / 2147483646;

function hevy(rows) {
  const out = [
    [
      'title',
      'start_time',
      'end_time',
      'description',
      'exercise_title',
      'superset_id',
      'exercise_notes',
      'set_index',
      'set_type',
      'weight_kg',
      'reps',
      'distance_km',
      'duration_seconds',
      'rpe',
    ],
  ];
  for (const [
    ,
    name,
    ,
    exercise,
    set,
    weight,
    reps,
    ,
    seconds,
    notes,
    ,
    rpe,
    date,
    minutes,
  ] of rows.slice(1)) {
    const end = new Date(date.getTime() + minutes * 60_000);
    const type =
      set === 1 && weight !== '' && hevyRandom() < 0.15
        ? 'warmup'
        : hevyRandom() < 0.04
          ? 'failure'
          : hevyRandom() < 0.02
            ? 'dropset'
            : 'normal';
    const w =
      weight === '' ? '' : type === 'warmup' ? Math.round((weight * 0.6) / 2.5) * 2.5 : weight;
    out.push([
      HEVY_TITLES[name],
      hevyDate(date),
      hevyDate(end),
      '',
      exercise,
      '',
      set === 1 ? notes : '',
      set - 1,
      type,
      w,
      reps,
      '',
      seconds,
      type === 'warmup' ? '' : rpe,
    ]);
  }
  return out;
}

seed = 42;
for (const years of [1, 2, 5]) {
  const rows = historyYears(years);
  writeFileSync(
    join(HERE, 'samples', `history-${years}y.csv`),
    csv(rows.map((r) => r.slice(0, 12))),
  );
  const hevyRows = hevy(rows);
  writeFileSync(join(HERE, 'samples', `hevy-${years}y.csv`), csv(hevyRows));
  console.log(
    `Wrote samples/history-${years}y.csv and hevy-${years}y.csv: ${rows.length - 1} rows`,
  );
}
