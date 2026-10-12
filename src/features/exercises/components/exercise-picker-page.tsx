import { router } from 'expo-router';
import { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useUserId } from '@/shared/stores/session-store';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import { useCreatedExerciseStore } from '../stores/created-exercise-store';
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
 * one (a new pick replaces the last). The search field is focused on arrival. Signed in, the plus
 * creates a custom exercise, which comes back picked.
 */
export function ExercisePickerPage({ title, mode, exerciseIds, onDone }: ExercisePickerPageProps) {
  const { t } = useTranslation('exercises');
  // Onboarding plans are built before sign-up, where there is no account to save one to.
  const signedIn = !!useUserId();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [barHeight, setBarHeight] = useState(0);

  const pick = (exerciseId: string) => {
    setPicked((current) => (mode === 'swap' ? [exerciseId] : [...current, exerciseId]));
    setQuery('');
  };

  // A custom exercise made with the plus comes back picked.
  const pickCreated = useEffectEvent(pick);
  useEffect(
    () =>
      useCreatedExerciseStore.subscribe(({ id }) => {
        if (!id) return;
        useCreatedExerciseStore.setState({ id: null });
        pickCreated(id);
      }),
    [],
  );

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
    <Screen
      header={
        <ScreenHeader
          title={title}
          action={
            signedIn ? (
              <IconButton
                icon="plus"
                accessibilityLabel={t('custom.create')}
                onPress={() => router.push('/custom-exercise/new')}
              />
            ) : undefined
          }
        />
      }
    >
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
