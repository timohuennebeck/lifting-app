import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import { ExerciseLibrary, ExerciseSearchBar } from './exercise-library';

/** Sets an added exercise starts with (counted for the muscle tiles). */
export const NEW_EXERCISE_SETS = 3;

/** An exercise of the training being edited, for the muscle tiles. */
export interface PickerItem {
  /** Its id in the training (workout or template exercise, or an index). */
  key: string;
  exerciseId: string;
  sets: number;
}

export interface ExercisePickerPageProps {
  title: string;
  mode: 'add' | 'swap';
  /** What the training holds now; listed as selected and not pickable. */
  items: PickerItem[];
  /** In swap mode: the entry being replaced (its muscles leave once something is picked). */
  swapKey?: string;
  /** Applies the picks; the page closes once it resolves. Not called without picks. */
  onDone: (picked: string[]) => Promise<void> | void;
}

/**
 * The exercise library as a page (design 06c): picks collect under "Selected" (tap the check to
 * undo) and are applied with "Done"; back discards them. Adding takes several exercises, a swap
 * one (a new pick replaces the last).
 */
export function ExercisePickerPage({
  title,
  mode,
  items,
  swapKey,
  onDone,
}: ExercisePickerPageProps) {
  const footerInset = useFooterInset();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const swap = mode === 'swap';
  const replaced = items.find((item) => item.key === swapKey);

  // What the training works once the picks are applied.
  const muscleItems = [
    ...items.filter((item) => !(swap && picked.length && item === replaced)),
    ...picked.map((exerciseId) => ({
      exerciseId,
      sets: swap ? (replaced?.sets ?? NEW_EXERCISE_SETS) : NEW_EXERCISE_SETS,
    })),
  ];

  const pick = (exerciseId: string) => {
    setPicked((current) => (swap ? [exerciseId] : [...current, exerciseId]));
    setQuery('');
  };

  async function done() {
    if (saving) return;
    if (!picked.length) return router.back();
    setSaving(true);
    try {
      await onDone(picked);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen header={<ScreenHeader title={title} />}>
      <View className="flex-1 px-4 pt-2">
        <ExerciseLibrary
          query={query}
          selectedIds={[...items.map((item) => item.exerciseId), ...picked]}
          removableIds={picked}
          mode={mode}
          muscleItems={muscleItems}
          onPick={pick}
          onUnpick={(id) => setPicked((current) => current.filter((p) => p !== id))}
        />
      </View>
      <KeyboardStickyView offset={{ closed: 0, opened: footerInset - 8 }}>
        <View className="px-4 pt-2" style={{ paddingBottom: footerInset }}>
          <ExerciseSearchBar
            query={query}
            onChangeQuery={setQuery}
            onDone={done}
            doneDisabled={saving}
          />
        </View>
      </KeyboardStickyView>
    </Screen>
  );
}
