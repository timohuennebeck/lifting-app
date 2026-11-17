import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { isTimed, useExercise, useExerciseName } from '@/shared/data/exercises';
import { splitMuscles } from '@/shared/data/muscle-groups';
import type { SetTarget } from '@/shared/data/routines';
import type { SupersetSlot } from '@/shared/data/supersets';
import { cn } from '@/shared/lib/cn';
import { formatTargetLabel } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { DashedLine } from '@/shared/ui/dashed-line';
import { Icon } from '@/shared/ui/icon';
import { NumberedSet } from '@/shared/ui/numbered-set';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface RoutineExerciseCardProps {
  exerciseId: string;
  /** Target sets: rep (or second) range and RIR. */
  sets: SetTarget[];
  onMenu: () => void;
  onPress: () => void;
  /** Amber dot after the name: the plan import isn't sure about this match. */
  review?: boolean;
  /** "Neu" after the name: just added (from the picker or by voice). */
  fresh?: boolean;
  /** Below the muscles, e.g. the import's "read as …" prompt. */
  children?: ReactNode;
  /** Its place in a superset; null when it stands alone. */
  superset?: CardSuperset | null;
}

/**
 * How far the dashed line runs into the next card: its photo starts 44pt down (`pt-11`) and its
 * link mark reaches 17pt above that; the line stops 6pt short, as it starts 6pt below this one's.
 */
const INTO_NEXT_CARD = 44 - 17 - 6;

/** A card's superset: its slot, the rounds (sets done with all partners) and, first, the head. */
export interface CardSuperset {
  slot: SupersetSlot;
  /** Sets past this many are done alone ("seule"). */
  rounds: number;
  /** Over the superset's first card: its rest after a round ("2:00 after the round") and rounds. */
  header: { rest: string; rounds: string } | null;
}

/** "Superset A" and the rest after its rounds, over its first card. */
function SupersetHeader({
  letter,
  rest,
  rounds,
}: {
  letter: string;
  rest: string;
  rounds: string;
}) {
  const { t } = useTranslation('training');
  return (
    <View className="pb-1.5">
      <View className="flex-row items-center gap-2">
        <View className="h-7 flex-row items-center gap-1.5 rounded-full bg-elevated pr-2.75 pl-2.25">
          <Icon name="link" size={13} color={colors.fg} />
          <Text variant="caption">{t('superset.name', { letter })}</Text>
        </View>
        <View className="ml-auto flex-row items-center gap-1.5">
          <Icon name="timer" size={12} color={colors.fg} />
          <Text variant="caption">{t('superset.restAfterRound', { time: rest })}</Text>
        </View>
      </View>
      <Text variant="caption" tone="subtle" className="mt-2 font-inter">
        {rounds}
      </Text>
    </View>
  );
}

/** The link mark on a photo's edge, joining it to its superset partner. */
function LinkBadge({ edge }: { edge: 'top' | 'bottom' }) {
  return (
    <View
      className={cn(
        'absolute left-3.75 size-8.5 items-center justify-center rounded-full border-4 border-bg bg-accent',
        edge === 'top' ? '-top-4.25' : '-bottom-4.25',
      )}
    >
      <Icon name="link" size={12} color={colors.onAccent} />
    </View>
  );
}

/** An exercise's muscles as chips: the main ones filled, the others outlined. */
function ExerciseMuscleChips({ exerciseId }: { exerciseId: string }) {
  const { t } = useTranslation('muscles');
  const { primary, secondary } = splitMuscles(useExercise(exerciseId));
  if (!primary.length) return null;
  return (
    <View className="flex-row flex-wrap gap-1.5">
      {primary.map((m) => (
        <View key={m} className="h-7 justify-center rounded-full bg-elevated px-2.5">
          <Text variant="caption" className="text-xs">
            {t(`names.${m}`)}
          </Text>
        </View>
      ))}
      {secondary.map((m) => (
        <View key={m} className="h-7 justify-center rounded-full border border-[#333] px-2.5">
          <Text variant="body" tone="muted" className="text-xs">
            {t(`names.${m}`)}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Exercise row of the training overview: photo, name, target sets with RIR, muscles (03·0b). */
export function RoutineExerciseCard({
  exerciseId,
  sets,
  onMenu,
  onPress,
  review,
  fresh,
  children,
  superset,
}: RoutineExerciseCardProps) {
  const { t, i18n } = useTranslation('training');
  const name = useExerciseName(exerciseId, i18n.language);
  const timed = isTimed(exerciseId);
  const slot = superset?.slot;
  // In a superset the photos are chained: a link mark on the edge towards each partner, and one
  // dashed line from this card into the next one's top, so both ends keep the same gap.
  const linksUp = !!slot && slot.number > 1;
  const linksDown = !!slot && slot.number <= slot.end - slot.start;
  let tagPlace = 'bottom-1';
  if (linksDown) tagPlace = linksUp ? 'top-8.5' : 'top-1';

  return (
    <PressableScale
      haptic="none"
      activeScale={0.99}
      onPress={onPress}
      className={cn('py-4.5', linksDown && 'pb-0', linksUp && 'pt-11')}
    >
      {superset?.header && slot ? (
        <SupersetHeader
          letter={slot.letter}
          rest={superset.header.rest}
          rounds={superset.header.rounds}
        />
      ) : null}
      <View className={cn('flex-row gap-3.5', superset?.header && 'mt-3.5')}>
        <View className="w-16 items-center">
          {/* The photo opens how the exercise works and its history; the rest edits it. */}
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={t('overview.exerciseInfo', { name })}
            onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exerciseId } })}
          >
            <View>
              <ExerciseThumb
                exerciseId={exerciseId}
                name={name}
                className="h-21.5 w-16 bg-elevated"
              />
              {slot ? (
                <View
                  className={cn(
                    'absolute left-1 h-4.5 justify-center rounded-full bg-bg/85 px-1.5',
                    tagPlace,
                  )}
                >
                  <Text className="font-inter-bold text-[11px] leading-3.5">{slot.label}</Text>
                </View>
              ) : null}
              {linksUp ? <LinkBadge edge="top" /> : null}
              {linksDown ? <LinkBadge edge="bottom" /> : null}
            </View>
          </PressableScale>
          {linksDown ? (
            <DashedLine className="mt-5.75 flex-1" style={{ marginBottom: -INTO_NEXT_CARD }} />
          ) : null}
        </View>
        <View className={cn('min-w-0 flex-1 gap-2.5', linksDown && 'pb-4.5')}>
          <View className="flex-row items-start gap-2.5">
            <Text variant="label" className="flex-1 pt-1.25 text-base leading-5">
              {name}
            </Text>
            {review ? (
              <View
                className="mt-3 size-2 rounded-full"
                style={{ backgroundColor: colors.review }}
              />
            ) : null}
            {fresh ? (
              <View className="mt-1 h-6 justify-center rounded-full bg-accent px-2.5">
                <Text variant="caption" tone="onAccent" className="font-inter-bold text-xs">
                  {t('overview.new')}
                </Text>
              </View>
            ) : null}
            {/* As wide as an RIR badge, so the dots line up over the badges below. */}
            <PressableScale
              hitSlop={{ top: 8, bottom: 8, left: 13, right: 13 }}
              accessibilityLabel={t('overview.exerciseMenu', { name })}
              onPress={onMenu}
              className="h-8 w-5.5 items-center justify-center gap-0.75"
            >
              {[0, 1, 2].map((i) => (
                <View key={i} className="size-[3.5px] rounded-full bg-fg-soft" />
              ))}
            </PressableScale>
          </View>
          <View className="gap-1.5">
            {sets.map((set, i) => (
              <NumberedSet key={i} number={i + 1} rir={set.rir}>
                <View className="flex-1 flex-row items-center gap-2">
                  <Text variant="body" className="text-sm text-fg-soft">
                    {formatTargetLabel(set.targetMin, set.targetMax, timed) ?? '–'}
                  </Text>
                  {superset && i >= superset.rounds ? (
                    <View className="h-5.5 justify-center rounded-full border border-outline px-2">
                      <Text variant="caption" tone="muted" className="text-xs">
                        {t('superset.solo')}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </NumberedSet>
            ))}
          </View>
          <ExerciseMuscleChips exerciseId={exerciseId} />
          {children}
        </View>
      </View>
    </PressableScale>
  );
}
