import type { ReactNode } from 'react';
import { View } from 'react-native';

import { clamp } from '@/shared/lib/math';
import { Gradient } from '@/shared/ui/gradient';
import { Text } from '@/shared/ui/text';

import { POSES } from '../lib/poses';

const TILE_MIN = 120;
const TILE_MAX = 216;
/** Side padding and gaps of the tile row (px-4, gap-2.5). */
const ROW_CHROME = 32 + 2 * 10;

/** Height of a tile in the row of three poses: 2:3, at most TILE_MAX and `room`. */
export function photoTileHeight(windowWidth: number, room = Infinity) {
  const width = (windowWidth - ROW_CHROME) / POSES.length;
  return clamp(Math.min(width * 1.5, room), TILE_MIN, TILE_MAX);
}

export interface PhotoTileProps {
  /** The photo (and anything drawn on it), filling the tile. */
  children: ReactNode;
  label: string;
  /** Right of the label, e.g. a check badge. */
  trailing?: ReactNode;
}

/** A pose photo in the row of three, named at the bottom (assessment and result, design 08c-H). */
export function PhotoTile({ children, label, trailing }: PhotoTileProps) {
  return (
    <View className="flex-1 overflow-hidden rounded-[22px] bg-surface">
      {children}
      <Gradient from="bottom" size={70} color="black" opacity={0.75} />
      <View
        pointerEvents="none"
        className="absolute inset-0 rounded-[22px] border border-white/10"
      />
      <View className="absolute right-3 bottom-3 left-3 flex-row items-center justify-between">
        <Text variant="label" className="text-sm">
          {label}
        </Text>
        {trailing}
      </View>
    </View>
  );
}
