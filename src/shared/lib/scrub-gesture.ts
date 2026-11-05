import { Gesture } from 'react-native-gesture-handler';

import { haptics } from './haptics';

export interface ScrubOptions {
  /** What lies under the finger: an index, or null for nothing. */
  indexAt: (x: number, y: number) => number | null;
  /** The index picked now. */
  picked: number | null;
  /** Gets each new index under the finger, with a tick; null as the finger lifts, unless `keep`. */
  onPick: (index: number | null) => void;
  /** Reads only once the finger rested this long (ms), so a quicker one scrolls; else at once. */
  holdMs?: number;
  /** The pick stays when the finger lifts. */
  keep?: boolean;
}

/**
 * A finger on a chart reads the data under it as it moves (the weight, exercise and coach charts).
 * Returns the pan, for any further settings.
 */
export function scrubGesture({ indexAt, picked, onPick, holdMs, keep = false }: ScrubOptions) {
  const move = (x: number, y: number) => {
    const next = indexAt(x, y);
    if (next === picked) return;
    if (next !== null) haptics.select();
    onPick(next);
  };
  const pan = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => move(e.x, e.y));
  if (!keep) pan.onFinalize(() => onPick(null));
  return holdMs
    ? pan.activateAfterLongPress(holdMs).onStart((e) => move(e.x, e.y))
    : pan.minDistance(0).onBegin((e) => move(e.x, e.y));
}
