// Writes made-up CSVs to test the CSV import lab with: a workout history export in the shape
// common tracker apps use (one row per set; about 146 workouts, some rows without a date) and a
// file with a plan on top and a history below. Usage: node scripts/csv-import-lab/make-sample.mjs
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
