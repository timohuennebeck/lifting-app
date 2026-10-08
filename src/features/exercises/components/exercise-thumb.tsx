import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

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

export const initialsOf = (name: string) =>
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
    <View className={cn('h-[58px] w-11 overflow-hidden rounded-[5px] bg-[#1E1E1E]', className)}>
      {image ? (
        <Image source={image} contentFit="cover" style={StyleSheet.absoluteFill} />
      ) : (
        <>
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <Pattern
                id="thumb-stripes"
                width={12}
                height={12}
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <Rect width={6} height={12} fill="#1E1E1E" />
                <Rect x={6} width={6} height={12} fill="#232323" />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#thumb-stripes)" />
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
