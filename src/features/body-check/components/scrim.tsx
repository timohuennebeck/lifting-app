import { useId } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export interface ScrimProps {
  /** Edge the gradient is darkest at. */
  edge: 'top' | 'bottom';
  height: number;
  opacity: number;
  /** Share of the height that stays fully dark before fading (0–1). */
  solid?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/** Edge gradient that keeps controls legible on top of photos and the camera feed. */
export function Scrim({ edge, height, opacity, solid = 0, color = 'black', style }: ScrimProps) {
  // SVG url() references choke on the punctuation React puts into ids.
  const id = `scrim${useId().replace(/[^\w-]/g, '')}`;
  return (
    <View
      pointerEvents="none"
      style={[{ position: 'absolute', left: 0, right: 0, height, [edge]: 0 }, style]}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient
            id={id}
            x1="0"
            y1={edge === 'top' ? 0 : 1}
            x2="0"
            y2={edge === 'top' ? 1 : 0}
          >
            <Stop offset={0} stopColor={color} stopOpacity={opacity} />
            <Stop offset={solid} stopColor={color} stopOpacity={opacity} />
            <Stop offset={1} stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
