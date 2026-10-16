import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FlatList, ViewToken } from 'react-native';

import { indexLetters } from '../lib/index-letters';

import type { ExerciseOption } from './use-exercise-search';

/** Heights of an ExerciseIndexRow (`h-19.5`) and of its heading (overline, `pt-4.5 pb-1.5`). */
const ROW_HEIGHT = 78;
const HEADING_HEIGHT = 41;

export type IndexedRow<T extends ExerciseOption> = T & {
  /** Heading above the row: the pinned rows' title, its letter, or none. */
  heading: string | null;
  /** Listed first under the title, outside the index. */
  pinned: boolean;
};

/**
 * Rows by their exercise option (stable while the language and exercises are) and placement, so
 * a row keeps its object and the list only re-renders the rows a keystroke changed.
 */
const rowCache = new WeakMap<ExerciseOption, Map<string, IndexedRow<ExerciseOption>>>();

function rowOf<T extends ExerciseOption>(option: T, pinned: boolean, heading: string | null) {
  let rows = rowCache.get(option);
  if (!rows) {
    rows = new Map();
    rowCache.set(option, rows);
  }
  const key = `${pinned}:${heading ?? ''}`;
  let row = rows.get(key);
  if (!row) {
    row = { ...option, pinned, heading };
    rows.set(key, row);
  }
  return row as IndexedRow<T>;
}

const rowHeight = (row: IndexedRow<ExerciseOption> | undefined) =>
  ROW_HEIGHT + (row?.heading ? HEADING_HEIGHT : 0);

/**
 * Rows and scroll wiring of an exercise list with the letter index: `pinned` first under
 * `title`, then `rest` under their letters. The rows have fixed heights, so the index jumps
 * straight to any of them.
 */
export function useLetterIndex<T extends ExerciseOption>(pinned: T[], title: string, rest: T[]) {
  const { i18n } = useTranslation();
  const listRef = useRef<FlatList<IndexedRow<T>>>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const rows: IndexedRow<T>[] = [
    ...pinned.map((o, i) => rowOf(o, true, i === 0 ? title : null)),
    ...rest.map((o, i) =>
      rowOf(o, false, i === 0 || rest[i - 1].letter !== o.letter ? o.letter : null),
    ),
  ];
  const offsets = rows.reduce<number[]>((acc, _, i) => {
    acc.push(i ? acc[i - 1] + rowHeight(rows[i - 1]) : 0);
    return acc;
  }, []);

  // FlatList requires a callback that never changes identity.
  const [onViewableItemsChanged] = useState(
    () =>
      ({ viewableItems }: { viewableItems: ViewToken<IndexedRow<T>>[] }) => {
        const first = viewableItems[0]?.item;
        if (first) setActiveLetter(first.pinned ? null : first.letter);
      },
  );

  // The letter's first row, or the next letter's down the index that has rows. Follows the
  // index's order, not the characters': Korean sorts Latin names after Hangul.
  function jump(letter: string) {
    const order = indexLetters(i18n.language);
    const index = order
      .slice(order.indexOf(letter))
      .map((l) => rows.findIndex((r) => !r.pinned && r.letter === l))
      .find((i) => i >= 0);
    const target = index ?? rows.length - 1;
    if (target < 0) return;
    setActiveLetter(rows[target].pinned ? null : rows[target].letter);
    listRef.current?.scrollToIndex({ index: target, animated: false });
  }

  return {
    listRef,
    rows,
    /** Letters that have rows below the pinned ones. */
    letters: new Set(rest.map((r) => r.letter)),
    activeLetter,
    jump,
    onViewableItemsChanged,
    getItemLayout: (_: unknown, index: number) => ({
      length: rowHeight(rows[index]),
      offset: offsets[index] ?? 0,
      index,
    }),
  };
}
