import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/shared/lib/theme';
import { CheckBadge } from '@/shared/ui/check-item';
import { Text } from '@/shared/ui/text';

export interface DayStatusProps {
  /** Done (check badge), up next (accent clock), or coming after it (grey clock). */
  kind: 'done' | 'next' | 'later';
  label: string;
  /** A second line under the label, e.g. "Training 2 von 3". */
  detail?: string;
}

/** Status line of a Today card: its badge, the label and an optional line under it. */
export function DayStatus({ kind, label, detail }: DayStatusProps) {
  const color = kind === 'later' ? colors.subtle : colors.accent;
  return (
    <View className="flex-row items-center gap-2.5">
      {kind === 'done' ? (
        <CheckBadge size={22} glyph={11} />
      ) : (
        <View
          className="size-5.5 items-center justify-center rounded-full border-[1.8px]"
          style={{ borderColor: color }}
        >
          <Svg width={11} height={11} viewBox="0 0 14 14">
            <Path
              d="M7 3.5V7l2.4 1.6"
              stroke={color}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      )}
      <View className="min-w-0 flex-1">
        <Text variant="caption" tone={kind === 'later' ? 'secondary' : 'accent'} numberOfLines={1}>
          {label}
        </Text>
        {detail ? (
          <Text variant="caption" tone="subtle" numberOfLines={1} className="font-inter-medium">
            {detail}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
