import { useState } from 'react';
import { View } from 'react-native';

import { SPEAKING } from '@/shared/hooks/use-voice-input';
import { cn } from '@/shared/lib/cn';

/** A bar's width and the gap after it. */
const BAR = 3;
const GAP = 2;
/** The tallest bar, and the shortest one still a bar rather than a dot. */
const TALL = 26;
const SHORT = 5;

/**
 * The recording's level over the last seconds (design "Hört zu"): the newest on the right, the
 * older ones moving left; quiet moments and the time before the first are dots.
 */
export function VoiceWave({ levels }: { levels: readonly number[] }) {
  const [width, setWidth] = useState(0);
  const slots = Math.max(0, Math.floor((width + GAP) / (BAR + GAP)));
  const shown = levels.slice(-slots);
  const before = slots - shown.length;
  return (
    <View
      className="h-7 min-w-0 flex-1 flex-row items-center justify-end overflow-hidden"
      style={{ gap: GAP }}
      onLayout={(e) => setWidth(Math.floor(e.nativeEvent.layout.width))}
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: slots }, (_, i) => {
        const level = i < before ? 0 : shown[i - before];
        const loud = level > SPEAKING;
        return (
          <View key={i} className="items-center" style={{ width: BAR }}>
            <View
              className={cn('rounded-full', loud ? 'bg-accent' : 'bg-dim')}
              style={
                loud
                  ? { width: BAR, height: SHORT + (TALL - SHORT) * level }
                  : { width: 2, height: 2 }
              }
            />
          </View>
        );
      })}
    </View>
  );
}
