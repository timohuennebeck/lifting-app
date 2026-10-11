import { View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import type { ExerciseHistoryEntry } from '@/shared/data/workouts';
import { minutesBetween } from '@/shared/lib/date';
import {
  formatDate,
  formatSet,
  formatVolume,
  formatWeightValue,
  type UnitSystem,
} from '@/shared/lib/format';
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

function Stat({ icon, value, color = colors.subtle }: StatProps) {
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
  session: ExerciseHistoryEntry;
  latest: boolean;
  open: boolean;
  units: UnitSystem;
  minLabel: string;
  onToggle: () => void;
}

/**
 * Past session of one exercise with MIN · VOL · top set; tapping it expands every set with its
 * RIR (design 03·C·2H·V5).
 */
export function HistorySessionRow({
  session,
  latest,
  open,
  units,
  minLabel,
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
            <Stat
              icon="timer"
              value={`${minutesBetween(session.startedAt, session.finishedAt)} ${minLabel}`}
            />
            {/* Volume only exists for weighted sets. */}
            {session.volumeKg > 0 ? (
              <Stat icon="dumbbell" value={formatVolume(session.volumeKg, units)} />
            ) : null}
            <Stat
              icon="star"
              color={session.hasPr ? colors.accent : colors.dim}
              value={
                top.weightKg != null && top.reps != null
                  ? `${formatWeightValue(top.weightKg, units)} × ${top.reps}`
                  : formatSet(top, units)
              }
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
                {formatSet(set, units)}
              </Text>
              {set.rir != null ? <RirBadge rir={set.rir} size={24} /> : null}
            </View>
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
}
