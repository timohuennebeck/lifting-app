import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseSearchBar } from '@/features/exercises/components/exercise-search-bar';
import { canShowRanksFor } from '@/features/muscles/lib/level-exercise';
import { useRankLiftStore } from '@/features/muscles/stores/rank-lift-store';
import { useCatalogStore } from '@/shared/data/exercises';
import { IconButton } from '@/shared/ui/icon-button';
import { MUSCLE_IDS, type MuscleId } from '@/shared/ui/muscle-map';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import { ExerciseResults } from '../components/exercise-results';

/**
 * Search from the top bar of every tab: before typing it lists the recently trained exercises
 * with their records, then all others; the field sits at the bottom and is focused on arrival.
 * Laid out like the exercise picker, plus included (a custom exercise), without picking. A
 * Level card opens it for a `muscle`: its exercises first, in its muscle group. The ranks screen
 * opens it to pick its lift (`pick=rank`, the shown one `selected`): only exercises ranks can be
 * shown for, a tap picks.
 */
export function SearchScreen() {
  const { t } = useTranslation(['common', 'exercises']);
  const params = useLocalSearchParams<{ muscle?: string; pick?: string; selected?: string }>();
  const muscle = MUSCLE_IDS.find((m): m is MuscleId => m === params.muscle) ?? null;
  const pickRank = params.pick === 'rank';
  const rows = useCatalogStore((s) => s.rows);
  const chooseRankLift = useRankLiftStore((s) => s.choose);
  const [query, setQuery] = useState('');
  const [barHeight, setBarHeight] = useState(0);

  const pick = pickRank
    ? {
        selectedId: params.selected ?? null,
        allows: (id: string) => canShowRanksFor(id, rows),
        onPick: (id: string) => {
          chooseRankLift(id);
          router.back();
        },
      }
    : undefined;

  return (
    <Screen
      header={
        <ScreenHeader
          title={t(pickRank ? 'search.pickRank' : 'search.title')}
          action={
            pickRank ? undefined : (
              <IconButton
                icon="plus"
                accessibilityLabel={t('exercises:custom.create')}
                onPress={() => router.push('/custom-exercise/new')}
              />
            )
          }
        />
      }
    >
      <View className="flex-1 px-4 pt-2">
        <ExerciseResults query={query} bottomInset={barHeight} muscle={muscle} pick={pick} />
      </View>
      <ExerciseSearchBar query={query} onChangeQuery={setQuery} onHeight={setBarHeight} />
    </Screen>
  );
}
