import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { IconButton } from '@/shared/ui/icon-button';
import { Text } from '@/shared/ui/text';

import type { Meal, MealEntry } from '../data/meal-entries';
import { formatKcal, KCAL } from '../lib/format';
import { MealRow } from './meal-row';
import { Overline } from './overline';

export interface MealSectionProps {
  meal: Meal;
  entries: MealEntry[];
  onAdd: () => void;
  onOpen: (entry: MealEntry) => void;
  onDelete: (entry: MealEntry) => void;
}

/** One meal of the day: its name, its kcal and a "+", then what was logged for it. */
export function MealSection({ meal, entries, onAdd, onOpen, onDelete }: MealSectionProps) {
  const { t } = useTranslation('meals');
  const title = t(`meal.${meal}`);
  const kcal = entries.reduce((sum, e) => sum + e.kcal, 0);
  return (
    <View className="mt-5">
      <View className="h-10 flex-row items-center gap-3 pr-4 pl-5">
        <Overline className="min-w-0 flex-1">{title}</Overline>
        {entries.length ? (
          <Text tone="subtle" className="font-inter-medium text-[13px] tabular-nums">
            {`${formatKcal(kcal)} ${KCAL}`}
          </Text>
        ) : null}
        <IconButton
          icon="plus"
          size={32}
          iconSize={11}
          accessibilityLabel={t('addTo', { meal: title })}
          onPress={onAdd}
        />
      </View>
      {entries.map((entry) => (
        <MealRow
          key={entry.id}
          entry={entry}
          onPress={() => onOpen(entry)}
          onDelete={() => onDelete(entry)}
        />
      ))}
    </View>
  );
}
