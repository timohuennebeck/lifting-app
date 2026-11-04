import { View } from 'react-native';

import type { MuscleShare } from '@/shared/data/muscles';
import { colors } from '@/shared/lib/theme';
import { MuscleCircle } from '@/shared/ui/muscle-map';

/** The circles are all one size, each further right overlapping the one before. */
const CIRCLE = 50;
const STEP = 33;
/** Width of three circles, kept for fewer too so the titles line up. */
const STACK_WIDTH = CIRCLE + 2 * STEP;

export interface MuscleStackProps {
  shares: MuscleShare[];
  /** The muscles in neon (the active plan's card). */
  highlight?: boolean;
}

/** The three muscles worked most as overlapping circles of one size, the biggest share in front. */
export function MuscleStack({ shares, highlight }: MuscleStackProps) {
  const accent = highlight ? colors.accent : colors.fg2;
  return (
    <View
      style={{ width: STACK_WIDTH, height: CIRCLE }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Drawn back to front, the biggest share in front; without exercises, one empty circle. */}
      {(shares.length ? shares.slice(0, 3) : [null])
        .map((share, i) => ({ share, left: i * STEP }))
        .reverse()
        .map(({ share, left }) => (
          <View
            key={share?.muscle ?? 'empty'}
            className="absolute top-0"
            style={{ left, width: CIRCLE, height: CIRCLE }}
          >
            {/* Each is cut out of the card behind it. */}
            <MuscleCircle
              muscle={share?.muscle ?? null}
              accent={accent}
              className="size-full border-2 border-surface"
            />
          </View>
        ))}
    </View>
  );
}
