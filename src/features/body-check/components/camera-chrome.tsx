import { type StyleProp, View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

const CORNERS = [
  'top-0 left-0 rounded-tl-xl border-t-[3px] border-l-[3px]',
  'top-0 right-0 rounded-tr-xl border-t-[3px] border-r-[3px]',
  'bottom-0 left-0 rounded-bl-xl border-b-[3px] border-l-[3px]',
  'right-0 bottom-0 rounded-br-xl border-r-[3px] border-b-[3px]',
];

/** Accent corner brackets that frame the body in the camera (design 08a). */
export function FramingCorners({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View pointerEvents="none" className="absolute" style={style}>
      {CORNERS.map((corner) => (
        <View key={corner} className={cn('absolute size-7.5 border-accent', corner)} />
      ))}
    </View>
  );
}

/** Two circling arrows: switch between front and back camera. */
export function FlipCameraIcon({ color = colors.fg }: { color?: string }) {
  return (
    <Svg width={20} height={18} viewBox="0 0 20 18">
      <Path
        d="M3 9a7 7 0 0 1 12.5-4.3M17 9a7 7 0 0 1-12.5 4.3"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M16 1.5v3.5h-3.5M4 16.5V13h3.5"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
