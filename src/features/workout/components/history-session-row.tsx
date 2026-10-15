import { View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { formatSet } from '@/shared/data/exercises';
import type { ExerciseHistoryEntry } from '@/shared/data/workouts';
import { formatDate, formatVolume, type UnitSystem } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon, type IconName } from '@/shared/ui/icon';
import { ListRow } from '@/shared/ui/list-row';
import { RirBadge } from '@/shared/ui/rir-badge';
import { Text } from '@/shared/ui/text';

interface StatProps {
  icon: IconName;
  value: string;
  color?: string;
}

/** A stat under a history row's title: icon and value (exercise and workout history). */
export function HistoryStat({ icon, value, color = colors.subtle }: StatProps) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Icon name={icon} size={icon === 'dumbbell' ? 18 : 13} color={color} />
      <Text variant="label" tone="secondary" className="text-sm leading-4.5">
        {value}
      </Text>
    </View>
  );
}

export interface HistorySessionRowProps {
  exerciseId: string;
  session: ExerciseHistoryEntry;
  latest: boolean;
  open: boolean;
  units: UnitSystem;
  onToggle: () => void;
}

/**
 * Past session of one exercise with its volume and top set; tapping it expands every set with its
 * RIR (design 03·C·2H·V5). The design's workout minutes are left out: they aren't about the
 * exercise, and the line has to fit a 375pt phone.
 */
export function HistorySessionRow({
  exerciseId,
  session,
  latest,
  open,
  units,
  onToggle,
}: HistorySessionRowProps) {
  const top = session.topSet;
  const chevron = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(open ? '180deg' : '0deg', { duration: 200 }) }],
  }));

  return (
    <View className="px-2">
      <ListRow
        haptic="select"
        activeScale={0.99}
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        badge={formatDate(new Date(session.startedAt), { day: 'numeric' })}
        highlight={latest}
        title={session.name}
        subtitle={
          <View className="flex-row items-center gap-3.5">
            {/* Volume only exists for weighted sets. */}
            {session.volumeKg > 0 ? (
              <HistoryStat icon="dumbbell" value={formatVolume(session.volumeKg, units)} />
            ) : null}
            <HistoryStat
              icon="star"
              color={session.hasPr ? colors.accent : colors.dim}
              value={formatSet(exerciseId, top, units)}
            />
          </View>
        }
        trailing={
          <Animated.View
            className="size-7 items-center justify-center rounded-full bg-chip"
            style={chevron}
          >
            <Icon name="chevron-down" size={12} color={colors.subtle} />
          </Animated.View>
        }
      />
      {open ? (
        <Animated.View entering={FadeIn.duration(180)} className="gap-0.5 px-1 pb-2.5">
          {session.sets.map((set, i) => (
            <View key={i} className="h-11 flex-row items-center gap-3">
              <View className="size-7 items-center justify-center rounded-full bg-elevated">
                <Text variant="caption" className="tabular-nums">
                  {i + 1}
                </Text>
              </View>
              <Text variant="bodyStrong" className="flex-1 text-lg leading-5.5 tabular-nums">
                {formatSet(exerciseId, set, units)}
              </Text>
              {set.rir != null ? <RirBadge rir={set.rir} size={24} /> : null}
            </View>
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
}
