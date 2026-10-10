import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect, Text } from 'react-native-svg';

import { colors } from '@/shared/lib/theme';

interface IconDef {
  viewBox: string;
  render: (color: string) => ReactNode;
}

const stroke = (d: string, width = 2) =>
  function StrokePath(color: string) {
    return (
      <Path
        d={d}
        stroke={color}
        strokeWidth={width}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

/** Circular arrow around "10": back (counter-clockwise) or forward, as in video players. */
const seek = (forward: boolean) =>
  function SeekIcon(color: string) {
    return (
      <>
        <Path
          d={
            forward
              ? 'M12 5A8 8 0 1 0 19.52 10.26M9.5 2.5L12 5 9.5 7.5'
              : 'M12 5A8 8 0 1 1 4.48 10.26M14.5 2.5L12 5l2.5 2.5'
          }
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Text
          x={12}
          y={15.9}
          fill={color}
          fontSize={7.5}
          fontFamily="Inter_700Bold"
          textAnchor="middle"
        >
          10
        </Text>
      </>
    );
  };

// Icon set traced from the Forge design file.
const ICONS = {
  'chevron-left': { viewBox: '0 0 10 16', render: stroke('M8 2L2 8l6 6', 2.8) },
  'chevron-left-thin': { viewBox: '0 0 10 16', render: stroke('M8 2L2 8l6 6', 2.2) },
  'chevron-right': { viewBox: '0 0 10 16', render: stroke('M2 2l6 6-6 6', 2.8) },
  'chevron-down': { viewBox: '0 0 14 14', render: stroke('M3 5.5l4 4 4-4') },
  close: { viewBox: '0 0 14 14', render: stroke('M2.5 2.5l9 9M11.5 2.5l-9 9', 2.2) },
  check: { viewBox: '0 0 14 14', render: stroke('M3 7.5l2.5 2.5L11 4.5', 2.4) },
  // Lighter tick for large sizes (the keypad's confirm key).
  'check-thin': { viewBox: '0 0 14 14', render: stroke('M3 7.5l2.5 2.5L11 4.5', 1.5) },
  plus: { viewBox: '0 0 14 14', render: stroke('M7 1v12M1 7h12', 2.2) },
  minus: { viewBox: '0 0 14 14', render: stroke('M2 7h10', 2.2) },
  'arrow-right': { viewBox: '0 0 18 16', render: stroke('M1 8h15M10 2l6 6-6 6', 2.2) },
  'arrow-up': { viewBox: '0 0 16 16', render: stroke('M8 13V3M3.5 7.5L8 3l4.5 4.5', 2.2) },
  // Opens something outside the app (e.g. the store's subscription page).
  'arrow-up-right': { viewBox: '0 0 16 16', render: stroke('M4.5 11.5l7-7M6 4.5h5.5V10', 1.8) },
  swap: {
    viewBox: '0 0 14 14',
    render: stroke('M1.5 4.5h10M9 2l2.5 2.5L9 7M12.5 9.5h-10M5 7l-2.5 2.5L5 12', 1.6),
  },
  refresh: { viewBox: '0 0 14 14', render: stroke('M12 7a5 5 0 1 1-1.5-3.6M12 1.5v3h-3', 1.6) },
  // A camera body with its lens (the "camera" icon is the viewfinder frame).
  'photo-camera': {
    viewBox: '0 0 22 18',
    render: (c) => (
      <>
        <Path
          d="M2 6a2.5 2.5 0 0 1 2.5-2.5h2.2L8.1 1.5h5.8l1.4 2h2.2A2.5 2.5 0 0 1 20 6v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 2 13.5z"
          stroke={c}
          strokeWidth={1.8}
          strokeLinejoin="round"
          fill="none"
        />
        <Circle cx={11} cy={9.6} r={3.3} stroke={c} strokeWidth={1.8} fill="none" />
      </>
    ),
  },
  stop: {
    viewBox: '0 0 14 14',
    render: (c) => <Rect x={2} y={2} width={10} height={10} rx={1.5} fill={c} />,
  },
  search: {
    viewBox: '0 0 16 16',
    render: (c) => (
      <>
        <Circle cx={7} cy={7} r={5.2} stroke={c} strokeWidth={1.8} fill="none" />
        <Path d="M11 11l3.5 3.5" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
      </>
    ),
  },
  settings: {
    viewBox: '0 0 20 20',
    render: (c) => (
      <>
        <Circle
          cx={10}
          cy={10}
          r={7.2}
          stroke={c}
          strokeWidth={3.4}
          strokeDasharray="2.83 2.83"
          fill="none"
        />
        <Circle cx={10} cy={10} r={5.2} stroke={c} strokeWidth={2} fill="none" />
      </>
    ),
  },
  timer: {
    viewBox: '0 0 16 18',
    render: (c) => (
      <>
        <Circle cx={8} cy={10.5} r={6.5} fill={c} />
        <Rect x={6} y={0.5} width={4} height={2.5} rx={1} fill={c} />
        <Path d="M8 7v3.5" stroke={colors.bg} strokeWidth={1.8} strokeLinecap="round" />
      </>
    ),
  },
  dumbbell: {
    viewBox: '0 0 18 14',
    render: (c) => (
      <>
        <Rect x={1} y={3} width={3.5} height={8} rx={1} fill={c} />
        <Rect x={13.5} y={3} width={3.5} height={8} rx={1} fill={c} />
        <Rect x={4.5} y={6} width={9} height={2} fill={c} />
      </>
    ),
  },
  star: {
    viewBox: '0 0 14 14',
    render: (c) => (
      <Path
        d="M7 1.8l1.6 3.3 3.6.5-2.6 2.5.6 3.6L7 10l-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z"
        fill={c}
        stroke={c}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    ),
  },
  play: {
    viewBox: '0 0 14 14',
    render: (c) => (
      <Path
        d="M5.2 3.9l5.6 3.1-5.6 3.1z"
        fill={c}
        stroke={c}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
    ),
  },
  mic: {
    viewBox: '0 0 14 18',
    render: (c) => (
      <>
        <Rect x={4} y={1} width={6} height={10} rx={3} fill={c} />
        <Path
          d="M1.5 8.5a5.5 5.5 0 0 0 11 0M7 14v3"
          stroke={c}
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
        />
      </>
    ),
  },
  camera: {
    viewBox: '0 0 22 22',
    render: stroke(
      'M2 7V4a2 2 0 0 1 2-2h3M15 2h3a2 2 0 0 1 2 2v3M20 15v3a2 2 0 0 1-2 2h-3M7 20H4a2 2 0 0 1-2-2v-3M6 11h10',
      2.2,
    ),
  },
  image: {
    viewBox: '0 0 20 18',
    render: (c) => (
      <>
        <Rect x={1} y={1} width={18} height={16} rx={3} stroke={c} strokeWidth={1.6} fill="none" />
        <Path
          d="M1 13l5-5 4 4 3-3 6 6"
          stroke={c}
          strokeWidth={1.6}
          fill="none"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  chart: {
    viewBox: '0 0 14 14',
    render: (c) => (
      <>
        <Rect x={1} y={6} width={3} height={7} rx={1} fill={c} />
        <Rect x={5.5} y={1} width={3} height={12} rx={1} fill={c} />
        <Rect x={10} y={4} width={3} height={9} rx={1} fill={c} />
      </>
    ),
  },
  info: {
    viewBox: '0 0 14 14',
    render: (c) => (
      <>
        <Circle cx={7} cy={7} r={5.7} fill="none" stroke={c} strokeWidth={1.6} />
        <Path d="M7 6.4v3.4" stroke={c} strokeWidth={1.6} strokeLinecap="round" />
        <Circle cx={7} cy={4.4} r={0.95} fill={c} />
      </>
    ),
  },
  // The "i" alone, for a round button that is its circle.
  'info-glyph': {
    viewBox: '0 0 14 14',
    render: (c) => (
      <>
        <Path d="M7 6.2v5" stroke={c} strokeWidth={2.2} strokeLinecap="round" />
        <Circle cx={7} cy={3.2} r={1.35} fill={c} />
      </>
    ),
  },
  'replay-10': { viewBox: '0 0 24 24', render: seek(false) },
  'forward-10': { viewBox: '0 0 24 24', render: seek(true) },
  target: {
    viewBox: '0 0 14 14',
    render: (c) => (
      <>
        <Circle cx={7} cy={7} r={5.5} fill="none" stroke={c} strokeWidth={1.6} />
        <Circle cx={7} cy={7} r={2.2} fill={c} />
      </>
    ),
  },
  eye: {
    viewBox: '0 0 20 14',
    render: (c) => (
      <>
        <Path
          d="M1 7s3.3-6 9-6 9 6 9 6-3.3 6-9 6-9-6-9-6z"
          stroke={c}
          strokeWidth={1.6}
          fill="none"
        />
        <Circle cx={10} cy={7} r={2.6} fill={c} />
      </>
    ),
  },
  backspace: {
    viewBox: '0 0 24 18',
    render: (c) => (
      <>
        <Path
          d="M8 1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H8L1 9z"
          fill="none"
          stroke={c}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Path d="M11 6l6 6M17 6l-6 6" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
      </>
    ),
  },
  // Keyboard with a chevron underneath: hide the keypad (like iOS' keyboard.chevron.compact.down).
  'keyboard-hide': {
    viewBox: '0 0 24 22',
    render: (c) => (
      <>
        <Rect
          x={1.5}
          y={1}
          width={21}
          height={13}
          rx={2.5}
          fill="none"
          stroke={c}
          strokeWidth={1.6}
        />
        <Path
          d="M5.5 5h1M9 5h1M12.5 5h1M16 5h1M5.5 8.5h1M9 8.5h1M12.5 8.5h1M16 8.5h1M8.5 11h7"
          stroke={c}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
        <Path
          d="M9 17.5l3 2.5 3-2.5"
          fill="none"
          stroke={c}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  more: {
    viewBox: '0 0 18 4',
    render: (c) => (
      <>
        <Circle cx={2} cy={2} r={2} fill={c} />
        <Circle cx={9} cy={2} r={2} fill={c} />
        <Circle cx={16} cy={2} r={2} fill={c} />
      </>
    ),
  },
  'more-vertical': {
    viewBox: '0 0 4 18',
    render: (c) => (
      <>
        <Circle cx={2} cy={2} r={2} fill={c} />
        <Circle cx={2} cy={9} r={2} fill={c} />
        <Circle cx={2} cy={16} r={2} fill={c} />
      </>
    ),
  },
  trash: {
    viewBox: '0 0 16 18',
    render: stroke('M1.5 4h13M6 4V2h4v2M3 4l1 12h8l1-12M6.5 7.5v5M9.5 7.5v5', 1.6),
  },
  pencil: { viewBox: '0 0 16 16', render: stroke('M11 2l3 3-8.5 8.5L2 14l.5-3.5z', 1.6) },
  bolt: {
    viewBox: '0 0 256 256',
    render: (c) => (
      <Path
        fill={c}
        d="M215.79,118.17a8,8,0,0,0-5-5.66L153.18,90.9l14.66-73.33a8,8,0,0,0-13.69-7l-112,120a8,8,0,0,0,3,13l57.63,21.61L88.16,238.43a8,8,0,0,0,13.69,7l112-120A8,8,0,0,0,215.79,118.17Z"
      />
    ),
  },
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICONS;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 16, color = colors.fg }: IconProps) {
  const icon: IconDef = ICONS[name];
  const [, , w, h] = icon.viewBox.split(' ').map(Number);
  return (
    <Svg width={size} height={(size * h) / w} viewBox={icon.viewBox}>
      {icon.render(color)}
    </Svg>
  );
}
