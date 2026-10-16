import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';

import { Text } from '@/shared/ui/text';

import { type ExerciseOption, useExerciseSearch } from '../hooks/use-exercise-search';
import { type IndexedRow, useLetterIndex } from '../hooks/use-letter-index';
import type { MuscleGroupId } from '../lib/muscle-groups';
import { AlphabetRail } from './alphabet-rail';
import { MuscleGroupFilter } from './muscle-group-filter';

export interface ExerciseIndexListProps<T extends ExerciseOption> {
  query: string;
  /**
   * Of the exercises matching the search and the muscle group: those listed first under `title`,
   * and the rest, A–Z with the letter index.
   */
  split: (options: ExerciseOption[]) => { first: T[]; title: string; rest: T[] };
  /** A row, usually an `ExerciseIndexRow`: the list is laid out with its height. */
  renderRow: (row: IndexedRow<T>) => ReactElement;
  /** Height of what covers the foot of the list (the search bar), so the last rows clear it. */
  bottomInset: number;
  /** The muscle group picked when the list opens, e.g. from a Level card. */
  initialGroup?: MuscleGroupId | null;
}

/**
 * The exercise list of the picker and the search (design 06c): muscle group boxes on top, the
 * exercises below with the A–Z index at the side.
 */
export function ExerciseIndexList<T extends ExerciseOption>({
  query,
  split,
  renderRow,
  bottomInset,
  initialGroup = null,
}: ExerciseIndexListProps<T>) {
  const { t } = useTranslation('exercises');
  const [group, setGroup] = useState<MuscleGroupId | null>(initialGroup);
  const options = useExerciseSearch(query, group);
  const { first, title, rest } = split(options);
  const { listRef, rows, letters, activeLetter, jump, onViewableItemsChanged, getItemLayout } =
    useLetterIndex(first, title, rest);

  return (
    <View className="flex-1">
      <MuscleGroupFilter value={group} onChange={setGroup} />
      <View className="mt-1 flex-1 flex-row">
        <FlatList
          ref={listRef}
          className="flex-1"
          contentContainerClassName="pr-7"
          contentContainerStyle={{ paddingBottom: bottomInset + 16 }}
          data={rows}
          keyExtractor={(r) => r.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          getItemLayout={getItemLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          // About 300 rows: a few screens' worth mounted, not the default 21.
          initialNumToRender={12}
          maxToRenderPerBatch={8}
          windowSize={7}
          ListEmptyComponent={
            <Text variant="label" tone="subtle" className="py-10 text-center font-inter">
              {t('picker.empty')}
            </Text>
          }
          renderItem={({ item }) => renderRow(item)}
        />
        {rest.length ? (
          <View className="absolute top-2 -right-2" style={{ bottom: bottomInset + 8 }}>
            <AlphabetRail available={letters} active={activeLetter} onJump={jump} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
