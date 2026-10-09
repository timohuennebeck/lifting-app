import { useSettingsStore } from '@/shared/stores/settings-store';

// Hex values mirroring global.css for places that need raw colors (SVG, native props).
export const colors = {
  bg: '#0A0A0A',
  control: '#262626',
  raised: '#1E1E1E',
  line: '#2A2A28',
  track: '#3A3A38',
  fg: '#F4F4F0',
  fgSoft: '#E6E6E1',
  fgMid: '#D6D6D1',
  fg2: '#C9C9C4',
  muted: '#A3A39E',
  subtle: '#8C8C87',
  dim: '#6E6E6A',
  outline: '#4A4A46',
  onAccent: '#0A0A0A',
  danger: '#E08A7A',
  red: '#ED4042',
  /** Amber for things the plan import wasn't sure about (design 05b). */
  review: '#FFB547',
  sheet: '#0F0F0F',
  ink: '#1C1A16',
} as const;

export function useAccentColor() {
  return useSettingsStore((state) => state.accent);
}
