import { useWindowDimensions, View } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors, useAccentColor } from '@/shared/lib/theme';

/** 36pt fade on top of a pinned footer so scrolled content melts into it. */
export function FadeEdge() {
  return (
    <View pointerEvents="none" className="absolute inset-x-0 h-9" style={{ top: -36 }}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="paywall-fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.bg} stopOpacity={0} />
            <Stop offset="1" stopColor={colors.bg} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#paywall-fade)" />
      </Svg>
    </View>
  );
}

const GLOW = { width: 520, height: 420, top: -140 };

/** Soft accent glow behind the top of the paywall. */
export function TopGlow() {
  const accent = useAccentColor();
  const { width } = useWindowDimensions();
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: GLOW.top, left: (width - GLOW.width) / 2 }}
    >
      <Svg width={GLOW.width} height={GLOW.height}>
        <Defs>
          <RadialGradient id="paywall-glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={accent} stopOpacity={0.22} />
            <Stop offset="1" stopColor={accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse
          cx={GLOW.width / 2}
          cy={GLOW.height / 2}
          rx={GLOW.width / 2}
          ry={GLOW.height / 2}
          fill="url(#paywall-glow)"
        />
      </Svg>
    </View>
  );
}
