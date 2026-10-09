import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { getExercise } from '@/shared/data/exercises';
import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/text';

export interface ExerciseThumbProps {
  exerciseId: string;
  /** Localized name; its initials fill the placeholder when there is no photo. */
  name: string;
  className?: string;
  initialsClassName?: string;
}

/** Lighter band of the design's `repeating-linear-gradient(135deg, #1E1E1E 0 6px, #232323 6px 12px)`. */
const STRIPE = '#232323';
const BAND = 6;
// The bands as one path (an SVG pattern renders unreliably on iOS): each runs bottom-left to
// top-right, 6pt wide, every 12pt, far enough to cover the largest tile (the detail hero).
const STRIPES = Array.from({ length: 60 }, (_, k) => {
  const from = (2 * k + 1) * BAND * Math.SQRT2;
  const to = from + BAND * Math.SQRT2;
  return `M${from + 900} -900L${to + 900} -900L${to - 900} 900L${from - 900} 900Z`;
}).join('');

const initialsOf = (name: string) =>
  name
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/** Exercise photo, or the design's striped tile with initials. */
export function ExerciseThumb({
  exerciseId,
  name,
  className,
  initialsClassName,
}: ExerciseThumbProps) {
  const image = getExercise(exerciseId)?.image;
  return (
    <View className={cn('h-14.5 w-11 overflow-hidden rounded-[5px] bg-raised', className)}>
      {image ? (
        <Image source={image} contentFit="cover" style={StyleSheet.absoluteFill} />
      ) : (
        <>
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Path d={STRIPES} fill={STRIPE} />
          </Svg>
          <View className="flex-1 items-center justify-center">
            <Text variant="caption" tone="subtle" className={cn('text-dim', initialsClassName)}>
              {initialsOf(name)}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}
