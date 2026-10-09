import { View } from 'react-native';

import { CheckPhoto } from '@/features/body-check/components/check-photo';
import type { BodyPose } from '@/features/body-check/lib/poses';
import { cn } from '@/shared/lib/cn';
import { CheckBadge } from '@/shared/ui/check-item';
import { Gradient } from '@/shared/ui/gradient';
import { MuscleMap } from '@/shared/ui/muscle-map';
import { Text } from '@/shared/ui/text';

export interface BodyPhotoCardProps {
  checkId: string;
  pose: BodyPose;
  storagePath?: string | null;
  label: string;
  score: number;
  /** The latest check: accent ring, accent score and check badge. */
  latest?: boolean;
}

/**
 * Before/after tile of the Body tab with the check's photo of the selected pose.
 * Falls back to a body silhouette while the photo is not available on this device.
 */
export function BodyPhotoCard({
  checkId,
  pose,
  storagePath,
  label,
  score,
  latest,
}: BodyPhotoCardProps) {
  return (
    <View
      className={cn(
        'h-62.5 flex-1 overflow-hidden rounded-[22px] bg-surface',
        latest ? 'border-2 border-accent' : 'border border-white/8',
      )}
    >
      <CheckPhoto
        checkId={checkId}
        pose={pose}
        storagePath={storagePath}
        fallback={
          <View className="absolute inset-0 p-4 opacity-60">
            <MuscleMap view={pose === 'back' ? 'back' : 'front'} />
          </View>
        }
      />
      {/* Older photo is toned down like the design's desaturated "before" shot. */}
      {!latest ? <View pointerEvents="none" className="absolute inset-0 bg-black/25" /> : null}
      <Gradient from="bottom" size={80} color="black" opacity={0.8} />
      <View className="absolute right-3 bottom-3 left-3 flex-row items-end justify-between">
        <View className="gap-0.5">
          <Text variant="caption" tone="secondary" className="text-xs">
            {label}
          </Text>
          <Text
            variant="headline"
            tone={latest ? 'accent' : 'default'}
            className="text-[28px] leading-7"
          >
            {score}
          </Text>
        </View>
        {latest ? <CheckBadge size={22} glyph={11} /> : null}
      </View>
    </View>
  );
}
