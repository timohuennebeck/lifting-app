import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { formatSet } from '@/shared/data/exercises';
import type { ExerciseHistoryEntry, ExerciseHistorySet } from '@/shared/data/workouts';
import { formatDate, formatVolume, type UnitSystem } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { RirBadge } from '@/shared/ui/rir-badge';
import { Text } from '@/shared/ui/text';

/** Neon tag after a set that was a personal record. */
function PrBadge() {
  const { t } = useTranslation('exercises');
  return (
    <View
      accessible
      accessibilityLabel={t('history.prA11y')}
      className="h-4.5 justify-center rounded-full bg-accent px-1.5"
    >
      <Text
        variant="caption"
        tone="onAccent"
        className="font-inter-bold text-[11px] leading-3.5 tracking-[0.4px]"
      >
        {t('history.pr')}
      </Text>
    </View>
  );
}

interface SetRowProps {
  exerciseId: string;
  number: number;
  set: ExerciseHistorySet;
  units: UnitSystem;
}

/**
 * A set of an opened session, in the columns of the row above: its number under the date, the
 * set under the workout name, its RIR under the chevron.
 */
function SetRow({ exerciseId, number, set, units }: SetRowProps) {
  return (
    <View className="h-9 flex-row items-center gap-3.5">
      <View className="size-6 items-center justify-center rounded-full bg-chip">
        <Text variant="caption" tone="subtle" className="text-xs tabular-nums">
          {number}
        </Text>
      </View>
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <Text
          variant="label"
          tone="secondary"
          numberOfLines={1}
          className="shrink font-inter-medium leading-5 tabular-nums"
        >
          {formatSet(exerciseId, set, units)}
        </Text>
        {set.isPr ? <PrBadge /> : null}
      </View>
      {set.rir != null ? <RirBadge rir={set.rir} size={20} /> : null}
    </View>
  );
}

/** "SAT", "SA", "SAM": the short weekday in capitals, without an abbreviation's dot. */
const weekdayShort = (date: Date) =>
  formatDate(date, { weekday: 'short' }).replace(/\.$/, '').toUpperCase();

export interface HistorySessionRowProps {
  exerciseId: string;
  session: ExerciseHistoryEntry;
  open: boolean;
  units: UnitSystem;
  onToggle: () => void;
}

/**
 * Past session of one exercise: the day over its weekday, the workout name and volume, and the
 * set count with the top set (a PR tag when it was one). Tapping it opens every set with its RIR.
 */
export function HistorySessionRow({
  exerciseId,
  session,
  open,
  units,
  onToggle,
}: HistorySessionRowProps) {
  const { t } = useTranslation('exercises');
  const started = new Date(session.startedAt);
  const top = session.topSet;
  const setCount = t('history.sets', { count: session.sets.length });
  const chevron = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(open ? '180deg' : '0deg', { duration: 200 }) }],
  }));

  return (
    <View className="px-2 pb-3.5">
      <PressableScale
        haptic="select"
        activeScale={0.99}
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        className="flex-row gap-3 pt-2.5"
      >
        <View className="w-7 items-center">
          <Text variant="headline" className="tabular-nums">
            {formatDate(started, { day: 'numeric' })}
          </Text>
          <Text
            variant="caption"
            tone="subtle"
            className="text-[11px] leading-3.5 tracking-[0.8px]"
          >
            {weekdayShort(started)}
          </Text>
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <Text variant="label" numberOfLines={1} className="flex-1 leading-5 text-fg-mid">
              {session.name}
            </Text>
            {/* Volume only exists for weighted sets. */}
            {session.volumeKg > 0 ? (
              <Text variant="caption" tone="subtle" className="font-inter tabular-nums">
                {formatVolume(session.volumeKg, units)}
              </Text>
            ) : null}
            <Animated.View
              className="size-6 items-center justify-center rounded-full bg-pill"
              style={chevron}
            >
              <Icon name="chevron-down" size={11} color={colors.muted} />
            </Animated.View>
          </View>
          <View className="mt-0.75 flex-row items-center gap-1.25">
            <Text variant="caption" tone="subtle" className="font-inter">
              {open ? setCount : `${setCount} ·`}
            </Text>
            {open ? null : (
              <>
                <Icon name="star" size={13} color={colors.subtle} />
                <Text variant="caption" tone="subtle" className="shrink font-inter tabular-nums">
                  {formatSet(exerciseId, top, units)}
                </Text>
                {top.isPr ? <PrBadge /> : null}
              </>
            )}
          </View>
        </View>
      </PressableScale>
      {open ? (
        <Animated.View entering={FadeIn.duration(180)} className="px-0.5 pt-1.5">
          {session.sets.map((set, i) => (
            <SetRow key={i} exerciseId={exerciseId} number={i + 1} set={set} units={units} />
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
}
