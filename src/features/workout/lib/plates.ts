import type { UnitSystem } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';

type Unit = 'kg' | 'lb';

/** A plate as drawn: its height and width in the number pad's drawing, and its colour. */
export interface PlateLook {
  height: number;
  width: number;
  color: string;
}

/** Plates a gym usually has, heaviest first; the heavy ones light, the small ones dark. */
const PLATES: Record<Unit, [number, PlateLook][]> = {
  kg: [
    [25, { height: 44, width: 9, color: colors.fg }],
    [20, { height: 44, width: 8, color: colors.fg }],
    [15, { height: 38, width: 7, color: colors.fg2 }],
    [10, { height: 32, width: 6, color: colors.muted }],
    [5, { height: 25, width: 6, color: colors.subtle }],
    [2.5, { height: 19, width: 5, color: colors.dim }],
    [1.25, { height: 15, width: 4, color: colors.outline }],
  ],
  lb: [
    [45, { height: 44, width: 9, color: colors.fg }],
    [35, { height: 40, width: 8, color: colors.fg2 }],
    [25, { height: 34, width: 7, color: colors.muted }],
    [10, { height: 28, width: 6, color: colors.subtle }],
    [5, { height: 22, width: 5, color: colors.dim }],
    [2.5, { height: 17, width: 4, color: colors.outline }],
  ],
};

/** A bar's usual weight in each unit: a 45 lb bar is not a 20 kg one converted. */
type BarWeight = Record<Unit, number>;

const BARBELL: BarWeight = { kg: 20, lb: 45 };

/** How an exercise is loaded with plates. */
export interface PlateSetup {
  /** 2: both ends of a bar or both sides of a machine; 1: one end (landmine, T-bar, one horn). */
  sides: 1 | 2;
  /** What the plates go on: a bar, or a machine's sled. */
  carrier: 'bar' | 'sled';
  /** The bar's weight until the user changes it. */
  start: BarWeight;
  /** Starts without a bar: machines, the Smith machine and one-end lifts count the plates only. */
  startOff: boolean;
}

const barbell: PlateSetup = { sides: 2, carrier: 'bar', start: BARBELL, startOff: false };
const bar = (start: BarWeight): PlateSetup => ({ ...barbell, start });
const without = (sides: 1 | 2, carrier: 'bar' | 'sled'): PlateSetup => ({
  sides,
  carrier,
  start: BARBELL,
  startOff: true,
});

/** Catalog exercises loaded differently from a plain barbell, by id. */
const SETUPS: Record<string, PlateSetup> = {
  'ez-bar-curl': bar({ kg: 10, lb: 25 }),
  'trap-bar-deadlift': bar({ kg: 25, lb: 55 }),
  'safety-bar-squat': bar({ kg: 30, lb: 65 }),
  'smith-bench-press': without(2, 'bar'),
  'smith-close-grip-bench-press': without(2, 'bar'),
  'smith-incline-bench-press': without(2, 'bar'),
  'smith-shoulder-press': without(2, 'bar'),
  'smith-lunge': without(2, 'bar'),
  'smith-squat': without(2, 'bar'),
  'smith-calf-raise': without(2, 'bar'),
  'leg-press': without(2, 'sled'),
  'single-leg-press': without(2, 'sled'),
  'leg-press-calf-raise': without(2, 'sled'),
  'hack-squat': without(2, 'sled'),
  'reverse-hack-squat': without(2, 'sled'),
  'pendulum-squat': without(2, 'sled'),
  'landmine-press': without(1, 'bar'),
  't-bar-row': without(1, 'bar'),
  'meadows-row': without(1, 'bar'),
  'chest-supported-t-bar-row': without(1, 'sled'),
  'seated-calf-raise': without(1, 'sled'),
  'reverse-hyperextension': without(1, 'sled'),
  'belt-squat': without(1, 'sled'),
};

/** How an exercise is loaded with plates; null when it isn't (dumbbells, cables, stacks, own). */
export const plateSetup = (exerciseId: string, equipment: string | null): PlateSetup | null =>
  SETUPS[exerciseId] ?? (equipment === 'barbell' ? barbell : null);

/** Steps of the bar's weight in the plates sheet. */
export const BAR_STEP: Record<Unit, number> = { kg: 0.5, lb: 1 };

export const plateUnit = (units: UnitSystem): Unit => (units === 'imperial' ? 'lb' : 'kg');

export const plateLook = (weight: number, unit: Unit) =>
  PLATES[unit].find(([w]) => w === weight)?.[1] ?? PLATES[unit][PLATES[unit].length - 1][1];

/** One kind of plate on a side of the bar (or on its one loaded end). */
export interface PlateCount {
  weight: number;
  count: number;
}

export type BarLoad =
  | { kind: 'empty' }
  | { kind: 'below' }
  | {
      kind: 'loaded';
      /** Per side (or on the one end), heaviest first; none when the bar alone is the weight. */
      plates: PlateCount[];
      /** What the bar weighs as loaded: below the weight when the plates don't add up to it. */
      loaded: number;
      exact: boolean;
    };

/**
 * The plates per side for a weight (in the user's unit) on a bar, heaviest first; with one side,
 * all of them on the one end. A weight the plates can't make exactly gets the nearest load below.
 */
export function loadBar(weight: number | null, bar: number, unit: Unit, sides: 1 | 2): BarLoad {
  if (weight == null || weight <= 0) return { kind: 'empty' };
  if (weight < bar) return { kind: 'below' };
  let side = (weight - bar) / sides;
  const plates: PlateCount[] = [];
  for (const [plate] of PLATES[unit]) {
    const count = Math.floor(side / plate + 1e-9);
    if (count > 0) {
      plates.push({ weight: plate, count });
      side -= count * plate;
    }
  }
  const loaded = bar + sides * plates.reduce((sum, p) => sum + p.weight * p.count, 0);
  return { kind: 'loaded', plates, loaded, exact: Math.abs(loaded - weight) < 1e-6 };
}
