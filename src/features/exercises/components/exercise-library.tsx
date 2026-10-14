import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';

import { ExerciseIndexList } from './exercise-index-list';
import { ExerciseIndexRow } from './exercise-index-row';

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

/** The picker's list: the picked exercises first under "Selected", then the others A–Z. */
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
  return (
    <ExerciseIndexList
      query={query}
      bottomInset={bottomInset}
      split={(options) => ({
        first: options.filter((o) => selectedIds.includes(o.id)),
        title: t('picker.selected'),
        rest: options.filter((o) => !selectedIds.includes(o.id)),
      })}
      renderRow={(item) => {
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
  );
}
