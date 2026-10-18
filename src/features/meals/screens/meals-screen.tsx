import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToday } from '@/shared/hooks/use-today';
import { cn } from '@/shared/lib/cn';
import { toIsoDate } from '@/shared/lib/date';
import { colors } from '@/shared/lib/theme';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { RangeTabs } from '@/shared/ui/range-tabs';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { AverageRow } from '../components/average-row';
import { DaySummary } from '../components/day-summary';
import { IntakeChart } from '../components/intake-chart';
import { MealSection } from '../components/meal-section';
import { Overline } from '../components/overline';
import { deleteMealEntry, type Meal, MEALS, useDayTotals, useMealsOn } from '../data/meal-entries';
import { useRelativeDayLabel } from '../hooks/use-relative-day-label';
import { formatKcal, KCAL } from '../lib/format';
import { averageOver, byMeal, mealAt, shiftDay, totalsOf, withAverage } from '../lib/intake';

/** The chart's ranges in days. */
const CHART_RANGES = [7, 14, 30, 90] as const;
type ChartRange = (typeof CHART_RANGES)[number];

/** Spans of the "Ø pro Tag" rows, in days. */
const AVERAGE_PERIODS = [7, 14, 30, 90];

/** A new meal on a day; the header's "+" guesses the meal from the time. */
const openNew = (date: string, meal: Meal) =>
  router.push({ pathname: '/meals/new', params: { date, meal } });
const openEntry = (id: string) => router.push({ pathname: '/meals/[id]', params: { id } });

/**
 * The meal log: a day's calories and macros and its meals, each with a "+" (‹ › and the date
 * chip move between days), then the calories over time as on the weight history: each day and
 * its 7-day average, and the average day over the last weeks.
 */
export function MealsScreen() {
  const { t } = useTranslation(['meals', 'common']);
  const insets = useSafeAreaInsets();
  const relativeDay = useRelativeDayLabel();
  const today = toIsoDate(new Date(useToday()));
  // The day shown; null follows today, also past midnight.
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const day = pickedDay ?? today;
  const { meals } = useMealsOn(day);
  const { days, isLoading } = useDayTotals();
  const points = useMemo(() => withAverage(days, today), [days, today]);
  const [range, setRange] = useState<ChartRange>(30);
  // The day picked on the chart, so a new day logged doesn't move it.
  const [chartDate, setChartDate] = useState<string | null>(null);

  const totals = totalsOf(day, meals);
  const groups = byMeal(meals);
  const goTo = (date: string) => setPickedDay(date >= today ? null : date);

  const from = shiftDay(today, 1 - range);
  const visible = useMemo(
    () => points.filter((p) => p.date >= from && p.date <= today),
    [points, from, today],
  );
  const pickedIndex = visible.findIndex((p) => p.date === chartDate);
  // A picked day that was emptied, or left the range, falls back to the latest.
  const selected = pickedIndex >= 0 ? pickedIndex : null;
  const shown = (selected === null ? undefined : visible[selected]) ?? visible.at(-1);
  const averages = useMemo(
    () => AVERAGE_PERIODS.flatMap((span) => averageOver(points, today, span) ?? []),
    [points, today],
  );

  const changeRange = (next: ChartRange) => {
    setRange(next);
    setChartDate(null);
  };

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <ScreenHeader
        title={t('title')}
        action={
          <IconButton
            icon="plus"
            accessibilityLabel={t('add')}
            color={colors.onAccent}
            className="bg-accent"
            onPress={() => openNew(day, mealAt(new Date()))}
          />
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <View className="mt-3 flex-row items-center justify-center gap-3 px-4">
          <IconButton
            icon="chevron-left"
            size={36}
            haptic="select"
            accessibilityLabel={t('previousDay')}
            onPress={() => goTo(shiftDay(day, -1))}
          />
          <PressableScale
            haptic="tap"
            disabled={day === today}
            accessibilityLabel={day === today ? undefined : t('backToToday')}
            onPress={() => setPickedDay(null)}
            className="h-9 min-w-36 items-center justify-center rounded-full border border-[#333333] px-3"
          >
            <Text className="relative top-px font-inter-semibold text-sm">{relativeDay(day)}</Text>
          </PressableScale>
          <IconButton
            icon="chevron-right"
            size={36}
            iconSize={7}
            haptic="select"
            disabled={day === today}
            accessibilityLabel={t('nextDay')}
            className={cn(day === today && 'opacity-35')}
            onPress={() => goTo(shiftDay(day, 1))}
          />
        </View>

        <View className="mt-6">
          <DaySummary totals={totals} />
        </View>
        {MEALS.map((m) => (
          <MealSection
            key={m}
            meal={m}
            entries={groups[m]}
            onAdd={() => openNew(day, m)}
            onOpen={(entry) => openEntry(entry.id)}
            onDelete={(entry) => void deleteMealEntry(entry.id)}
          />
        ))}

        <Overline className="mt-11 px-5">{t('trend.title')}</Overline>
        {points.length ? (
          <>
            <View className="mt-4 flex-row gap-3 px-5">
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <View className="h-0.75 w-3.5 rounded-full bg-accent" />
                  <Overline tone="muted">{t('trend.average')}</Overline>
                </View>
                <View className="mt-0.75 flex-row items-baseline gap-1">
                  <Text
                    tone="accent"
                    className="font-inter-semibold text-[41px] leading-11 tabular-nums"
                  >
                    {shown ? formatKcal(shown.averageKcal) : '–'}
                  </Text>
                  <Text tone="muted" className="font-inter-semibold text-base">
                    {KCAL}
                  </Text>
                </View>
              </View>
              <View className="flex-1">
                <Overline tone="muted">{t('trend.day')}</Overline>
                <View className="mt-0.75 flex-row items-baseline gap-1">
                  <Text className="font-inter-semibold text-[41px] leading-11 tabular-nums">
                    {shown ? formatKcal(shown.kcal) : '–'}
                  </Text>
                  <Text tone="muted" className="font-inter-semibold text-base">
                    {KCAL}
                  </Text>
                </View>
              </View>
            </View>
            <Text className="mt-2 h-5 px-5 font-inter-semibold text-[15px] leading-5">
              {shown ? relativeDay(shown.date) : ''}
            </Text>
            <View className="mt-2.25">
              <IntakeChart
                points={visible}
                from={from}
                to={today}
                selected={selected}
                onSelect={(index) => setChartDate(visible[index]?.date ?? null)}
              />
            </View>
            <RangeTabs
              ranges={CHART_RANGES}
              value={range}
              onChange={changeRange}
              className="mx-4 mt-5"
            />
            {averages.length ? (
              <>
                <Overline className="mt-8.75 mb-1.5 px-5">{t('trend.averages')}</Overline>
                {averages.map((average) => (
                  <AverageRow key={average.days} average={average} />
                ))}
              </>
            ) : null}
          </>
        ) : isLoading ? null : (
          <Text variant="paragraph" tone="subtle" className="mt-3 px-5">
            {t('trend.empty')}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
