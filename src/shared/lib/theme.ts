import { useSettingsStore } from '@/shared/stores/settings-store';

// Hex values mirroring global.css for places that need raw colors (SVG, native props).
export const colors = {
  bg: '#0A0A0A',
  surface: '#141414',
  elevated: '#1F1F1F',
  control: '#262626',
  raised: '#1E1E1E',
  pill: '#1C1C1C',
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
  sheet: '#0F0F0F',
  paper: '#EDEAE2',
  ink: '#1C1A16',
} as const;

export function useAccentColor() {
  return useSettingsStore((state) => state.accent);
}
