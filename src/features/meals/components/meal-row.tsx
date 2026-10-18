import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PressableScale } from '@/shared/ui/pressable-scale';
import { SwipeToDelete } from '@/shared/ui/swipe-to-delete';
import { Text } from '@/shared/ui/text';

import type { MealEntry } from '../data/meal-entries';
import { formatGrams, formatKcal } from '../lib/format';
import { gramsOf, MACROS } from '../lib/intake';

export interface MealRowProps {
  entry: MealEntry;
  onPress: () => void;
  onDelete: () => void;
}

/** A logged meal: its name, the macros given ("P 32 g · C 70 g") and its kcal; swipe to delete. */
export function MealRow({ entry, onPress, onDelete }: MealRowProps) {
  const { t } = useTranslation('meals');
  const macros = MACROS.flatMap((macro) => {
    const grams = gramsOf(entry, macro);
    return grams === null ? [] : [t(`short.${macro}`, { value: formatGrams(grams) })];
  }).join(' · ');
  return (
    <SwipeToDelete label={t('delete', { name: entry.name })} onDelete={onDelete}>
      <PressableScale
        activeScale={0.98}
        onPress={onPress}
        className="h-15.5 flex-row items-center gap-3 bg-bg px-5"
      >
        <View className="min-w-0 flex-1 gap-px pt-0.5">
          <Text className="font-inter-semibold text-[15px] leading-5" numberOfLines={1}>
            {entry.name}
          </Text>
          {macros ? (
            <Text className="font-inter-medium text-xs leading-4 text-subtle" numberOfLines={1}>
              {macros}
            </Text>
          ) : null}
        </View>
        <Text variant="label" className="mt-0.5 tabular-nums">
          {formatKcal(entry.kcal)}
        </Text>
      </PressableScale>
    </SwipeToDelete>
  );
}
