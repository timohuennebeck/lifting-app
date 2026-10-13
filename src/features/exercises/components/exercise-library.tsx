import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

import { useExerciseSearch } from '../hooks/use-exercise-search';
import { useLetterIndex } from '../hooks/use-letter-index';
import type { MuscleGroupId } from '../lib/muscle-groups';
import { AlphabetRail } from './alphabet-rail';
import { ExerciseIndexRow } from './exercise-index-row';
import { MuscleGroupFilter } from './muscle-group-filter';

export interface ExerciseLibraryProps {
  query: string;
  /** Listed first under "Selected", with a check. */
  selectedIds: string[];
  /** Selected rows the user picked here: tapping one unpicks it. The others can't be tapped. */
  removableIds: string[];
  /** Row icon: plus when adding, arrows when swapping an exercise. */
  mode: 'add' | 'swap';
  onPick: (exerciseId: string) => void;
  onUnpick: (exerciseId: string) => void;
  /** Height of what covers the foot of the list (the search bar), so the last rows clear it. */
  bottomInset: number;
}

/** Exercise library (design 06c): muscle group boxes, A–Z list with index. */
export function ExerciseLibrary({
  query,
  selectedIds,
  removableIds,
  mode,
  onPick,
  onUnpick,
  bottomInset,
}: ExerciseLibraryProps) {
  const { t } = useTranslation('exercises');
  const [group, setGroup] = useState<MuscleGroupId | null>(null);
  const options = useExerciseSearch(query, group);
  const { listRef, rows, letters, activeLetter, jump, onViewableItemsChanged, getItemLayout } =
    useLetterIndex(
      options.filter((o) => selectedIds.includes(o.id)),
      t('picker.selected'),
      options.filter((o) => !selectedIds.includes(o.id)),
    );

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
          renderItem={({ item }) => {
            const selected = item.pinned;
            const removable = selected && removableIds.includes(item.id);
            // Selected rows that came with the training stay dimmed and can't be tapped.
            const locked = selected && !removable;
            return (
              <ExerciseIndexRow
                item={item}
                dimmed={locked}
                disabled={locked}
                accessibilityState={{ disabled: locked, selected }}
                onPress={() => (selected ? onUnpick(item.id) : onPick(item.id))}
                trailing={
                  <View
                    className="size-8 items-center justify-center rounded-full bg-elevated"
                    style={
                      selected
                        ? { backgroundColor: removable ? colors.accent : `${colors.accent}29` }
                        : undefined
                    }
                  >
                    {selected ? (
                      <Icon
                        name="check"
                        size={13}
                        color={removable ? colors.onAccent : colors.accent}
                      />
                    ) : (
                      <Icon name={mode === 'swap' ? 'swap' : 'plus'} size={12} />
                    )}
                  </View>
                }
              />
            );
          }}
        />
        {rows.length ? (
          <View className="absolute top-2 -right-2" style={{ bottom: bottomInset + 8 }}>
            <AlphabetRail available={letters} active={activeLetter} onJump={jump} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
