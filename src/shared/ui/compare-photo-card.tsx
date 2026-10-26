import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Gradient } from '@/shared/ui/gradient';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

export interface ComparePhotoCardProps {
  /** Fills the card, e.g. an image with an absolute-fill style. */
  photo: ReactNode;
  /** Above the score: the date or the check's name. */
  label: string;
  score: number;
  /** Beside the score, e.g. "84,2 kg". */
  weight?: string;
  /** The "after" side: accent score and tag. */
  after?: boolean;
  /** Toned down like a desaturated "before" shot. */
  muted?: boolean;
  /** Pill in the top-left corner, e.g. "Vorher". */
  tag?: string;
  /** At the right end of the score row, e.g. a check badge. */
  trailing?: ReactNode;
  /** Size, corners and border. */
  className?: string;
  /** Drawn over the photo, e.g. a corner badge. */
  children?: ReactNode;
}

/**
 * One side of a before/after comparison: the photo, darkened towards the bottom where its label
 * sits over the score.
 */
export function ComparePhotoCard({
  photo,
  label,
  score,
  weight,
  after,
  muted,
  tag,
  trailing,
  className,
  children,
}: ComparePhotoCardProps) {
  return (
    <View className={cn('overflow-hidden bg-surface', className)}>
      {photo}
      {muted ? <View pointerEvents="none" className="absolute inset-0 bg-black/25" /> : null}
      <Gradient from="bottom" size={80} color="black" opacity={0.8} />
      <View className="absolute right-3 bottom-3 left-3 flex-row items-end justify-between">
        <View className="gap-0.5">
          <Text variant="caption" tone="secondary" className="text-xs">
            {label}
          </Text>
          <View className="flex-row items-baseline gap-2">
            <Text
              variant="headline"
              tone={after ? 'accent' : 'default'}
              className="text-[28px] leading-7"
            >
              {score}
            </Text>
            {weight ? (
              <Text variant="label" className="text-sm">
                {weight}
              </Text>
            ) : null}
          </View>
        </View>
        {trailing}
      </View>
      {tag ? (
        <View
          className={cn(
            'absolute top-3 left-3 rounded-full px-2.5 py-1.25',
            after ? 'bg-accent' : 'bg-pill',
          )}
        >
          <Text
            variant="caption"
            tone={after ? 'onAccent' : 'default'}
            className="text-[11px] leading-3.25 tracking-[1.1px] uppercase"
          >
            {tag}
          </Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

/**
 * The accent arrow from the before to the after card, centred over their row (which must be as
 * wide as its parent: the centring is a percentage of it).
 */
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
