import { useWindowDimensions, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { colors } from '@/shared/lib/theme';
import { Gradient } from '@/shared/ui/gradient';

/** 36pt fade on top of a pinned footer so scrolled content melts into it. */
export function FadeEdge() {
  return <Gradient from="bottom" style={{ left: 0, right: 0, top: -36, height: 36 }} />;
}

const GLOW = { width: 520, height: 420, top: -140 };

/** Soft accent glow behind the top of the paywall. */
export function TopGlow() {
  const { width } = useWindowDimensions();
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: GLOW.top, left: (width - GLOW.width) / 2 }}
    >
      <Svg width={GLOW.width} height={GLOW.height}>
        <Defs>
          <RadialGradient id="paywall-glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.accent} stopOpacity={0.22} />
            <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
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
