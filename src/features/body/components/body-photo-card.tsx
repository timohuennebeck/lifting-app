import type { ReactNode } from 'react';
import { View } from 'react-native';

import { CheckPhoto } from '@/features/body-check/components/check-photo';
import type { BodyPose } from '@/features/body-check/lib/poses';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { CheckBadge } from '@/shared/ui/check-item';
import { Gradient } from '@/shared/ui/gradient';
import { Icon } from '@/shared/ui/icon';
import { MuscleMap } from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';
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
 * Half of the card row. A flex box can't shrink below its own border and padding, so those
 * would make one card wider than the other; the slot has none and the card fills it.
 */
function CardSlot({ children }: { children: ReactNode }) {
  return <View className="min-w-0 flex-1">{children}</View>;
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
    <CardSlot>
      <View
        className={cn(
          'h-62.5 w-full overflow-hidden rounded-[22px] bg-surface',
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
    </CardSlot>
  );
}

export interface NextCheckCardProps {
  /** "Check 2" */
  title: string;
  /** E.g. "Jetzt starten". */
  note: string;
  onPress: () => void;
}

/** Empty tile beside the only check so far: starts the next one. */
export function NextCheckCard({ title, note, onPress }: NextCheckCardProps) {
  return (
    <CardSlot>
      <PressableScale
        haptic="press"
        activeScale={0.98}
        accessibilityLabel={`${title} · ${note}`}
        onPress={onPress}
        className="h-62.5 w-full items-center justify-center gap-1 rounded-[22px] bg-surface px-4"
      >
        <View className="mb-3 size-12 items-center justify-center rounded-full bg-elevated">
          <Icon name="plus" size={14} color={colors.fg} />
        </View>
        <Text variant="bodyStrong" className="text-center">
          {title}
        </Text>
        <Text variant="caption" tone="subtle" className="text-center font-inter">
          {note}
        </Text>
      </PressableScale>
    </CardSlot>
  );
}
