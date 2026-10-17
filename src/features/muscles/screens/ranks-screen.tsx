import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCatalogStore, useExerciseName } from '@/shared/data/exercises';
import { useUnits } from '@/shared/data/profile';
import { cn } from '@/shared/lib/cn';
import { formatNumber, toDisplayWeight, weightUnit } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { IconButton } from '@/shared/ui/icon-button';
import { MuscleCircle, type MuscleId } from '@/shared/ui/muscle-map';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { useMuscleLevels } from '../hooks/use-muscle-levels';
import { oneRepMaxFor, overallLevel, TIERS, tierOf } from '../lib/levels';

/** The lift each rank is put in numbers with: the one most people know their best at. */
const EXAMPLE_EXERCISE = 'bench-press';
const SEGMENTS = 20;
/** Muscle circles shown per rank before "+n". */
const CIRCLES = 5;
const CIRCLE = 30;
const CIRCLE_STEP = 21;

/**
 * How many of a rank's segments `level` fills: all once past it (or at 100), none before it, and
 * never all while still in it, so its last level doesn't look like the next rank.
 */
function filled(level: number, from: number, to: number) {
  if (level > to || level >= 100) return SEGMENTS;
  if (level < from) return 0;
  return Math.min(SEGMENTS - 1, Math.round(((level - from + 1) / (to - from + 1)) * SEGMENTS));
}

function Segments({ lit, className }: { lit: number; className?: string }) {
  return (
    <View className={cn('flex-row gap-1', className)}>
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <View
          key={i}
          className={cn('h-full flex-1 rounded-full', i < lit ? 'bg-accent' : 'bg-control')}
        />
      ))}
    </View>
  );
}

/** A rank's muscles as overlapping circles, the strongest in front, then "+n". */
function MuscleRow({ muscles }: { muscles: MuscleId[] }) {
  const { t } = useTranslation('muscles');
  const shown = muscles.slice(0, CIRCLES);
  return (
    <View
      className="flex-row items-center gap-2"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={{ width: CIRCLE + (shown.length - 1) * CIRCLE_STEP, height: CIRCLE }}>
        {shown
          .map((muscle, i) => ({ muscle, left: i * CIRCLE_STEP }))
          .reverse()
          .map(({ muscle, left }) => (
            <MuscleCircle
              key={muscle}
              muscle={muscle}
              accent={colors.accent}
              className="absolute top-0 border-2 border-bg"
              style={{ left, width: CIRCLE, height: CIRCLE }}
            />
          ))}
      </View>
      {muscles.length > CIRCLES ? (
        <Text variant="caption" tone="subtle" className="font-inter-semibold">
          {t('ranks.more', { n: muscles.length - CIRCLES })}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Ränge: the user's rank by the overall level, with the way to the next, then all five ranks
 * with their levels, the bench press each one takes for this user (body weight and sex) and
 * the muscles in it now. "i" explains how levels and ranks are worked out.
 */
export function RanksScreen() {
  const { t, i18n } = useTranslation('muscles');
  const insets = useSafeAreaInsets();
  const units = useUnits();
  const { levels, bodyWeight, sex, isLoading } = useMuscleLevels();
  const standard = useCatalogStore((s) => s.rows[EXAMPLE_EXERCISE]?.strength_standard ?? null);
  const exerciseName = useExerciseName(EXAMPLE_EXERCISE, i18n.language);
  const [info, setInfo] = useState(false);

  const level = Math.floor(overallLevel(levels));
  const index = TIERS.findIndex((r) => r.tier === tierOf(Math.max(level, 1)));
  const current = TIERS[index];
  const next = TIERS[index + 1];

  const weight = (rankLevel: number) => {
    const kg = oneRepMaxFor(rankLevel, standard ?? 0, bodyWeight, sex);
    return formatNumber(Math.round(toDisplayWeight(kg, units)), 0);
  };
  const unit = weightUnit(units);
  const example = (k: number) => {
    if (!standard) return null;
    const rank = TIERS[k];
    const after = TIERS[k + 1];
    const range = !k
      ? t('ranks.upTo', { value: `${weight(after.from)} ${unit}` })
      : !after
        ? t('ranks.over', { value: `${weight(rank.from)} ${unit}` })
        : t('ranks.between', { from: weight(rank.from), to: weight(after.from), unit });
    return t('ranks.forYou', { exercise: exerciseName, range });
  };
  // The muscles whose level lies in each rank, the strongest first.
  const musclesIn = (from: number, to: number) =>
    [...levels]
      .filter(([, l]) => Math.floor(l.value) >= from && Math.floor(l.value) <= to)
      .sort((a, b) => b[1].value - a[1].value)
      .map(([m]) => m);

  return (
    <Screen
      header={
        <ScreenHeader
          title={t('ranks.title')}
          action={
            <IconButton
              icon="info-glyph"
              iconSize={14}
              accessibilityLabel={t('ranks.info')}
              onPress={() => setInfo(true)}
            />
          }
        />
      }
    >
      {isLoading ? null : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          <View className="mx-4 mt-3 gap-3.5 rounded-[18px] bg-surface p-5">
            <Text variant="overline" tone="subtle" className="text-[11px]">
              {t('ranks.yours')}
            </Text>
            <View className="-mt-1.5 flex-row items-end justify-between gap-3">
              <Text
                numberOfLines={1}
                className="shrink font-inter-semibold text-[30px] leading-9 tracking-[-0.5px]"
              >
                {t(`level.tiers.${current.tier}`)}
              </Text>
              <View className="flex-row items-baseline gap-1">
                <Text className="font-inter-semibold text-[48px] leading-[50px] tabular-nums">
                  {level}
                </Text>
                <Text className="font-inter-medium text-lg text-dim">/100</Text>
              </View>
            </View>
            <Segments lit={filled(level, current.from, current.to)} className="h-1.5" />
            <View className="flex-row justify-between gap-3">
              <Text variant="caption" tone="subtle" className="font-inter-medium">
                {t('ranks.levelShort', { level: current.from })}
              </Text>
              <Text variant="caption" tone="subtle" className="font-inter-medium">
                {next
                  ? t('ranks.toNext', {
                      levels: next.from - level,
                      tier: t(`level.tiers.${next.tier}`),
                    })
                  : t('ranks.top')}
              </Text>
            </View>
          </View>

          <Text variant="overline" tone="subtle" className="px-5 pt-8 pb-1 text-[11px]">
            {t('ranks.all')}
          </Text>
          <View className="gap-6 px-5 pt-3">
            {TIERS.map((rank, k) => {
              const reached = level >= rank.from;
              const muscles = reached ? musclesIn(rank.from, rank.to) : [];
              const line = example(k);
              return (
                <View key={rank.tier} className="flex-row items-center gap-4">
                  <View
                    className={cn(
                      'size-10 items-center justify-center rounded-full',
                      reached ? 'bg-accent' : 'bg-elevated',
                    )}
                  >
                    <Text
                      tone={reached ? 'onAccent' : 'subtle'}
                      className="font-inter-semibold text-base"
                    >
                      {k + 1}
                    </Text>
                  </View>
                  <View className="min-w-0 flex-1 gap-1.5">
                    <View className="flex-row items-baseline justify-between gap-3">
                      <Text
                        variant="bodyStrong"
                        className={cn('text-base', !reached && 'text-dim')}
                      >
                        {t(`level.tiers.${rank.tier}`)}
                      </Text>
                      <Text variant="caption" tone="subtle" className="font-inter-semibold">
                        {t('ranks.levels', { from: rank.from, to: rank.to })}
                      </Text>
                    </View>
                    <Segments lit={filled(level, rank.from, rank.to)} className="h-1" />
                    {line ? (
                      <Text variant="caption" tone="subtle" className="font-inter-medium">
                        {line}
                      </Text>
                    ) : null}
                    {muscles.length ? <MuscleRow muscles={muscles} /> : null}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
      <Sheet visible={info} onClose={() => setInfo(false)} title={t('ranks.info')}>
        <View className="gap-3 pb-2">
          {(['infoStandard', 'infoLevel', 'infoFair', 'infoExample'] as const).map((key) => (
            <Text key={key} variant="paragraph" tone="subtle">
              {t(`ranks.${key}`, { exercise: exerciseName })}
            </Text>
          ))}
        </View>
      </Sheet>
    </Screen>
  );
}
