import { memo } from 'react';
import Svg, { Path } from 'react-native-svg';

import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';

import { BODY, type BodyPartId, type BodyView } from './body-paths';

const FILL = { sil: '#181818', hd: '#2E2E2E', m: '#3E3E3E', fx: '#3E3E3E' } as const;

export interface MuscleMapProps {
  view: BodyView;
  selected?: readonly BodyPartId[];
  /** Lit in light grey: muscles that only help, beside the selected ones. */
  secondary?: readonly BodyPartId[];
  /** Makes muscles tappable; called with the tapped muscle. */
  onToggle?: (part: BodyPartId) => void;
  /** Limits which parts react to taps (default: all); keep it a stable function. */
  isSelectable?: (part: BodyPartId) => boolean;
  /** Highlight color; defaults to the accent (e.g. pass red for pain). */
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
  secondary = [],
  onToggle,
  isSelectable,
  viewBox,
  accent: accentOverride,
  fit = 'contain',
  width = '100%',
  height = '100%',
}: MuscleMapProps) {
  const accent = accentOverride ?? colors.accent;
  const art = BODY[view];
  const active = new Set(selected);
  const helping = new Set(secondary);

  return (
    <Svg
      width={width}
      height={height}
      viewBox={viewBox ?? art.viewBox}
      preserveAspectRatio={fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}
    >
      {art.paths.map((p, i) => {
        const muscle = p.muscle;
        const on = muscle !== null && active.has(muscle);
        const helps = muscle !== null && helping.has(muscle);
        const tappable = !!onToggle && !!muscle && (!isSelectable || isSelectable(muscle));
        return (
          <Path
            key={i}
            d={p.d}
            fill={on ? accent : helps ? colors.fg2 : FILL[p.kind]}
            stroke={p.kind === 'sil' ? '#2C2C2C' : undefined}
            strokeWidth={p.kind === 'sil' ? 2 : undefined}
            onPress={
              tappable
                ? () => {
                    haptics.select();
                    onToggle(muscle);
                  }
                : undefined
            }
          />
        );
      })}
    </Svg>
  );
});
