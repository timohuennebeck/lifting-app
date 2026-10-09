import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/shared/lib/theme';
import { CheckBadge } from '@/shared/ui/check-item';
import { Text } from '@/shared/ui/text';

export interface DayStatusProps {
  kind: 'done' | 'planned';
  label: string;
}

/** Accent status line of a Today card: check badge (done) or clock ring (planned). */
export function DayStatus({ kind, label }: DayStatusProps) {
  return (
    <View className="flex-row items-center gap-2">
      {kind === 'done' ? (
        <CheckBadge size={22} glyph={11} />
      ) : (
        <View
          className="size-5.5 items-center justify-center rounded-full border-[1.8px]"
          style={{ borderColor: colors.accent }}
        >
          <Svg width={11} height={11} viewBox="0 0 14 14">
            <Path
              d="M7 3.5V7l2.4 1.6"
              stroke={colors.accent}
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
  );
}
