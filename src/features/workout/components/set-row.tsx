import { type ReactNode, useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { RirBadge } from '@/shared/ui/rir-badge';
import { Text } from '@/shared/ui/text';

import type { SetField } from '../stores/workout-session-store';

function BlinkingCursor() {
  const opacity = useSharedValue(1);
  useEffect(() => {
    const step = (to: number) => withDelay(500, withTiming(to, { duration: 0 }));
    opacity.set(withRepeat(withSequence(step(0), step(1)), -1));
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return <Animated.View className="h-5 w-0.5 rounded-full bg-accent" style={style} />;
}

interface CellProps {
  value: string;
  active: boolean;
  pristine: boolean;
  label: string;
  onPress: () => void;
  children?: ReactNode;
}

function Cell({ value, active, pristine, label, onPress, children }: CellProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityValue={{ text: value }}
      onPress={onPress}
      className={cn(
        'relative h-11 w-19.5 flex-row items-center justify-center gap-0.5 rounded-xl bg-white/8',
        active && 'border-2 border-accent',
      )}
    >
      {value ? (
        <Text
          variant="bodyStrong"
          className={cn(
            'rounded-md px-0.5 text-lg leading-5.5',
            active && pristine && 'bg-accent/25',
          )}
        >
          {value}
        </Text>
      ) : null}
      {active && (!pristine || !value) ? <BlinkingCursor /> : null}
      {children}
    </Pressable>
  );
}

export interface SetRowProps {
  number: number;
  /** Targets ("7–9") or last time ("60 kg × 9"), whichever column is shown. */
  middle: string | null;
  kg: string;
  reps: string;
  rir: number | null;
  done: boolean;
  record: boolean;
  selected: boolean;
  field: SetField;
  pristine: boolean;
  onSelect: (field: SetField) => void;
  onToggleDone: () => void;
}

/** One row of the logging table: SET · TARGETS/LAST · KG · REPS · done. */
export function SetRow({
  number,
  middle,
  kg,
  reps,
  rir,
  done,
  record,
  selected,
  field,
  pristine,
  onSelect,
  onToggleDone,
}: SetRowProps) {
  const { t } = useTranslation('workout');
  return (
    <Pressable
      accessibilityLabel={t('table.setLabel', { n: number })}
      onPress={() => onSelect('kg')}
      className="h-14 flex-row items-center gap-2.5"
    >
      <View
        className={cn(
          'size-10 items-center justify-center rounded-full bg-elevated',
          record && 'bg-accent',
        )}
      >
        <Text variant="bodyStrong" tone={record ? 'onAccent' : 'default'} className="text-base">
          {number}
        </Text>
      </View>
      <View className="flex-1 items-center">
        <Text variant="label" numberOfLines={1} className={cn('font-inter', !middle && 'text-dim')}>
          {middle ?? '–'}
        </Text>
      </View>
      <Cell
        value={kg}
        active={selected && field === 'kg'}
        pristine={pristine}
        label={t('table.weightCell')}
        onPress={() => onSelect('kg')}
      />
      <Cell
        value={reps}
        active={selected && field === 'reps'}
        pristine={pristine}
        label={t('table.repsCell')}
        onPress={() => onSelect('reps')}
      >
        {rir != null ? <RirBadge rir={rir} className="absolute -right-1.75 -bottom-1.75" /> : null}
      </Cell>
      <PressableScale
        haptic={done ? 'tap' : 'press'}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={t('table.done')}
        onPress={onToggleDone}
        className="w-7 items-end"
      >
        <View
          className={cn(
            'size-6 items-center justify-center rounded-full',
            done ? 'bg-accent' : 'border-2 border-track',
          )}
        >
          {done ? <Icon name="check" size={11} color={colors.onAccent} /> : null}
        </View>
      </PressableScale>
    </Pressable>
  );
}
