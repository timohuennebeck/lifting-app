import { router } from 'expo-router';
import type { TFunction } from 'i18next';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { MuscleCardHeader } from '@/shared/components/muscle-card-header';
import { useExerciseName } from '@/shared/data/exercises';
import { type MuscleShare, muscleShares } from '@/shared/data/muscles';
import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { CheckBadge } from '@/shared/ui/check-item';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { type PlanSwap, swapInPlan, useSwapRoutines } from '../data/coach-swap';
import type { SwapChart } from '../lib/charts';
import { setsLabel } from '../lib/sets-label';
import { type SwapStatus, type SwapView, swapRoutineNames, swapState } from '../lib/swap';

const sharesOf = (exerciseId: string) => muscleShares([{ exerciseId, sets: 1 }]);

/** One swap: the new exercise's muscles. Several: each new exercise's main muscle first. */
function headShares(chosen: string[]) {
  if (chosen.length === 1) return sharesOf(chosen[0]);
  const all = chosen.map(sharesOf);
  const shares: MuscleShare[] = [];
  const add = (share: MuscleShare | undefined) => {
    if (share && !shares.some((s) => s.muscle === share.muscle)) shares.push(share);
  };
  all.forEach((s) => add(s[0]));
  all.forEach((s) => s.forEach(add));
  return shares;
}

/**
 * One swap: whether its main muscle stays. Several: how many exercises it swaps (or swapped), or
 * that all stay when none is picked. `inPlan` is what each slot holds after applying.
 */
function headline(
  status: SwapStatus,
  swaps: SwapView[],
  inPlan: string[],
  swapping: number,
  t: TFunction<['coach', 'muscles']>,
) {
  const from = swaps.length === 1 ? sharesOf(swaps[0].exerciseId)[0]?.muscle : undefined;
  const to = swaps.length === 1 ? sharesOf(inPlan[0])[0]?.muscle : undefined;
  if (from && to && from === to) {
    return t('coach:swap.keepsMain', { muscle: t(`muscles:names.${to}`) });
  }
  if (from && to) {
    return t('coach:swap.newMain', {
      to: t(`muscles:names.${to}`),
      from: t(`muscles:names.${from}`),
    });
  }
  if (!swapping) return t('coach:swap.keepAll');
  const key = status === 'applied' ? 'coach:swap.swapped' : 'coach:swap.toSwap';
  return t(key, { count: swapping });
}

/** A radio's ring and dot drawn as one, so the dot sits in the middle at every pixel density. */
function Radio({ checked }: { checked: boolean }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Circle
        cx={8}
        cy={8}
        r={7.25}
        fill="none"
        stroke={checked ? colors.accent : colors.outline}
        strokeWidth={1.5}
      />
      {checked ? <Circle cx={8} cy={8} r={3.5} fill={colors.accent} /> : null}
    </Svg>
  );
}

interface SwapLineProps {
  exerciseId: string;
  /** "4 × 6–8"; empty once the plan changed. */
  label: string;
  /**
   * was: the exercise replaced. to: its replacement. option: one to pick (`checked`). kept: one
   * the user didn't swap.
   */
  kind: 'was' | 'to' | 'option' | 'kept';
  checked?: boolean;
  recommended?: boolean;
  /** The option to keep the exercise: "Kniebeugen behalten". */
  keep?: boolean;
}

/** An exercise as the workout card lists it, with its photo: name left, sets right. */
function SwapLine({ exerciseId, label, kind, checked, recommended, keep }: SwapLineProps) {
  const { t, i18n } = useTranslation('coach');
  const name = useExerciseName(exerciseId, i18n.language);
  const was = kind === 'was';
  let tone = 'text-fg-soft';
  if (was) tone = 'text-dim line-through';
  else if (kind === 'option') tone = checked ? 'text-fg' : 'text-fg-2';
  return (
    <View className="min-w-0 flex-1 flex-row items-center gap-3">
      {kind === 'to' ? (
        <View className="-mr-1 w-3.5">
          <Icon name="arrow-right" size={11} color={colors.accent} />
        </View>
      ) : null}
      <View className={was ? 'opacity-45' : undefined}>
        <ExerciseThumb
          exerciseId={exerciseId}
          name={name}
          className="h-10 w-[30px] rounded-[4px]"
          initialsClassName="text-[10px]"
        />
      </View>
      <View className="min-w-0 flex-1 flex-row items-baseline">
        <Text
          variant="body"
          numberOfLines={1}
          className={cn('min-w-0 shrink text-sm leading-5', tone)}
          style={was ? { textDecorationColor: colors.outline } : undefined}
        >
          {keep ? t('swap.keep', { name }) : name}
        </Text>
        {recommended ? (
          <Text variant="caption" tone="accent" className="ml-1.5 text-xs leading-4">
            {t('swap.recommended')}
          </Text>
        ) : null}
      </View>
      <Text
        variant="caption"
        className={cn('font-inter-medium text-sm leading-5', was ? 'text-dim' : 'text-subtle')}
      >
        {label}
      </Text>
    </View>
  );
}

interface SwapGroupProps {
  swap: SwapView;
  status: SwapStatus;
  /** The option picked, or the one in the plan once applied; null: the exercise stays. */
  chosen: string | null;
  onPick: (option: string | null) => void;
  /** Its workouts above it, when the card swaps several exercises. */
  showWorkouts: boolean;
}

/**
 * One exercise of the change: it, struck through, then its options (and keeping it) or its
 * replacement. Kept once the change was applied: it alone, not struck through.
 */
function SwapGroup({ swap, status, chosen, onPick, showWorkouts }: SwapGroupProps) {
  const { t } = useTranslation('coach');
  const label = (exerciseId: string) =>
    swap.line ? setsLabel({ ...swap.line, exerciseId }, t) : '';
  const workouts = showWorkouts ? (
    <Text numberOfLines={1} className="font-inter-medium text-xs leading-4 text-dim">
      {swap.routines.map((r) => r.name).join(' · ')}
    </Text>
  ) : null;
  if (status === 'applied' && !chosen) {
    return (
      <View className="gap-1">
        {workouts}
        <View className="flex-row">
          <SwapLine kind="kept" exerciseId={swap.exerciseId} label={label(swap.exerciseId)} />
        </View>
        <Text className="font-inter-medium text-xs leading-4 text-dim">{t('swap.notSwapped')}</Text>
      </View>
    );
  }
  const choices = [...swap.options, null];
  return (
    <View className="gap-1">
      {workouts}
      <View className="flex-row">
        <SwapLine kind="was" exerciseId={swap.exerciseId} label={label(swap.exerciseId)} />
      </View>
      <View className="mt-1 flex-row items-center gap-1.5">
        <Icon name="arrow-down" size={11} color={colors.accent} />
        <Text variant="overline" tone="subtle" className="text-xs leading-4 tracking-[1.2px]">
          {t(status === 'applied' ? 'swap.inPlan' : 'swap.replaceWith')}
        </Text>
      </View>
      {status === 'ready' ? (
        <View accessibilityRole="radiogroup" className="mt-0.5 -ml-2 gap-0.5">
          {choices.map((option, i) => {
            const checked = option === chosen;
            return (
              <PressableScale
                key={option ?? 'keep'}
                accessibilityRole="radio"
                accessibilityState={{ checked }}
                haptic="select"
                activeScale={0.99}
                onPress={() => onPick(option)}
                className={cn(
                  'flex-row items-center gap-2.5 rounded-xl px-2 py-[7px]',
                  checked && 'bg-elevated',
                )}
              >
                <Radio checked={checked} />
                <SwapLine
                  kind="option"
                  exerciseId={option ?? swap.exerciseId}
                  label={label(option ?? swap.exerciseId)}
                  checked={checked}
                  recommended={i === 0}
                  keep={!option}
                />
              </PressableScale>
            );
          })}
        </View>
      ) : (
        <View className="flex-row">
          <SwapLine
            kind="to"
            exerciseId={chosen ?? swap.options[0]}
            label={label(chosen ?? swap.options[0])}
          />
        </View>
      )}
    </View>
  );
}

/** Applied: what is in the plan now, from when, and undo. */
function AppliedNote({ swaps, onUndo }: { swaps: SwapView[]; onUndo: () => void }) {
  const { t, i18n } = useTranslation('coach');
  const applied = swaps.flatMap((s) => s.applied ?? []);
  const name = useExerciseName(applied.at(0) ?? '', i18n.language);
  const title =
    applied.length === 1
      ? t('swap.appliedOne', { name })
      : t('swap.swapped', { count: applied.length });
  return (
    <View className="ml-1 flex-row items-center gap-2.5 rounded-[14px] bg-bg p-3">
      <CheckBadge size={22} glyph={11} />
      <View className="min-w-0 flex-1 gap-px">
        <Text variant="label" numberOfLines={2} className="text-sm leading-[19px]">
          {title}
        </Text>
        <Text numberOfLines={1} className="font-inter text-xs leading-4 text-subtle">
          {t('swap.fromNext')}
        </Text>
      </View>
      <PressableScale haptic="press" hitSlop={8} onPress={onUndo} className="px-1 py-2">
        <Text variant="caption" tone="secondary">
          {t('swap.undo')}
        </Text>
      </PressableScale>
    </View>
  );
}

/** Stale: which exercise is gone from where, so the card can't apply anymore. */
function StaleNote({ gone }: { gone: SwapView | undefined }) {
  const { t, i18n } = useTranslation('coach');
  const name = useExerciseName(gone?.exerciseId ?? '', i18n.language);
  const workouts = gone?.routines.map((r) => r.name).join(' · ') ?? '';
  let what = '';
  if (gone && workouts) what = `${t('swap.gone', { name, workouts })} `;
  else if (gone) what = `${t('swap.goneFromPlan', { name })} `;
  return (
    <View className="ml-1 flex-row items-start gap-2.5 rounded-[14px] bg-bg p-3">
      <View className="mt-px size-4.5 items-center justify-center rounded-full border-[1.5px] border-amber">
        <Text className="font-inter-bold text-[11px] leading-3 text-amber">!</Text>
      </View>
      <Text className="min-w-0 flex-1 font-inter text-[13px] leading-[18px] text-muted">
        {`${what}${t('swap.changed')}`}
      </Text>
    </View>
  );
}

/**
 * A change to the user's plan Kai proposed, on a card of the page's width like a workout: per
 * exercise the options to pick from, then one tap swaps them in the plan's workouts. Its state is
 * read from the plan, so it shows what was applied (with undo) or that the plan changed since.
 */
export function SwapCard({ chart }: { chart: SwapChart }) {
  const { t } = useTranslation(['coach', 'muscles']);
  const routineIds = [...new Set(chart.swaps.flatMap((s) => s.routineIds))];
  const { data: routines } = useSwapRoutines(routineIds);
  // Per exercise the option picked, or null to keep it; the recommended one until then.
  const [picks, setPicks] = useState<Record<string, string | null>>({});
  // State isn't updated yet on a double tap, which would swap twice.
  const busy = useRef(false);
  if (!routines) return null;

  const { status, swaps } = swapState(chart, routines);
  const picked = (s: SwapView) => (s.exerciseId in picks ? picks[s.exerciseId] : s.options[0]);
  const chosen = swaps.map((s) => (status === 'ready' ? picked(s) : s.applied));
  const inPlanAfter = swaps.map((s, i) => chosen[i] ?? s.exerciseId);
  const swapping = chosen.filter(Boolean).length;
  const names = swapRoutineNames(swaps, routines);
  const count = swaps.length;
  // "Beide" and "Alle" only when every exercise is swapped.
  let applyLabel = t('coach:swap.apply');
  if (swapping === count && count === 2) applyLabel = t('coach:swap.applyBoth');
  else if (swapping === count && count > 2) applyLabel = t('coach:swap.applyAll');

  const change = async (planSwaps: PlanSwap[]) => {
    if (busy.current) return;
    busy.current = true;
    try {
      await swapInPlan(planSwaps);
      haptics.success();
    } catch (error) {
      haptics.error();
      console.error(error);
    }
    busy.current = false;
  };
  const inPlan = (s: SwapView) => s.routines.map((r) => r.id);
  const apply = () =>
    void change(
      swaps.flatMap((s, i) => {
        const to = chosen[i];
        return to ? [{ from: s.exerciseId, to, routineIds: inPlan(s) }] : [];
      }),
    );
  const undo = () =>
    void change(
      swaps.flatMap((s) =>
        s.applied ? [{ from: s.applied, to: s.exerciseId, routineIds: inPlan(s) }] : [],
      ),
    );
  const firstRoutine = swaps[0].routines.at(0)?.id;

  return (
    <View className="gap-3.5 rounded-[18px] bg-surface py-3.5 pr-3.5 pl-2.5">
      <MuscleCardHeader
        shares={headShares(inPlanAfter)}
        highlight
        title={t('coach:swap.title')}
        focus={headline(status, swaps, inPlanAfter, swapping, t)}
        meta={names.join(' · ')}
      />
      <View className={cn('gap-2 pb-0.5 pl-1', status === 'stale' && 'opacity-55')}>
        {swaps.map((swap, i) => (
          <View key={swap.exerciseId} className={i > 0 ? 'border-t border-line pt-2.5' : undefined}>
            <SwapGroup
              swap={swap}
              status={status}
              chosen={chosen[i]}
              onPick={(option) => setPicks((p) => ({ ...p, [swap.exerciseId]: option }))}
              showWorkouts={count > 1}
            />
          </View>
        ))}
      </View>
      {status === 'ready' ? (
        <View className="ml-1 flex-row gap-2">
          <Button
            label={applyLabel}
            size="md"
            disabled={!swapping}
            onPress={apply}
            className="flex-1"
          />
          <Button
            label={t('coach:swap.viewPlan')}
            variant="secondary"
            size="md"
            onPress={() => (firstRoutine ? router.push(`/routine/${firstRoutine}`) : undefined)}
            className="flex-1"
          />
        </View>
      ) : null}
      {status === 'applied' ? <AppliedNote swaps={swaps} onUndo={undo} /> : null}
      {status === 'stale' ? (
        <>
          <StaleNote gone={swaps.find((s) => !s.line)} />
          <View className="ml-1">
            <Button label={applyLabel} size="md" disabled />
          </View>
        </>
      ) : null}
    </View>
  );
}
