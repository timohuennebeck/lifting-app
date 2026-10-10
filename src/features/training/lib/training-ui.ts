import { rirColor } from '@/shared/lib/rir';

/** Set editor and picker: the RIR badge colours (red near failure, else amber); grey without. */
export function editorRirStyle(rir: number | null) {
  if (rir === null) return { bg: '#2E2E2C', dark: false };
  return { bg: rirColor(rir), dark: true };
}
