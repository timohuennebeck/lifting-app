// read-workout-file's answers as the app gets them: sheets described once each with only columns they
// have, exercise names matched by position or by name, new exercises made once, and routine
// names cut to length.
import { assertEquals } from 'jsr:@std/assert@1';

import {
  mappedNames,
  type ModelName,
  nameSamples,
  routineNames,
  type SheetKind,
  sheetKinds,
  type SheetSample,
  sheetSamples,
} from '../read-workout-file/history.ts';
import type { CatalogRow } from './plans.ts';

const row = (id: string): CatalogRow => ({
  id,
  name: { en: id },
  equipment: 'barbell',
  needs: [],
  measures: ['weight', 'reps'],
  muscles: { chest: 1 },
  rest_seconds: 120,
  cardio: false,
});
const CATALOG = [row('bench-press'), row('dumbbell-bench-press'), row('hammer-curl')];

const sheet = (name: string, header: string[]): SheetSample => ({
  name,
  rows: 10,
  header,
  columns: [],
  sample: ['2: a | b'],
});

const said = (name: string, columns: Partial<SheetKind['columns']>): SheetKind => ({
  name,
  kind: 'history',
  columns: {
    date: null,
    end_time: null,
    duration: null,
    workout: null,
    exercise: null,
    set_order: null,
    set_type: null,
    sets: null,
    weight: null,
    weight_unit: null,
    reps: null,
    seconds: null,
    rpe: null,
    rir: null,
    ...columns,
  },
  day_order: 'day_first',
  weight_unit: 'kg',
  split: 'none',
  split_column: 'Datum',
  plan_values: [],
});

Deno.test('a sheet keeps only the columns it has, and one left out holds nothing', () => {
  const sheets = [sheet('Log', ['Datum', 'Übung']), sheet('Notes', ['Text'])];
  const kinds = sheetKinds(
    { sheets: [said('Log', { date: 'Datum', exercise: 'Exercise Name', reps: 'Übung' })] },
    sheets,
  );
  assertEquals(kinds.length, 2);
  assertEquals(kinds[0].columns.date, 'Datum');
  assertEquals(kinds[0].columns.exercise, null);
  assertEquals(kinds[0].columns.reps, 'Übung');
  assertEquals(kinds[1].kind, 'none');
});

Deno.test('requests that are not what the app sends are refused', () => {
  assertEquals(sheetSamples([]), null);
  assertEquals(sheetSamples([{ name: 'x', rows: 'many' }]), null);
  assertEquals(sheetSamples([sheet('Log', ['a'])])?.length, 1);
  assertEquals(nameSamples([{ name: ' ', sets: 1, hint: '' }]), null);
  assertEquals(nameSamples([{ name: 'Squat', sets: 3, hint: '' }])?.length, 1);
});

const line = (raw: string, catalog_id: string | null, certain = true): ModelName => ({
  raw,
  catalog_id,
  certain,
  alternatives: ['dumbbell-bench-press', 'nope'],
  new_exercise: null,
});

Deno.test('names match by position, else by the name repeated', () => {
  const names = [
    { name: 'Bench Press (Barbell)', sets: 40, hint: 'usually 80 kg × 8' },
    { name: 'Benqdrücken', sets: 12, hint: '' },
  ];
  const byPosition = mappedNames(
    { exercises: [line('Bench press', 'bench-press'), line('Benqdrücken', 'bench-press', false)] },
    names,
    CATALOG,
    () => 'id',
  );
  assertEquals(byPosition[0].exerciseId, 'bench-press');
  assertEquals(byPosition[1].certain, false);
  assertEquals(byPosition[1].alternatives, ['dumbbell-bench-press']);

  const byName = mappedNames(
    { exercises: [line('benqdrücken', 'bench-press', false)] },
    names,
    CATALOG,
    () => 'id',
  );
  assertEquals(byName[0], {
    name: names[0].name,
    exerciseId: null,
    certain: false,
    alternatives: [],
  });
  assertEquals(byName[1].exerciseId, 'bench-press');
});

Deno.test('a new exercise is made once, an unknown catalog id is none', () => {
  const fresh = (raw: string): ModelName => ({
    raw,
    catalog_id: null,
    certain: true,
    alternatives: [],
    new_exercise: {
      name: 'Cable Y Raise',
      primary: ['side_delts'],
      secondary: [],
      timed: false,
      weighted: true,
    },
  });
  let next = 0;
  const mapped = mappedNames(
    { exercises: [fresh('Y raise'), fresh('Y-Raise cable'), line('Hammer DB ?', 'made-up')] },
    [
      { name: 'Y raise', sets: 9, hint: '' },
      { name: 'Y-Raise cable', sets: 3, hint: '' },
      { name: 'Hammer DB ?', sets: 30, hint: '' },
    ],
    CATALOG,
    () => `new-${++next}`,
  );
  assertEquals(mapped[0].exerciseId, 'new-1');
  assertEquals(mapped[0].newExercise?.measures, ['weight', 'reps']);
  // The same exercise again: its definition comes along, so each name is complete on its own.
  assertEquals(mapped[1].newExercise?.id, 'new-1');
  assertEquals(mapped[2].exerciseId, null);
  assertEquals(mapped[2].certain, false);
});

Deno.test('routine names: one per routine, cut to ROUTINE_NAME_MAX', () => {
  const long = 'Oberkörper mit sehr langem Namen A und Rücken – schwer';
  assertEquals(routineNames({ names: ['Push', long] }, 3), [
    'Push',
    'Oberkörper mit sehr langem Namen A und',
    '',
  ]);
});
