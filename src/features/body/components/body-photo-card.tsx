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
  storagePath?: string;
  label: string;
  score: number;
  /** The "after" check: accent score. */
  after?: boolean;
  /** Accent ring: the latest check, or the side being picked on the compare page. */
  selected?: boolean;
  /** Check badge in the corner (the latest check on the Körper tab). */
  done?: boolean;
  /** Toned down like a desaturated "before" shot. */
  muted?: boolean;
  /** Faded out: the side not being picked on the compare page. */
  faded?: boolean;
  /** "A" or "B" in the top-left corner (compare page). */
  badge?: 'A' | 'B';
  onPress: () => void;
  /** A pencil in the top-right corner, e.g. to pick other checks to compare. */
  onEdit?: () => void;
  editLabel?: string;
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
  after,
  selected,
  done,
  muted,
  faded,
  badge,
  onPress,
  onEdit,
  editLabel,
}: BodyPhotoCardProps) {
  return (
    <CardSlot>
      <PressableScale
        activeScale={0.98}
        haptic="select"
        accessibilityLabel={`${label}, ${score}`}
        accessibilityState={{ selected }}
        onPress={onPress}
        className={cn(
          'h-62.5 w-full overflow-hidden rounded-[22px] bg-surface',
          selected ? 'border-2 border-accent' : 'border border-white/8',
          faded && 'opacity-45',
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
        {muted ? <View pointerEvents="none" className="absolute inset-0 bg-black/25" /> : null}
        <Gradient from="bottom" size={80} color="black" opacity={0.8} />
        <View className="absolute right-3 bottom-3 left-3 flex-row items-end justify-between">
          <View className="gap-0.5">
            <Text variant="caption" tone="secondary" className="text-xs">
              {label}
            </Text>
            <Text
              variant="headline"
              tone={after ? 'accent' : 'default'}
              className="text-[28px] leading-7"
            >
              {score}
            </Text>
          </View>
          {done ? <CheckBadge size={22} glyph={11} /> : null}
        </View>
        {badge ? (
          <View
            className={cn(
              'absolute top-3 left-3 size-6.5 items-center justify-center rounded-full',
              badge === 'A' ? 'bg-fg' : 'bg-accent',
            )}
          >
            <Text variant="caption" tone="onAccent" className="font-inter-bold text-xs">
              {badge}
            </Text>
          </View>
        ) : null}
      </PressableScale>
      {/* Beside the card, not in it: a button can't sit inside another one (web). */}
      {onEdit ? (
        <PressableScale
          haptic="tap"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={editLabel}
          onPress={onEdit}
          className="absolute top-3 right-3 size-8 items-center justify-center rounded-full bg-black/45"
        >
          <Icon name="pencil" size={13} color={colors.fg} />
        </PressableScale>
      ) : null}
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

/** The accent arrow from the before to the after card, centred on their row. */
export function CompareArrow() {
  return (
    <View
      pointerEvents="none"
      className="absolute top-1/2 left-1/2 -mt-5 -ml-5 size-10 items-center justify-center rounded-full bg-accent"
    >
      <Icon name="arrow-right" size={16} color={colors.onAccent} />
    </View>
  );
}
