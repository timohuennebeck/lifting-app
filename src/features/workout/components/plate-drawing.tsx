import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { plateLook, type PlateCount } from '../lib/plates';

export interface PlateDrawingProps {
  /** Per side, heaviest first. */
  plates: PlateCount[];
  unit: 'kg' | 'lb';
  /** Without a bar the shaft isn't drawn. */
  withBar: boolean;
  width: number;
  /** 1 in the number pad (44 pt tall); bigger in the plates sheet. */
  scale?: number;
  /** Nothing to load yet: drawn faded. */
  faded?: boolean;
}

/**
 * One end of the bar: the shaft on the right, the collar, the plates heaviest first, the sleeve.
 */
export function PlateDrawing({
  plates,
  unit,
  withBar,
  width,
  scale = 1,
  faded,
}: PlateDrawingProps) {
  const thick = Math.sqrt(scale);
  const shaft = Math.round(width * 0.42);
  const gap = scale > 1 ? 3 : 1.5;
  const each = plates.flatMap(({ weight, count }) =>
    Array.from({ length: count }, (_, i) => ({
      key: `${weight}-${i}`,
      look: plateLook(weight, unit),
    })),
  );
  return (
    <View
      className={cn('relative shrink-0', faded && 'opacity-45')}
      style={{ width, height: 44 * scale }}
    >
      {withBar ? (
        <View
          className="absolute top-1/2 right-0 rounded-sm bg-track"
          style={{ width: shaft, height: 4 * thick, marginTop: -2 * thick }}
        />
      ) : null}
      <View
        className="absolute inset-y-0 flex-row-reverse items-center"
        style={{ right: shaft - 2, gap }}
      >
        <View
          className="rounded-[1.5px] bg-outline"
          style={{ width: 5 * thick, height: 12 * scale, marginLeft: gap }}
        />
        {each.map(({ key, look }) => (
          <View
            key={key}
            className="rounded-xs"
            style={{
              width: look.width * Math.max(1, scale * 0.75),
              height: look.height * scale,
              backgroundColor: look.color,
            }}
          />
        ))}
        <View className="rounded-l-xs bg-track" style={{ width: 18 * thick, height: 6 * thick }} />
      </View>
    </View>
  );
}
