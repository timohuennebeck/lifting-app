import { readSets } from './mock-import-data';
import type { ImportedPlan } from './plan-import-service';

export type VoiceDayName = 'shoulders' | 'arms' | 'push';
export type TokenKind = 'day' | 'exercise' | 'number' | 'remove' | 'filler';

export interface VoiceScript {
  /** Monday-based weekday the user names. */
  weekday: number;
  /** Day name used when that weekday has no training yet (`planImport:voice.days.*`). */
  dayName: VoiceDayName;
  remove: string[];
  add: { exerciseId: string; sets: number; reps: number }[];
}

/**
 * MOCK speech recognition: scripted utterances from the prototype (`Component.VP`).
 * Their spoken words live in `planImport:voice.scripts.<index>`.
 */
export const VOICE_SCRIPTS: VoiceScript[] = [
  {
    weekday: 4,
    dayName: 'shoulders',
    remove: [],
    add: [
      { exerciseId: 'dumbbell-shoulder-press', sets: 4, reps: 8 },
      { exerciseId: 'lateral-raise', sets: 3, reps: 15 },
      { exerciseId: 'reverse-fly', sets: 3, reps: 12 },
    ],
  },
  {
    weekday: 5,
    dayName: 'arms',
    remove: [],
    add: [
      { exerciseId: 'dumbbell-curl', sets: 3, reps: 12 },
      { exerciseId: 'triceps-pushdown', sets: 3, reps: 15 },
    ],
  },
  {
    weekday: 0,
    dayName: 'push',
    remove: ['hack-squat'],
    add: [
      { exerciseId: 'bench-press', sets: 3, reps: 12 },
      { exerciseId: 'french-press', sets: 3, reps: 10 },
    ],
  },
];

const KINDS: Record<string, TokenKind> = {
  d: 'day',
  e: 'exercise',
  n: 'number',
  x: 'remove',
};

/** Parses "d:Friday e:Lateral n:three …" into words tagged by their role. */
export function parseTranscript(text: string) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const match = /^([dexn0]):(.*)$/.exec(token);
      return match
        ? { word: match[2], kind: KINDS[match[1]] ?? 'filler' }
        : { word: token, kind: 'filler' as TokenKind };
    });
}

/**
 * Applies a recognized utterance: edits the named weekday's day (or creates it).
 * Returns the new plan and the index of the touched day.
 */
export function applyVoiceScript(plan: ImportedPlan, script: VoiceScript, newDayName: string) {
  const days = plan.days.map((d) => ({ ...d, exercises: [...d.exercises] }));
  let day = days.find((d) => d.weekday === script.weekday);
  if (!day) {
    day = { name: newDayName, weekday: script.weekday, exercises: [] };
    days.push(day);
  }
  const target = day;
  target.exercises = target.exercises.filter(
    (e) => !script.remove.includes(e.exerciseId as string),
  );
  for (const { exerciseId, sets, reps } of script.add) {
    if (target.exercises.some((e) => e.exerciseId === exerciseId)) continue;
    target.exercises.push({ exerciseId, sets: readSets(sets, reps), restSeconds: null });
  }
  days.sort((a, b) => (a.weekday ?? 7) - (b.weekday ?? 7));
  return { plan: { ...plan, days }, dayIndex: days.indexOf(target) };
}
