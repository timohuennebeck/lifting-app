import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { MuscleMap } from '@/shared/ui/muscle-map';
import { Text } from '@/shared/ui/text';

export type BodyPose = 'front' | 'left' | 'right' | 'back';

export interface BodyPhotoCardProps {
  label: string;
  score: number;
  pose: BodyPose;
  /** The latest check: accent ring, accent score and check badge. */
  latest?: boolean;
}

/**
 * Before/after tile of the Body tab. Check photos are not stored yet, so the
 * pose is shown as a body silhouette placeholder.
 */
export function BodyPhotoCard({ label, score, pose, latest }: BodyPhotoCardProps) {
  return (
    <View
      className={cn(
        'h-[250px] flex-1 overflow-hidden rounded-[22px] bg-surface',
        latest ? 'border-2 border-accent' : 'border border-white/8',
      )}
    >
      <View className={cn('absolute inset-0 p-4', !latest && 'opacity-60')}>
        <MuscleMap view={pose === 'back' ? 'back' : 'front'} />
      </View>
      <Svg style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 80 }}>
        <Defs>
          <LinearGradient id="photo-fade" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor="#000" stopOpacity={0.8} />
            <Stop offset="1" stopColor="#000" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#photo-fade)" />
      </Svg>
      <View className="absolute right-3 bottom-3 left-3 flex-row items-end justify-between">
        <View className="gap-0.5">
          <Text variant="caption" tone="secondary" className="text-xs">
            {label}
          </Text>
          <Text
            variant="headline"
            tone={latest ? 'accent' : 'default'}
            className="text-[28px] leading-[28px]"
          >
            {score}
          </Text>
        </View>
        {latest ? (
          <View className="size-[22px] items-center justify-center rounded-full bg-accent">
            <Icon name="check" size={11} color={colors.onAccent} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
