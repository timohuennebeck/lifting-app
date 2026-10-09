import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { PressableScale } from './pressable-scale';
import { RadioDot } from './radio-dot';
import { Text } from './text';

// Both designs draw the ring inside 16/18pt padding. The layout never changes between
// states: the selected ring is an overlay, so the card can't shift when it is picked.
const LOOKS = {
  // 1pt line at rest, 2pt accent ring when selected.
  card: {
    frame: 'border border-line py-3.75 pr-4.25 pl-3.75',
    ring: 'border-2',
    badge: 'bg-pill',
  },
  // Even 1.5pt ring (sheet rows): only its colour changes.
  sheet: {
    frame: 'border-[1.5px] border-line py-[14.5px] pr-[16.5px] pl-[14.5px]',
    ring: 'border-[1.5px]',
    badge: 'bg-control',
  },
} as const;

export interface OptionCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  /** Number in the 48pt badge on the left. */
  index?: number;
  /** Glyph in the badge instead of a number. */
  icon?: ReactNode;
  look?: keyof typeof LOOKS;
  /** Ring, badge and radio colour while selected; defaults to the accent. */
  tint?: string;
  className?: string;
}

/** Single-choice card with a badge and radio dot (Sex, Experience, Goal, sheet choices, …). */
export function OptionCard({
  title,
  description,
  selected,
  onPress,
  index,
  icon,
  look = 'card',
  tint,
  className,
}: OptionCardProps) {
  const styles = LOOKS[look];
  const tinted = selected && tint;
  return (
    <PressableScale
      // No press shrink: a choice card should stay put while it is picked.
      activeScale={1}
      haptic="select"
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={cn(
        'flex-row items-center gap-3.5 rounded-[22px] bg-surface',
        styles.frame,
        className,
      )}
    >
      {selected ? (
        <View
          pointerEvents="none"
          className={cn('absolute -inset-px rounded-[22px] border-accent', styles.ring)}
          style={tinted ? { borderColor: tint } : undefined}
        />
      ) : null}
      {icon !== undefined || index !== undefined ? (
        <View
          className={cn(
            'size-12 items-center justify-center rounded-full',
            selected ? 'bg-accent' : styles.badge,
          )}
          style={tinted ? { backgroundColor: tint } : undefined}
        >
          {icon ?? (
            <Text variant="headline" tone={selected ? 'onAccent' : 'default'} className="text-lg">
              {index}
            </Text>
          )}
        </View>
      ) : null}
      <View className="flex-1 gap-0.75">
        <Text variant="bodyStrong">{title}</Text>
        {description ? (
          <Text variant="paragraph" tone="subtle" className="text-sm leading-4.25">
            {description}
          </Text>
        ) : null}
      </View>
      <RadioDot selected={selected} color={tint} />
    </PressableScale>
  );
}
