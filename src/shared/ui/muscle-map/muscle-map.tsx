import { memo } from 'react';
import Svg, { G, Path } from 'react-native-svg';

import { haptics } from '@/shared/lib/haptics';
import { useAccentColor } from '@/shared/lib/theme';

import { BODY, type BodyPartId, type BodyView } from './body-paths';

const FILL = { sil: '#181818', hd: '#2E2E2E', m: '#3E3E3E', fx: '#3E3E3E' } as const;

export interface MuscleMapProps {
  view: BodyView;
  selected?: readonly BodyPartId[];
  /** Makes muscles tappable; called with the tapped muscle. */
  onToggle?: (part: BodyPartId) => void;
  /** Highlight color; defaults to the user's accent (e.g. pass red for pain). */
  accent?: string;
  /** Crops to a region, e.g. MUSCLE_CARDS[id].viewBox. */
  viewBox?: string;
  /** 'cover' fills the box and crops, like CSS object-fit. */
  fit?: 'contain' | 'cover';
  width?: number | `${number}%`;
  height?: number | `${number}%`;
}

/** Native port of the design's <muscle-map> web component. */
export const MuscleMap = memo(function MuscleMap({
  view,
  selected = [],
  onToggle,
  viewBox,
  accent: accentOverride,
  fit = 'contain',
  width = '100%',
  height = '100%',
}: MuscleMapProps) {
  const userAccent = useAccentColor();
  const accent = accentOverride ?? userAccent;
  const art = BODY[view];
  const active = new Set(selected);

  return (
    <Svg
      width={width}
      height={height}
      viewBox={viewBox ?? art.viewBox}
      preserveAspectRatio={fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}
    >
      <G>
        {art.paths.map((p, i) => {
          const on = p.muscle !== null && active.has(p.muscle);
          const muscle = p.muscle;
          return (
            <Path
              key={i}
              d={p.d}
              fill={on ? accent : FILL[p.kind]}
              stroke={p.kind === 'sil' ? '#2C2C2C' : undefined}
              strokeWidth={p.kind === 'sil' ? 2 : undefined}
              onPress={
                onToggle && muscle
                  ? () => {
                      haptics.select();
                      onToggle(muscle);
                    }
                  : undefined
              }
            />
          );
        })}
      </G>
    </Svg>
  );
});
