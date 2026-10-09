import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { type CSSAnimationKeyframes } from 'react-native-reanimated';

import { colors, useAccentColor } from '@/shared/lib/theme';
import { Gradient } from '@/shared/ui/gradient';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

const GAP = 8;
const LOOP_SECONDS = 3.75;

export interface MarqueeChip {
  label: string;
  /** Lit chips turn accent with a check (the group is analysed). */
  on: boolean;
}

export interface GroupMarqueeProps {
  chips: MarqueeChip[];
}

/** Endless row of muscle-group chips that light up as the analysis advances. */
export function GroupMarquee({ chips }: GroupMarqueeProps) {
  const accent = useAccentColor();
  const [rowWidth, setRowWidth] = useState(0);
  // The row holds the chips twice; shifting by one copy loops seamlessly.
  const loop = useMemo<CSSAnimationKeyframes>(
    () => ({
      from: { transform: [{ translateX: 0 }] },
      to: { transform: [{ translateX: -(rowWidth + GAP) / 2 }] },
    }),
    [rowWidth],
  );
  return (
    <View>
      {/* A horizontal scroll view lets the row grow past the screen width. */}
      <ScrollView horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false}>
        <Animated.View
          onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
          className="flex-row"
          style={[
            { gap: GAP },
            rowWidth
              ? {
                  animationName: loop,
                  animationDuration: `${LOOP_SECONDS}s`,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'linear',
                }
              : null,
          ]}
        >
          {[...chips, ...chips].map((chip, i) => (
            <Animated.View
              key={i}
              className="h-8 flex-row items-center gap-1.5 rounded-full px-3"
              style={{
                backgroundColor: chip.on ? accent : 'rgba(255,255,255,0.08)',
                transitionProperty: 'backgroundColor',
                transitionDuration: '0.4s',
              }}
            >
              <Text variant="caption" tone={chip.on ? 'onAccent' : 'muted'} numberOfLines={1}>
                {chip.label}
              </Text>
              {chip.on ? <Icon name="check" size={11} color={colors.onAccent} /> : null}
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>
      {/* Chips fade in and out over the outer 15 % on each side. */}
      <Gradient from="left" size="15%" />
      <Gradient from="right" size="15%" />
    </View>
  );
}
