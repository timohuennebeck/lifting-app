import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, useAccentColor } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

export interface DayStatusProps {
  kind: 'done' | 'planned';
  label: string;
  trailing?: ReactNode;
}

/** Accent status line of a Today card: check badge (done) or clock ring (planned). */
export function DayStatus({ kind, label, trailing }: DayStatusProps) {
  const accent = useAccentColor();
  return (
    <View className="flex-row items-center justify-between gap-2">
      <View className="flex-row items-center gap-2">
        {kind === 'done' ? (
          <View className="size-5.5 items-center justify-center rounded-full bg-accent">
            <Icon name="check" size={11} color={colors.onAccent} />
          </View>
        ) : (
          <View
            className="size-5.5 items-center justify-center rounded-full border-[1.8px]"
            style={{ borderColor: accent }}
          >
            <Svg width={11} height={11} viewBox="0 0 14 14">
              <Path
                d="M7 3.5V7l2.4 1.6"
                stroke={accent}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        )}
        <Text variant="caption" tone="accent">
          {label}
        </Text>
      </View>
      {trailing}
    </View>
  );
}
