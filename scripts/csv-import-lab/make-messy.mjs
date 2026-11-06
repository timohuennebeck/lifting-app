// Writes samples/messy-5000.csv: about 5,000 sets in a Strong-like layout with names as people
// type them (German and English mixed, typos, abbreviations, gym slang, an emoji, a few nobody can
// match), about a fifth of the workouts without a date, and weights written "62,5" or "80 kg".
// Usage: node scripts/csv-import-lab/make-messy.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

let seed = 11;
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = (list) => list[Math.floor(random() * list.length)];

/** Per day: [the names this lift goes by in the file, start kg, end kg, reps] (0 kg: bodyweight). */
const DAYS = {
  Push: [
    [['Bankdrücken LH', 'Bankdrücken', 'BB Bench', 'Bankdruecken'], 70, 100, 8],
    [['Schrägbank KH', 'Incline DB press', 'schrägbankdrücken kurzhantel'], 24, 36, 10],
    [['OHP', 'Schulterdrücken stehend', 'Military Press'], 40, 60, 8],
    [['Seitheben', 'Lateral raises', 'Seitheben KH (leicht)'], 8, 14, 15],
    [['Trizeps Kabel', 'Pushdowns Seil', 'Trizepsdrücken am Kabelzug'], 20, 35, 12],
    [['Butterfly Maschine', 'Pec Deck', 'Fliegende Maschine'], 40, 65, 12],
  ],
  Pull: [
    [['Kreuzheben', 'Deadlift', 'KH (Kreuzheben)'], 110, 170, 5],
    [['Latzug eng', 'Lat Pulldown close grip', 'Latziehen eng'], 55, 80, 10],
    [['Rudern LH', 'BB Row', 'Langhantelrudern vorgebeugt'], 60, 85, 8],
    [['Face Pulls', 'Facepull Seil'], 15, 25, 15],
    [['Bizeps Curls SZ', 'EZ Curls', 'Bizepscurl SZ-Stange'], 25, 40, 10],
    [['Mystery Machine 3', 'die gelbe Maschine'], 30, 45, 12],
  ],
  Legs: [
    [['Kniebeugen', 'Squats!!', 'Back Squat', 'kniebeuge'], 90, 140, 6],
    [['RDL', 'Rumänisches Kreuzheben', 'Romanian DL'], 70, 110, 8],
    [['Beinpresse', 'Leg Press 45°', 'Beinpresse (Schlitten)'], 140, 240, 12],
    [['Beinstrecker', 'Leg Extensions'], 40, 70, 15],
    [['Hip Thrust Maschine (neu)', 'Hip Thrust Machine'], 60, 120, 10],
    [['Wadenheben stehend', 'Calf raises 🔥'], 60, 100, 15],
  ],
  Upper: [
    [['Klimmzüge', 'Pull Ups', 'Klimmis'], 0, 0, 8],
    [['Flachbank KH', 'DB Bench', 'Kurzhantel Bankdrücken'], 28, 40, 10],
    [['Kabelzug Fliegende', 'Cable Fly', 'Cable crossover'], 10, 20, 12],
    [['Arnold Press', 'Arnold Drücken'], 14, 24, 10],
    [['Übung 7', 'xyz neu'], 20, 30, 10],
    [['Dips', 'Barrenstütz'], 0, 0, 10],
  ],
};
const ORDER = ['Push', 'Pull', 'Legs', 'Upper'];
const TITLE = { Push: 'Push', Pull: 'Pull', Legs: 'Beine', Upper: 'Oberkörper' };

const pad = (n) => String(n).padStart(2, '0');
const dateText = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
const quote = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** A weight as people type it: "80", "62,5", "80 kg"; empty for bodyweight. */
function weightText(kg) {
  if (!kg) return '';
  const r = random();
  const text = Number.isInteger(kg) ? String(kg) : String(kg).replace('.', r < 0.5 ? ',' : '.');
  return r > 0.9 ? `${text} kg` : text;
}

const rows = [
  [
    'Date',
    'Workout Name',
    'Duration',
    'Exercise Name',
    'Set Order',
    'Weight',
    'Reps',
    'Notes',
    'RPE',
  ],
];
const start = new Date(2024, 10, 4, 18, 0);
let day = new Date(start);
let w = 0;
while (rows.length < 5001) {
  const name = ORDER[w % ORDER.length];
  const progress = Math.min(1, w / 230);
  const undated = random() < 0.2;
  const when = new Date(day);
  when.setHours(pick([7, 12, 17, 18, 19]), pick([0, 10, 30, 45]));
  const duration = `${55 + Math.floor(random() * 40)}m`;
  for (const [names, from, to, reps] of DAYS[name]) {
    if (random() < 0.12) continue; // skipped today
    const exercise = pick(names);
    const top = Math.round((from + (to - from) * progress) / 2.5) * 2.5;
    const sets = 3 + Math.floor(random() * 2);
    for (let s = 1; s <= sets; s++) {
      const kg = Math.max(0, top - (sets - s) * 2.5);
      const done = Math.max(1, reps - Math.floor(random() * 3) + (s === 1 ? 1 : 0));
      const note =
        random() < 0.03 ? pick(['zu schwer', 'Schulter zwickt', 'PR!!', 'neue Maschine']) : '';
      const rpe = random() < 0.3 ? String(7 + Math.floor(random() * 3)) : '';
      rows.push([
        undated ? '' : dateText(when),
        TITLE[name],
        duration,
        exercise,
        String(s),
        weightText(kg),
        String(done),
        note,
        rpe,
      ]);
      if (rows.length >= 5001) break;
    }
    if (rows.length >= 5001) break;
  }
  w++;
  day = new Date(day.getTime() + (random() < 0.7 ? 2 : 3) * 86_400_000);
}

const out = join(import.meta.dirname, 'samples', 'messy-5000.csv');
writeFileSync(out, rows.map((r) => r.map(quote).join(',')).join('\n') + '\n');
console.log(`${rows.length - 1} sets in ${w} workouts → ${out}`);
