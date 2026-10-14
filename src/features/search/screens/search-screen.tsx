import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseSearchBar } from '@/features/exercises/components/exercise-search-bar';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import { ExerciseResults } from '../components/exercise-results';

/**
 * Search from the top bar of every tab: before typing it lists the recently trained exercises
 * with their records, then all others; the field sits at the bottom and is focused on arrival.
 * Laid out like the exercise picker, plus included (a custom exercise), without picking.
 */
export function SearchScreen() {
  const { t } = useTranslation(['common', 'exercises']);
  const [query, setQuery] = useState('');
  const [barHeight, setBarHeight] = useState(0);

  return (
    <Screen
      header={
        <ScreenHeader
          title={t('search.title')}
          action={
            <IconButton
              icon="plus"
              accessibilityLabel={t('exercises:custom.create')}
              onPress={() => router.push('/custom-exercise/new')}
            />
          }
        />
      }
    >
      <View className="flex-1 px-4 pt-2">
        <ExerciseResults query={query} bottomInset={barHeight} />
      </View>
      <ExerciseSearchBar query={query} onChangeQuery={setQuery} onHeight={setBarHeight} />
    </Screen>
  );
}
