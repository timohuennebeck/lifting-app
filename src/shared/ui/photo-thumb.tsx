import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface PhotoThumbProps {
  /** None: an empty slot with a plus, for the photo still to take. */
  uri?: string;
  label: string;
  accessibilityLabel: string;
  selected: boolean;
  /** Over a photo shown full screen: the shown one is ringed white, not in the accent. */
  viewing?: boolean;
  /** Ring of an unselected thumbnail instead of the hairline, e.g. a warning. */
  ringColor?: string;
  /** In the photo's bottom-right corner, e.g. a check. */
  badge?: ReactNode;
  onPress: () => void;
}

function ringOf(selected: boolean, viewing: boolean, ringColor: string | undefined) {
  if (selected) return `inset 0 0 0 2px ${viewing ? colors.fg : colors.accent}`;
  if (ringColor) return `inset 0 0 0 1.5px ${ringColor}`;
  return 'inset 0 0 0 1px rgba(255,255,255,0.18)';
}

/** A photo thumbnail with its label, in the camera's strips (progress check, plan import). */
export function PhotoThumb({
  uri,
  label,
  accessibilityLabel,
  selected,
  viewing = false,
  ringColor,
  badge,
  onPress,
}: PhotoThumbProps) {
  return (
    <PressableScale
      haptic="select"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={onPress}
      className="items-center gap-2"
    >
      <View
        className="h-18.5 w-14 rounded-xl bg-surface p-1.5"
        style={{ boxShadow: ringOf(selected, viewing, ringColor) }}
      >
        <View className="flex-1 items-center justify-center overflow-hidden rounded-md bg-raised">
          {uri ? (
            <>
              <Image source={{ uri }} contentFit="cover" style={StyleSheet.absoluteFill} />
              {badge ? <View className="absolute right-0.75 bottom-0.75">{badge}</View> : null}
            </>
          ) : (
            <Icon name="plus" size={12} color={colors.subtle} />
          )}
        </View>
      </View>
      <Text
        variant="caption"
        tone={selected ? (viewing ? 'default' : 'accent') : 'muted'}
        className="tracking-[0.5px] uppercase"
      >
        {label}
      </Text>
    </PressableScale>
  );
}
