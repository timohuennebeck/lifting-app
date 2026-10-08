import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import { useExerciseSearch } from '../hooks/use-exercise-search';

export interface ExercisePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exerciseId: string) => void;
  /** Already used exercises are shown with a check and can't be picked again. */
  excludeIds?: string[];
  title?: string;
}

/** Searchable exercise list in a bottom sheet; used to add or swap exercises. */
export function ExercisePickerSheet({
  visible,
  onClose,
  onSelect,
  excludeIds = [],
  title,
}: ExercisePickerSheetProps) {
  const { t } = useTranslation('exercises');
  const [query, setQuery] = useState('');
  const options = useExerciseSearch(query);

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={title ?? t('picker.title')}
      className="h-[85%]"
    >
      <TextField
        value={query}
        onChangeText={setQuery}
        placeholder={t('picker.search')}
        clearable
        autoCorrect={false}
        returnKeyType="search"
      />
      <FlatList
        className="mt-3"
        data={options}
        keyExtractor={(o) => o.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const used = excludeIds.includes(item.id);
          return (
            <PressableScale
              haptic="select"
              disabled={used}
              onPress={() => {
                onSelect(item.id);
                setQuery('');
              }}
              className="flex-row items-center gap-3 py-3"
            >
              <View className="flex-1 gap-0.5">
                <Text variant="label" className={used ? 'opacity-45' : undefined}>
                  {item.name}
                </Text>
                <Text variant="caption" tone="subtle" className="font-inter">
                  {item.primaryMuscle}
                </Text>
              </View>
              <Icon name={used ? 'check' : 'plus'} size={12} color={colors.subtle} />
            </PressableScale>
          );
        }}
      />
    </Sheet>
  );
}
