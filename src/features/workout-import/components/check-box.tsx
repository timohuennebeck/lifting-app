import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

/** The import's 26pt check box: filled accent with the design's 13 × 10 tick, or an empty frame. */
export function CheckBox({ checked, className }: { checked: boolean; className?: string }) {
  return (
    <View
      className={cn(
        'size-6.5 items-center justify-center rounded-lg border-2',
        checked ? 'border-transparent bg-accent' : 'border-[#3A3A3A]',
        className,
      )}
    >
      {checked ? (
        <Svg width={13} height={10} viewBox="0 0 13 10">
          <Path
            d="M1.5 5l3.5 3.5L11.5 1.5"
            stroke={colors.onAccent}
            strokeWidth={2.2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : null}
    </View>
  );
}
