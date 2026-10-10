import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseSearchBar } from '@/features/exercises/components/exercise-search-bar';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import { ExerciseResults } from '../components/exercise-results';

/**
 * Search from the top bar of every tab: before typing it lists the recently trained exercises
 * with their records, then all others; the field sits at the bottom and is focused on arrival.
 */
export function SearchScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [barHeight, setBarHeight] = useState(0);

  return (
    <Screen header={<ScreenHeader title={t('search.title')} />}>
      <View className="flex-1 pt-2">
        <ExerciseResults query={query} bottomInset={barHeight} />
      </View>
      <ExerciseSearchBar query={query} onChangeQuery={setQuery} onHeight={setBarHeight} />
    </Screen>
  );
}
