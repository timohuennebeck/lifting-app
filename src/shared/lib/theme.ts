// Hex values mirroring global.css for places that need raw colors (SVG, native props).
export const colors = {
  bg: '#0A0A0A',
  control: '#262626',
  line: '#2A2A28',
  track: '#3A3A38',
  chip: '#1A1A1A',
  fg: '#F4F4F0',
  fgMid: '#D6D6D1',
  fg2: '#C9C9C4',
  muted: '#A3A39E',
  subtle: '#8C8C87',
  dim: '#6E6E6A',
  outline: '#4A4A46',
  /** The one accent: neon (mirrors --color-accent). */
  accent: '#DFFF1F',
  onAccent: '#0A0A0A',
  red: '#ED4042',
  /** Reps in reserve, and a suggestion that went down (mirrors --color-amber). */
  amber: '#F9AD26',
  /** The number pad's panel (mirrors --color-surface). */
  surface: '#141414',
  /** Amber for things the plan import wasn't sure about (design 05b). */
  review: '#FFB547',
  /** iOS' text selection highlight (system blue). */
  selection: 'rgba(10,132,255,0.35)',
  sheet: '#0F0F0F',
  ink: '#1C1A16',
  /** On the white Sign in with Apple button. */
  black: '#000000',
  /** Text on Google's sign-in button (mirrors --color-google-fg). */
  googleFg: '#E3E3E3',
} as const;
