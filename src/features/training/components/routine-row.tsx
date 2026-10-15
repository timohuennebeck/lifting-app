import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { mainShares, type MuscleShare, muscleShares } from '@/shared/data/muscles';
import type { ExerciseItem, RoutineSummary } from '@/shared/data/routines';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { MuscleCircle } from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

/** Where the circles behind the front one sit: further right, each a size smaller. */
const BEHIND = [
  { left: 39, size: 46 },
  { left: 70, size: 46 },
] as const;
const FRONT_SIZE = 56;
/** Width of three circles, kept for fewer too so the titles line up. */
const STACK_WIDTH = 116;

interface MuscleStackProps {
  shares: MuscleShare[];
  /** The front muscle in neon, ringed: the routine that's next. */
  highlight?: boolean;
}

/** The three muscles worked most as overlapping circles, the biggest share in front. */
export function MuscleStack({ shares, highlight }: MuscleStackProps) {
  const [first, ...rest] = shares.slice(0, 3);
  return (
    <View
      style={{ width: STACK_WIDTH, height: FRONT_SIZE }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Drawn back to front. */}
      {rest
        .map((share, i) => ({ share, ...BEHIND[i] }))
        .reverse()
        .map(({ share, left, size }) => (
          <View
            key={share.muscle}
            className="absolute"
            style={{ left, top: (FRONT_SIZE - size) / 2, width: size, height: size }}
          >
            <MuscleCircle
              muscle={share.muscle}
              accent={colors.fg2}
              className="size-full border-2 border-surface"
            />
          </View>
        ))}
      {/* Without exercises yet: one empty circle. */}
      <View className="absolute top-0 left-0" style={{ width: FRONT_SIZE, height: FRONT_SIZE }}>
        <MuscleCircle
          muscle={first?.muscle ?? null}
          accent={first && highlight ? colors.accent : colors.fg2}
          // The next one's front circle is ringed in neon; the others are cut out of the card.
          className={cn(
            'size-full',
            first && highlight ? 'border-[1.5px] border-accent' : 'border-2 border-surface',
          )}
        />
      </View>
    </View>
  );
}

/**
 * A routine's line under its name: its time and the two muscles it works most, e.g. "48 Min ·
 * Rücken · Bizeps" (the time first, so a long muscle name can't cut it off); for one without
 * exercises, that it has none.
 */
export function useRoutineMeta() {
  const { t } = useTranslation(['training', 'muscles']);
  return (routine: Pick<RoutineSummary, 'items' | 'exerciseCount' | 'estimatedMinutes'>) => {
    if (!routine.exerciseCount) return t('training:overview.noExercises');
    const muscles = mainShares(muscleShares(routine.items))
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
  /** "⋯": rename, copy or delete; left out where the routine's page has it. */
  onMore?: () => void;
  starting?: boolean;
  /** The plan's next routine: its top muscle in neon. */
  next?: boolean;
  /** Small accent tag over the name, e.g. "Coach empfiehlt". */
  tag?: string;
  /** Done this plan week: dimmed, with a check where play would be. */
  done?: boolean;
}

/**
 * Routine card: its top muscles as circles, the name and a line under it; "⋯" (rename, copy,
 * delete) where given, and a quick-start play button, or a check once it's done this week.
 */
export function RoutineRow({
  name,
  items,
  meta,
  onPress,
  onStart,
  onMore,
  starting,
  next,
  tag,
  done,
}: RoutineRowProps) {
  const { t } = useTranslation('training');
  const shares = muscleShares(items);

  return (
    <PressableScale
      haptic="none"
      activeScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={[tag, name, meta].filter(Boolean).join(', ')}
      // The card hides its buttons from screen readers; these stand in for them.
      accessibilityActions={[
        { name: 'start', label: t('list.start', { name }) },
        ...(onMore ? [{ name: 'more', label: t('list.more', { name }) }] : []),
      ]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'start') onStart();
        else if (e.nativeEvent.actionName === 'more') onMore?.();
      }}
      onPress={onPress}
      className="flex-row items-center gap-3.5 rounded-[22px] bg-surface py-3.5 pr-3 pl-2.5"
    >
      <View className={cn(done && 'opacity-60')}>
        <MuscleStack shares={shares} highlight={next} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        {tag ? (
          <View className="mb-0.5 self-start rounded-full bg-accent px-2 py-0.5">
            <Text variant="caption" tone="onAccent" className="text-[11px] leading-3.5">
              {tag}
            </Text>
          </View>
        ) : null}
        <Text variant="bodyStrong" tone={done ? 'subtle' : undefined} numberOfLines={1}>
          {name}
        </Text>
        <Text variant="caption" tone="subtle" numberOfLines={1} className="font-inter-medium">
          {meta}
        </Text>
      </View>
      <View className="flex-row items-center gap-0.5">
        {onMore ? (
          <PressableScale
            haptic="tap"
            hitSlop={8}
            accessibilityLabel={t('list.more', { name })}
            onPress={onMore}
            className="h-10 w-6 items-center justify-center"
          >
            <Icon name="more" size={14} color={colors.subtle} />
          </PressableScale>
        ) : null}
        {done ? (
          <View className="size-10 items-center justify-center rounded-full bg-elevated">
            <Icon name="check" size={13} color={colors.accent} />
          </View>
        ) : (
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
        )}
      </View>
    </PressableScale>
  );
}
