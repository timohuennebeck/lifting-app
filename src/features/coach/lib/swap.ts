import type { SwapChart } from './charts';
import type { SetsLine } from './sets-label';

/** A workout of a plan change as it is now, each exercise with its sets as one line. */
export interface SwapRoutine {
  id: string;
  name: string;
  exercises: SetsLine[];
}

export interface SwapView {
  /** The exercise to replace. */
  exerciseId: string;
  /** Best first. */
  options: string[];
  /** The workouts it is in now; once applied, the ones its replacement is in. */
  routines: { id: string; name: string }[];
  /** Its sets in the first of them; null once it is gone without a replacement. */
  line: SetsLine | null;
  /** The option in its place once applied. */
  applied: string | null;
}

/**
 * ready: every exercise is still in its workouts. applied: at least one is replaced by one of its
 * options, the others were kept. stale: the plan changed otherwise since the answer (an exercise
 * is gone from its workouts without one of its options in its place).
 */
export type SwapStatus = 'ready' | 'applied' | 'stale';

const has = (routine: SwapRoutine, exerciseId: string) =>
  routine.exercises.some((e) => e.exerciseId === exerciseId);

const lineIn = (routine: SwapRoutine, exerciseId: string) =>
  routine.exercises.find((e) => e.exerciseId === exerciseId) ?? null;

const named = ({ id, name }: SwapRoutine) => ({ id, name });

/** Where each swap of the card stands, read from the workouts as they are now. */
export function swapState(chart: SwapChart, routines: SwapRoutine[]) {
  const swaps: SwapView[] = chart.swaps.map(({ exerciseId, routineIds, options }) => {
    const mine = routines.filter((r) => routineIds.includes(r.id));
    const holding = mine.filter((r) => has(r, exerciseId));
    if (holding.length) {
      return {
        exerciseId,
        options,
        routines: holding.map(named),
        line: lineIn(holding[0], exerciseId),
        applied: null,
      };
    }
    const applied = options.find((o) => mine.some((r) => has(r, o))) ?? null;
    const swapped = applied ? mine.filter((r) => has(r, applied)) : mine;
    return {
      exerciseId,
      options,
      routines: swapped.map(named),
      line: applied && swapped.length ? lineIn(swapped[0], applied) : null,
      applied,
    };
  });
  let status: SwapStatus = 'applied';
  if (swaps.some((s) => !s.line)) status = 'stale';
  else if (swaps.every((s) => !s.applied)) status = 'ready';
  return { status, swaps };
}

/** The workouts of all swaps, each once, in plan order. */
export function swapRoutineNames(swaps: SwapView[], routines: SwapRoutine[]) {
  const ids = new Set(swaps.flatMap((s) => s.routines.map((r) => r.id)));
  return routines.filter((r) => ids.has(r.id)).map((r) => r.name);
}
