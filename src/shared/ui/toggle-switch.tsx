import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';

import { PressableScale } from './pressable-scale';

export interface ToggleSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  accessibilityLabel: string;
}

/** 50×30 pill switch with an accent track when on (design 00·P2 C·S). */
export function ToggleSwitch({ value, onChange, accessibilityLabel }: ToggleSwitchProps) {
  const knob = useAnimatedStyle(() => ({
    transform: [
      { translateX: withSpring(value ? 20 : 0, { mass: 1, damping: 26, stiffness: 260 }) },
    ],
  }));
  return (
    <PressableScale
      haptic="select"
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onChange(!value)}
      className={cn('h-7.5 w-12.5 rounded-full p-0.5', value ? 'bg-accent' : 'bg-[#333333]')}
    >
      <Animated.View
        className="size-6.5 rounded-full bg-fg"
        style={[knob, { boxShadow: '0 2px 6px rgba(0,0,0,0.35)' }]}
      />
    </PressableScale>
  );
}
