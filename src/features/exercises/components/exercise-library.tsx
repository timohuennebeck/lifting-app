import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View, type ViewToken } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import { type ExerciseOption, useExerciseSearch } from '../hooks/use-exercise-search';
import type { MuscleGroupId } from '../lib/muscle-groups';
import { AlphabetRail } from './alphabet-rail';
import { ExerciseThumb } from './exercise-thumb';
import { MuscleGroupFilter } from './muscle-group-filter';

const ROW_HEIGHT = 78;
const ANCHOR_HEIGHT = 41;

export interface ExerciseLibraryProps {
  query: string;
  /** Listed first under "Selected", with a check. */
  selectedIds: string[];
  /** Selected rows the user picked here: tapping one unpicks it. The others can't be tapped. */
  removableIds?: string[];
  /** Row icon: plus when adding, arrows when swapping an exercise. */
  mode: 'add' | 'swap';
  onPick: (exerciseId: string) => void;
  onUnpick?: (exerciseId: string) => void;
  /** Horizontal padding of the page, for the full-width filter row. */
  inset?: number;
  /** Height of what covers the foot of the list (the search bar), so the last rows clear it. */
  bottomInset?: number;
}

interface Row extends ExerciseOption {
  /** Heading above the row: its letter, the "Selected" title, or none. */
  heading: string | null;
  selected: boolean;
}

/** Exercise library (design 06c): muscle group boxes, A–Z list with index. */
export function ExerciseLibrary({
  query,
  selectedIds,
  removableIds = [],
  mode,
  onPick,
  onUnpick,
  inset = 16,
  bottomInset = 0,
}: ExerciseLibraryProps) {
  const { t } = useTranslation('exercises');
  const [group, setGroup] = useState<MuscleGroupId | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const listRef = useRef<FlatList<Row>>(null);
  const options = useExerciseSearch(query, group);

  const selected = options.filter((o) => selectedIds.includes(o.id));
  const free = options.filter((o) => !selectedIds.includes(o.id));
  const rows: Row[] = [
    ...selected.map((o, i) => ({
      ...o,
      letter: '',
      selected: true,
      heading: i === 0 ? t('picker.selected') : null,
    })),
    ...free.map((o, i) => ({
      ...o,
      selected: false,
      heading: i === 0 || free[i - 1].letter !== o.letter ? o.letter : null,
    })),
  ];
  const offsets = rows.reduce<number[]>((acc, row, i) => {
    acc.push((acc[i - 1] ?? 0) + (i ? rowHeight(rows[i - 1]) : 0));
    return acc;
  }, []);
  const letters = new Set(free.map((r) => r.letter));

  // FlatList requires a callback that never changes identity.
  const [onViewable] = useState(() => ({ viewableItems }: { viewableItems: ViewToken<Row>[] }) => {
    const first = viewableItems[0]?.item;
    if (first) setActiveLetter(first.letter);
  });

  function jump(letter: string) {
    const index = rows.findIndex((r) => !r.selected && r.letter >= letter);
    const target = index < 0 ? rows.length - 1 : index;
    if (target < 0) return;
    setActiveLetter(rows[target].letter);
    listRef.current?.scrollToIndex({ index: target, animated: false });
  }

  return (
    <View className="flex-1">
      <MuscleGroupFilter value={group} onChange={setGroup} inset={inset} />
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
          getItemLayout={(_, index) => ({
            length: rowHeight(rows[index]),
            offset: offsets[index] ?? 0,
            index,
          })}
          onViewableItemsChanged={onViewable}
          ListEmptyComponent={
            <Text variant="label" tone="subtle" className="py-10 text-center font-inter">
              {t('picker.empty')}
            </Text>
          }
          renderItem={({ item }) => {
            const removable = item.selected && removableIds.includes(item.id);
            // Selected rows that came with the training stay dimmed and can't be tapped.
            const locked = item.selected && !removable;
            return (
              <View>
                {item.heading ? (
                  <Text variant="overline" tone="subtle" className="pt-4.5 pb-1.5">
                    {item.heading}
                  </Text>
                ) : null}
                <PressableScale
                  haptic="select"
                  disabled={locked}
                  accessibilityState={{ disabled: locked, selected: item.selected }}
                  onPress={() => (item.selected ? onUnpick?.(item.id) : onPick(item.id))}
                  className="h-19.5 flex-row items-center gap-3.5"
                >
                  <ExerciseThumb
                    exerciseId={item.id}
                    name={item.name}
                    className={locked ? 'opacity-45' : undefined}
                  />
                  <View className={cn('min-w-0 flex-1', locked && 'opacity-45')}>
                    <Text variant="label" numberOfLines={2} className="leading-5">
                      {item.name}
                    </Text>
                    <Text variant="caption" tone="subtle" className="mt-0.5 font-inter">
                      {t(`groups.${item.group}`)}
                    </Text>
                  </View>
                  <View
                    className="size-8 items-center justify-center rounded-full bg-elevated"
                    style={
                      item.selected
                        ? { backgroundColor: removable ? colors.accent : `${colors.accent}29` }
                        : undefined
                    }
                  >
                    {item.selected ? (
                      <Icon
                        name="check"
                        size={13}
                        color={removable ? colors.onAccent : colors.accent}
                      />
                    ) : (
                      <Icon name={mode === 'swap' ? 'swap' : 'plus'} size={12} />
                    )}
                  </View>
                </PressableScale>
              </View>
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

function rowHeight(row: Row | undefined) {
  return ROW_HEIGHT + (row?.heading ? ANCHOR_HEIGHT : 0);
}

export interface ExerciseSearchBarProps {
  query: string;
  onChangeQuery: (query: string) => void;
  onDone: () => void;
  doneDisabled?: boolean;
  autoFocus?: boolean;
}

/** Search field with the "Done" button, pinned under the library. */
export function ExerciseSearchBar({
  query,
  onChangeQuery,
  onDone,
  doneDisabled,
  autoFocus,
}: ExerciseSearchBarProps) {
  const { t } = useTranslation('exercises');
  return (
    <View className="flex-row items-center gap-2">
      <TextField
        icon="search"
        clearable
        value={query}
        onChangeText={onChangeQuery}
        placeholder={t('picker.search')}
        autoCorrect={false}
        returnKeyType="search"
        autoFocus={autoFocus}
        className="flex-1"
      />
      <Button label={t('picker.done')} size="sm" disabled={doneDisabled} onPress={onDone} />
    </View>
  );
}
