import type { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import type { ExerciseHistorySet } from '@/shared/data/workouts';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { ListRow } from '@/shared/ui/list-row';
import { Text } from '@/shared/ui/text';

export interface HistoryRowProps {
  /** Day of the month in the leading circle. */
  day: ReactNode;
  latest: boolean;
  open: boolean;
  onToggle: () => void;
  title: string;
  stats: ReactNode;
  sets: ExerciseHistorySet[];
  /** Weight × reps and RIR of one set, after its number. */
  renderSet: (set: ExerciseHistorySet) => ReactNode;
}

/** Past session of one exercise; tapping it expands every logged set. */
export function HistoryRow({
  day,
  latest,
  open,
  onToggle,
  title,
  stats,
  sets,
  renderSet,
}: HistoryRowProps) {
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
        badge={day}
        highlight={latest}
        title={title}
        subtitle={<View className="flex-row items-center gap-3.5">{stats}</View>}
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
          {sets.map((set, i) => (
            <View key={i} className="h-11 flex-row items-center gap-3">
              <View className="size-7 items-center justify-center rounded-full bg-elevated">
                <Text variant="caption">{i + 1}</Text>
              </View>
              {renderSet(set)}
            </View>
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
}
