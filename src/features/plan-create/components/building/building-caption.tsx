import type { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/ui/text';

interface BuildingCaptionProps {
  line: string;
  elapsed: string;
  /** Above the line, e.g. a rep counter or a moving bar. */
  children?: ReactNode;
}

/** The bottom of a building variant: what is being done (fading in when it changes) and the time. */
export function BuildingCaption({ line, elapsed, children }: BuildingCaptionProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="absolute inset-x-0 items-center gap-2 px-6"
      style={{ bottom: Math.max(insets.bottom, 34) }}
    >
      {children}
      <Animated.View key={line} entering={FadeIn.duration(350)}>
        <Text variant="bodyStrong" className="text-center text-base" numberOfLines={1}>
          {line}
        </Text>
      </Animated.View>
      <Text className="font-inter text-xs text-subtle tabular-nums">{elapsed}</Text>
    </View>
  );
}
