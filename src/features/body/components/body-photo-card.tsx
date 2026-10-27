import type { ReactNode } from 'react';
import { View } from 'react-native';

import { CheckPhoto } from '@/features/progress-check/components/check-photo';
import type { Pose } from '@/features/progress-check/lib/poses';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { CheckBadge } from '@/shared/ui/check-item';
import { ComparePhotoCard } from '@/shared/ui/compare-photo-card';
import { Icon } from '@/shared/ui/icon';
import { MuscleMap } from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface BodyPhotoCardProps {
  checkId: string;
  pose: Pose;
  storagePath?: string;
  label: string;
  score: number;
  /** Beside the score: the weight at the check, e.g. "84,2 kg". */
  weight?: string;
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
 * Before/after tile of the Körper tab and the compare page with the check's photo of the
 * selected pose. Falls back to a body silhouette while the photo is not available on this device.
 */
export function BodyPhotoCard({
  checkId,
  pose,
  storagePath,
  label,
  score,
  weight,
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
        className={cn('h-62.5 w-full', faded && 'opacity-45')}
      >
        <ComparePhotoCard
          photo={
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
          }
          label={label}
          score={score}
          weight={weight}
          after={after}
          muted={muted}
          trailing={done ? <CheckBadge size={22} glyph={11} /> : null}
          className={cn(
            'flex-1 rounded-[18px]',
            selected ? 'border-2 border-accent' : 'border border-white/8',
          )}
        >
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
        </ComparePhotoCard>
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
  /** E.g. "Jetzt starten", or from when it can start. */
  note: string;
  /** Not yet: a check a week at most. */
  disabled?: boolean;
  onPress: () => void;
}

/** Empty tile beside the only check so far: starts the next one, once its week has come. */
export function NextCheckCard({ title, note, disabled, onPress }: NextCheckCardProps) {
  return (
    <CardSlot>
      <PressableScale
        haptic="press"
        activeScale={0.98}
        accessibilityLabel={`${title} · ${note}`}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        className="h-62.5 w-full items-center justify-center gap-1 rounded-[18px] bg-surface px-4"
      >
        <View
          className={cn(
            'mb-3 size-12 items-center justify-center rounded-full bg-elevated',
            disabled && 'opacity-40',
          )}
        >
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
