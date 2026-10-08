import { View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { formatDate, formatNumber, formatWeight, type UnitSystem } from '@/shared/lib/format';
import { colors, useAccentColor } from '@/shared/lib/theme';
import { Icon, type IconName } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { RirBadge } from '@/shared/ui/rir-badge';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/cn';

import type { ExerciseSession } from '../data/exercise-sessions';
import { minutesBetween } from '../lib/time';
import { formatWeightValue } from '../lib/weight';

interface StatProps {
  icon: IconName;
  value: string;
  color?: string;
}

function Stat({ icon, value, color = colors.subtle }: StatProps) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Icon name={icon} size={icon === 'dumbbell' ? 18 : 13} color={color} />
      <Text variant="label" tone="secondary" className="text-sm leading-[18px]">
        {value}
      </Text>
    </View>
  );
}

export interface HistorySessionRowProps {
  session: ExerciseSession;
  latest: boolean;
  open: boolean;
  units: UnitSystem;
  minLabel: string;
  onToggle: () => void;
}

/** Session with MIN · VOL · top set; expands to every set with its RIR (design 03·C·2H·V5). */
export function HistorySessionRow({
  session,
  latest,
  open,
  units,
  minLabel,
  onToggle,
}: HistorySessionRowProps) {
  const accent = useAccentColor();
  const chevron = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(open ? '180deg' : '0deg', { duration: 200 }) }],
  }));
  const top = session.topSet;

  return (
    <View className="px-2">
      <PressableScale
        haptic="select"
        activeScale={0.99}
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        className="h-[72px] flex-row items-center gap-3.5"
      >
        <View
          className={cn(
            'size-10 items-center justify-center rounded-full',
            latest ? 'bg-accent' : 'bg-elevated',
          )}
        >
          <Text variant="label" tone={latest ? 'onAccent' : 'default'}>
            {formatDate(new Date(session.startedAt), { day: 'numeric' })}
          </Text>
        </View>
        <View className="flex-1 gap-1.5">
          <Text variant="bodyStrong" numberOfLines={1} className="text-lg leading-[22px]">
            {session.name}
          </Text>
          <View className="flex-row items-center gap-3.5">
            <Stat
              icon="timer"
              value={`${minutesBetween(session.startedAt, session.finishedAt)} ${minLabel}`}
            />
            <Stat icon="dumbbell" value={formatWeight(session.volumeKg, units)} />
            <Stat
              icon="star"
              color={session.hasPr ? accent : colors.dim}
              value={`${formatWeightValue(top.weightKg, units)} × ${top.reps}`}
            />
          </View>
        </View>
        <Animated.View
          className="size-7 items-center justify-center rounded-full bg-[#1A1A1A]"
          style={chevron}
        >
          <Icon name="chevron-down" size={12} color={colors.subtle} />
        </Animated.View>
      </PressableScale>
      {open ? (
        <Animated.View entering={FadeIn.duration(180)} className="gap-0.5 px-1 pb-2.5">
          {session.sets.map((set, i) => (
            <View key={i} className="h-11 flex-row items-center gap-3">
              <View className="size-7 items-center justify-center rounded-full bg-elevated">
                <Text variant="caption">{i + 1}</Text>
              </View>
              <Text variant="bodyStrong" className="flex-1 text-lg leading-[22px]">
                {`${formatWeight(set.weightKg, units)} × ${formatNumber(set.reps, 0)}`}
              </Text>
              {set.rir != null ? <RirBadge rir={set.rir} size={24} /> : null}
            </View>
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
}
