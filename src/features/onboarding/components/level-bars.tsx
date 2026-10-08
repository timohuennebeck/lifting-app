import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { useAccentColor } from '@/shared/lib/theme';
import { DotPattern } from '@/shared/ui/dot-pattern';

const BAR_HEIGHTS = [8, 14, 20, 26];
const DIM = '#4A4A46';
const MID = '#B5B5AF';

export interface LevelBarsProps {
  /** 0-based level; bars up to and including it are lit. */
  level: number;
  selected: boolean;
}

/** Rising dotted bars badge for an experience level (design 00x). */
export function LevelBars({ level, selected }: LevelBarsProps) {
  const accent = useAccentColor();
  return (
    <View
      className={cn(
        'size-12 flex-row items-end justify-center gap-[3px] rounded-full pb-[11px]',
        selected ? 'bg-white/8' : 'bg-pill',
      )}
    >
      {BAR_HEIGHTS.map((height, i) => {
        const lit = i <= level;
        return (
          <DotPattern
            key={height}
            color={!lit ? DIM : selected ? accent : MID}
            radius={lit && selected ? 1.5 : 1.1}
            style={{ width: 5, height }}
          />
        );
      })}
    </View>
  );
}
