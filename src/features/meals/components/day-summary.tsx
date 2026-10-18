import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Text } from '@/shared/ui/text';

import type { DayTotals } from '../data/meal-entries';
import { formatGrams, formatKcal, GRAMS, KCAL } from '../lib/format';
import { gramsOf, type Macro, MACROS, macroShares } from '../lib/intake';
import { Overline } from './overline';

/** Protein in the accent (what a lifter watches), carbs and fat in two greys. */
export const MACRO_COLORS: Record<Macro, string> = {
  protein: colors.accent,
  carbs: colors.fgMid,
  fat: colors.dim,
};

export interface DaySummaryProps {
  totals: DayTotals;
}

/** A day's calories, and its protein, carbs and fat as one bar by their calories and in grams. */
export function DaySummary({ totals }: DaySummaryProps) {
  const { t } = useTranslation('meals');
  const shares = macroShares(totals);
  return (
    <View className="px-5">
      <Overline tone="muted">{t('day.calories')}</Overline>
      <View className="mt-1 flex-row items-baseline gap-1.5">
        <Text
          className="font-inter-semibold text-[56px] leading-[58px] tracking-[-1.5px] tabular-nums"
          accessibilityLiveRegion="polite"
        >
          {formatKcal(totals.kcal)}
        </Text>
        <Text tone="muted" className="font-inter-semibold text-lg">
          {KCAL}
        </Text>
      </View>
      <View className="mt-4 h-2 flex-row gap-0.5 overflow-hidden rounded-full bg-surface">
        {shares
          ? MACROS.filter((macro) => shares[macro] > 0).map((macro) => (
              <View
                key={macro}
                className="h-full rounded-full"
                style={{ flex: shares[macro], backgroundColor: MACRO_COLORS[macro] }}
              />
            ))
          : null}
      </View>
      <View className="mt-3 flex-row gap-7">
        {MACROS.map((macro) => {
          const grams = gramsOf(totals, macro);
          return (
            <View key={macro} className="gap-0.5">
              <View className="flex-row items-center gap-1.5">
                <View
                  className="size-2 rounded-full"
                  style={{ backgroundColor: MACRO_COLORS[macro] }}
                />
                <Text variant="caption" tone="subtle" numberOfLines={1}>
                  {t(`macros.${macro}`)}
                </Text>
              </View>
              <Text variant="label" className="tabular-nums">
                {grams === null ? '–' : `${formatGrams(grams)} ${GRAMS}`}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
