import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { type MuscleShare, muscleShares } from '@/shared/data/muscles';
import type { ExerciseItem, RoutineSummary } from '@/shared/data/routines';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { MuscleCircle } from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

/** The circles are all one size, each further right overlapping the one before. */
const CIRCLE = 50;
const STEP = 33;
/** Width of three circles, kept for fewer too so the titles line up. */
const STACK_WIDTH = CIRCLE + 2 * STEP;

/**
 * Routines outside a plan listed as done most recently: Training shows this many ("Alle
 * anzeigen" has the rest), the Einzeltrainings page this many above all of them.
 */
export const RECENT_ROUTINES = 3;

interface MuscleStackProps {
  shares: MuscleShare[];
  /** The muscles in neon (the active plan's card). */
  highlight?: boolean;
}

/** The three muscles worked most as overlapping circles of one size, the biggest share in front. */
export function MuscleStack({ shares, highlight }: MuscleStackProps) {
  const accent = highlight ? colors.accent : colors.fg2;
  return (
    <View
      style={{ width: STACK_WIDTH, height: CIRCLE }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Drawn back to front, the biggest share in front; without exercises, one empty circle. */}
      {(shares.length ? shares.slice(0, 3) : [null])
        .map((share, i) => ({ share, left: i * STEP }))
        .reverse()
        .map(({ share, left }) => (
          <View
            key={share?.muscle ?? 'empty'}
            className="absolute top-0"
            style={{ left, width: CIRCLE, height: CIRCLE }}
          >
            {/* Each is cut out of the card behind it. */}
            <MuscleCircle
              muscle={share?.muscle ?? null}
              accent={accent}
              className="size-full border-2 border-surface"
            />
          </View>
        ))}
    </View>
  );
}

/** Muscles below this share are side work: the line names only the main ones. */
const MAIN_MUSCLE_MIN_PERCENT = 8;

/**
 * A routine's line under its name: its time and the two muscles it works most, e.g. "48 Min ·
 * Rücken · Bizeps" (the time first, so a long muscle name can't cut it off); for one without
 * exercises, that it has none.
 */
export function useRoutineMeta() {
  const { t } = useTranslation(['training', 'muscles']);
  return (routine: Pick<RoutineSummary, 'items' | 'exerciseCount' | 'estimatedMinutes'>) => {
    if (!routine.exerciseCount) return t('training:overview.noExercises');
    const muscles = muscleShares(routine.items)
      .filter((s) => s.percent >= MAIN_MUSCLE_MIN_PERCENT)
      .slice(0, 2)
      .map((s) => t(`muscles:names.${s.muscle}`));
    return [t('training:list.minutes', { count: routine.estimatedMinutes }), ...muscles].join(
      ' · ',
    );
  };
}

export interface RoutineRowProps {
  name: string;
  /** Exercise ids with their set counts, for the muscles. */
  items: ExerciseItem[];
  /** The line under the name (see `useRoutineMeta`). */
  meta: string;
  onPress: () => void;
  onStart: () => void;
  starting?: boolean;
  /** Neon line under the name, e.g. the muscle it works most: "Brust 40 %". */
  focus?: string;
  /** Done this plan week: the neon line says so instead. */
  done?: boolean;
}

/** Routine card: its top muscles as circles, the name and a line under it, and a play button. */
function RoutineRow({
  name,
  items,
  meta,
  onPress,
  onStart,
  starting,
  focus,
  done,
}: RoutineRowProps) {
  const { t } = useTranslation('training');
  const shares = muscleShares(items);

  return (
    <PressableScale
      haptic="none"
      activeScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={[name, done ? t('list.done') : focus, meta].filter(Boolean).join(', ')}
      // The card hides its play button from screen readers; this stands in for it.
      accessibilityActions={[{ name: 'start', label: t('list.start', { name }) }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'start') onStart();
      }}
      onPress={onPress}
      className="flex-row items-center gap-3.5 rounded-[18px] bg-surface py-3.5 pr-3 pl-2.5"
    >
      <MuscleStack shares={shares} />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="bodyStrong" numberOfLines={1}>
          {name}
        </Text>
        {done ? (
          <View className="flex-row items-center gap-1.25">
            <Icon name="check" size={11} color={colors.accent} />
            <Text variant="caption" tone="accent" numberOfLines={1} className="font-inter-semibold">
              {t('list.done')}
            </Text>
          </View>
        ) : focus ? (
          <Text variant="caption" tone="accent" numberOfLines={1} className="font-inter-semibold">
            {focus}
          </Text>
        ) : null}
        <Text variant="caption" tone="subtle" numberOfLines={1} className="font-inter-medium">
          {meta}
        </Text>
      </View>
      <PressableScale
        haptic="press"
        hitSlop={4}
        accessibilityLabel={t('list.start', { name })}
        onPress={onStart}
        disabled={starting}
        className="size-10 items-center justify-center rounded-full bg-elevated"
      >
        {starting ? (
          <ActivityIndicator size="small" color={colors.fg} />
        ) : (
          <Icon name="play" size={12} />
        )}
      </PressableScale>
    </PressableScale>
  );
}

interface RoutineRowsProps {
  routines: RoutineSummary[];
  /** The line under the name, e.g. when it was done last. */
  meta: (routine: RoutineSummary) => string;
  /** A neon line above it, e.g. the muscle it works most. */
  focus?: (routine: RoutineSummary) => string | undefined;
  /** Done this plan week (a plan's routines). */
  done?: (routine: RoutineSummary) => boolean;
  startingId: string | null;
  onStart: (routine: RoutineSummary) => void;
}

/** Routine cards with quick start; an empty routine opens instead, to add exercises. */
export function RoutineRows({
  routines,
  meta,
  focus,
  done,
  startingId,
  onStart,
}: RoutineRowsProps) {
  return (
    <View className="gap-2 px-4">
      {routines.map((routine) => (
        <RoutineRow
          key={routine.id}
          name={routine.name}
          items={routine.items}
          focus={focus?.(routine)}
          done={done?.(routine)}
          meta={meta(routine)}
          starting={startingId === routine.id}
          onPress={() => router.push(`/routine/${routine.id}`)}
          onStart={() =>
            routine.exerciseCount ? onStart(routine) : router.push(`/routine/${routine.id}`)
          }
        />
      ))}
    </View>
  );
}
