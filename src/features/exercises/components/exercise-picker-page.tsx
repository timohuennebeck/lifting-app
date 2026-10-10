import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import { ExerciseLibrary } from './exercise-library';
import { ExerciseSearchBar } from './exercise-search-bar';

export interface ExercisePickerPageProps {
  title: string;
  mode: 'add' | 'swap';
  /** Exercises the training holds now; listed as selected and not pickable. */
  exerciseIds: string[];
  /** Applies the picks; the page closes once it resolves. Not called without picks. */
  onDone: (picked: string[]) => Promise<void> | void;
}

/**
 * The exercise library as a page (design 06c): picks collect under "Selected" (tap the check to
 * undo) and are applied with "Done"; back discards them. Adding takes several exercises, a swap
 * one (a new pick replaces the last). The search field is focused on arrival.
 */
export function ExercisePickerPage({ title, mode, exerciseIds, onDone }: ExercisePickerPageProps) {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [barHeight, setBarHeight] = useState(0);

  const pick = (exerciseId: string) => {
    setPicked((current) => (mode === 'swap' ? [exerciseId] : [...current, exerciseId]));
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
          selectedIds={[...exerciseIds, ...picked]}
          removableIds={picked}
          mode={mode}
          bottomInset={barHeight}
          onPick={pick}
          onUnpick={(id) => setPicked((current) => current.filter((p) => p !== id))}
        />
      </View>
      <ExerciseSearchBar
        query={query}
        onChangeQuery={setQuery}
        onHeight={setBarHeight}
        onDone={done}
        doneDisabled={saving}
      />
    </Screen>
  );
}
