import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useExerciseName } from '@/shared/data/exercises';
import { useUnits } from '@/shared/data/profile';
import { cn } from '@/shared/lib/cn';
import { formatNumber, toDisplayWeight, weightUnit } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { MuscleCircle, type MuscleId } from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { RankCard } from '../components/rank-card';
import { filled, RankSegments } from '../components/rank-segments';
import { useMuscleLevels } from '../hooks/use-muscle-levels';
import { levelTarget, overallLevel, TIERS } from '../lib/levels';

/** Muscle circles shown per rank before "+n". */
const CIRCLES = 5;
const CIRCLE = 30;
const CIRCLE_STEP = 21;

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
 * with their levels, what each one takes in a lift for this user (body weight and sex) and the
 * muscles in it now. The lift is picked in the exercise search from the pill above the ranks.
 * "i" explains how levels and ranks are worked out.
 */
export function RanksScreen() {
  const { t, i18n } = useTranslation('muscles');
  const insets = useSafeAreaInsets();
  const units = useUnits();
  const { levels, bodyWeight, sex, lift, isLoading } = useMuscleLevels();
  const exerciseName = useExerciseName(lift?.exerciseId ?? '', i18n.language);
  const [info, setInfo] = useState(false);

  const level = Math.floor(overallLevel(levels));

  // What a rank's first level takes in the lift: a weight in the usual reps, or reps.
  const amount = (rankLevel: number) => {
    const target = lift && levelTarget(rankLevel, lift.exercise, bodyWeight, sex, lift.reps);
    if (!target) return null;
    return target.weightKg === undefined
      ? formatNumber(Math.round(target.reps), 0)
      : formatNumber(Math.round(toDisplayWeight(target.weightKg, units)), 0);
  };
  const target = lift && levelTarget(1, lift.exercise, bodyWeight, sex, lift.reps);
  const unit =
    target?.weightKg === undefined ? t('ranks.repsUnit') : `${weightUnit(units)} × ${target.reps}`;
  // Under each rank: what it takes in the lift of the pill above.
  const example = (k: number) => {
    const after = TIERS[k + 1];
    const from = amount(TIERS[k].from);
    const to = after && amount(after.from);
    if (!lift || from === null || to === null) return null;
    if (!k) return t('ranks.upTo', { value: `${to} ${unit}` });
    if (!after) return t('ranks.over', { value: `${from} ${unit}` });
    return t('ranks.between', { from, to, unit });
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
          <RankCard level={level} className="mx-4 mt-3" />

          <View className="flex-row items-center justify-between gap-3 px-5 pt-8 pb-1">
            <Text variant="overline" tone="subtle" className="text-[11px]">
              {t('ranks.all')}
            </Text>
            {lift ? (
              <PressableScale
                haptic="select"
                accessibilityHint={t('ranks.change')}
                onPress={() =>
                  router.push({
                    pathname: '/search',
                    params: { pick: 'rank', selected: lift.exerciseId },
                  })
                }
                className="h-8 max-w-[60%] flex-row items-center gap-1.5 rounded-full bg-elevated px-3"
              >
                <Text variant="caption" numberOfLines={1} className="shrink font-inter-semibold">
                  {lift.own ? exerciseName : t('ranks.example', { exercise: exerciseName })}
                </Text>
                <Icon name="chevron-down" size={11} color={colors.subtle} />
              </PressableScale>
            ) : null}
          </View>
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
                    <RankSegments lit={filled(level, rank.from, rank.to)} className="h-1" />
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
              {t(`ranks.${key}`)}
            </Text>
          ))}
        </View>
      </Sheet>
    </Screen>
  );
}
