import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View, type ViewToken } from 'react-native';

import { AlphabetRail } from '@/features/exercises/components/alphabet-rail';
import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import {
  type ExerciseOption,
  useExerciseSearch,
} from '@/features/exercises/hooks/use-exercise-search';
import { isBodyweight } from '@/shared/data/exercises';
import { useUnits } from '@/shared/data/profile';
import { formatSet, formatShortDate, type SetValues, type UnitSystem } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { type ExerciseRecord, useExerciseRecords } from '../data/exercise-records';

const ROW_HEIGHT = 78;
const ANCHOR_HEIGHT = 41;

interface Row extends ExerciseOption {
  /** "Zuletzt trainiert" above the first trained row, the letter above the first of a letter. */
  heading: string | null;
  record: ExerciseRecord | undefined;
}

const rowHeight = (row: Row | undefined) => ROW_HEIGHT + (row?.heading ? ANCHOR_HEIGHT : 0);

/** "100 kg × 5"; bodyweight exercises show added weight as "+10 kg × 8", none as "12 Wdh.". */
function formatRecord(exerciseId: string, best: SetValues, units: UnitSystem) {
  if (!isBodyweight(exerciseId) || best.weightKg == null) return formatSet(best, units);
  if (best.weightKg === 0) return formatSet({ ...best, weightKg: null }, units);
  return `+${formatSet(best, units)}`;
}

export interface ExerciseResultsProps {
  query: string;
  /** Height of the search bar over the foot of the list, so the last rows clear it. */
  bottomInset: number;
}

/**
 * The exercises matching the search: the trained ones first, last done on top, with their
 * heaviest set (★); then the others A–Z with the letter index. A tap opens the exercise, on its
 * history when it has one.
 */
export function ExerciseResults({ query, bottomInset }: ExerciseResultsProps) {
  const { t } = useTranslation(['exercises', 'common']);
  const units = useUnits();
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const listRef = useRef<FlatList<Row>>(null);
  const options = useExerciseSearch(query);
  const { data: records } = useExerciseRecords();

  const trained = options
    .filter((o) => records?.has(o.id))
    .map((o) => ({ ...o, record: records?.get(o.id) }))
    .sort((a, b) => (b.record?.lastAt ?? '').localeCompare(a.record?.lastAt ?? ''));
  const rest = options.filter((o) => !records?.has(o.id));
  const rows: Row[] = [
    ...trained.map((o, i) => ({ ...o, heading: i === 0 ? t('common:search.recent') : null })),
    ...rest.map((o, i) => ({
      ...o,
      record: undefined,
      heading: i === 0 || rest[i - 1].letter !== o.letter ? o.letter : null,
    })),
  ];
  const offsets = rows.reduce<number[]>((acc, row, i) => {
    acc.push((acc[i - 1] ?? 0) + (i ? rowHeight(rows[i - 1]) : 0));
    return acc;
  }, []);
  // The index covers the A–Z part below the trained exercises.
  const letters = new Set(rest.map((r) => r.letter));
  const bottom = bottomInset + 16;

  // FlatList requires a callback that never changes identity.
  const [onViewable] = useState(() => ({ viewableItems }: { viewableItems: ViewToken<Row>[] }) => {
    const first = viewableItems[0]?.item;
    // The trained exercises on top aren't part of the A–Z index.
    if (first) setActiveLetter(first.record ? null : first.letter);
  });

  function jump(letter: string) {
    const index = rows.findIndex((r, i) => i >= trained.length && r.letter >= letter);
    const target = index < 0 ? rows.length - 1 : index;
    if (target < 0) return;
    setActiveLetter(rows[target].letter);
    listRef.current?.scrollToIndex({ index: target, animated: false });
  }

  return (
    <View className="flex-1">
      <View className="flex-1 flex-row px-4">
        <FlatList
          ref={listRef}
          className="flex-1"
          contentContainerClassName="pr-7"
          contentContainerStyle={{ paddingBottom: bottom }}
          data={rows}
          keyExtractor={(r) => r.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
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
          renderItem={({ item }) => (
            <View>
              {item.heading ? (
                <Text variant="overline" tone="subtle" className="pt-4.5 pb-1.5">
                  {item.heading}
                </Text>
              ) : null}
              <PressableScale
                haptic="select"
                activeScale={0.98}
                accessibilityRole="button"
                onPress={() =>
                  // Trained: straight to the history with the records.
                  router.push(
                    item.record
                      ? { pathname: '/exercise/[id]/history', params: { id: item.id } }
                      : { pathname: '/exercise/[id]', params: { id: item.id } },
                  )
                }
                className="h-19.5 flex-row items-center gap-3.5"
              >
                <ExerciseThumb exerciseId={item.id} name={item.name} />
                <View className="min-w-0 flex-1">
                  <Text variant="label" numberOfLines={2} className="leading-5">
                    {item.name}
                  </Text>
                  <Text variant="caption" tone="subtle" className="mt-0.5 font-inter">
                    {t(`groups.${item.group}`)}
                  </Text>
                </View>
                {item.record ? (
                  <View
                    className="items-end"
                    accessible
                    accessibilityLabel={t('common:search.recordA11y', {
                      value: formatRecord(item.id, item.record.best, units),
                      date: formatShortDate(item.record.lastAt),
                    })}
                  >
                    {/* The star marks a personal record, as in the exercise history. */}
                    <View className="flex-row items-center gap-1.5">
                      <Icon name="star" size={13} color={colors.accent} />
                      <Text variant="label">{formatRecord(item.id, item.record.best, units)}</Text>
                    </View>
                    <Text variant="caption" tone="subtle" className="mt-0.5 font-inter">
                      {formatShortDate(item.record.lastAt)}
                    </Text>
                  </View>
                ) : null}
              </PressableScale>
            </View>
          )}
        />
        {rest.length ? (
          <View className="absolute top-2 right-2" style={{ bottom: bottom + 8 }}>
            <AlphabetRail available={letters} active={activeLetter} onJump={jump} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
