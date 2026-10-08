import type { PlanSetDraft } from '@/shared/data/templates';
import { formatNumber } from '@/shared/lib/format';

/** Steps in the "Import plan" branch. */
export const IMPORT_STEPS = 3;

/** "4 × 6–8": set count × rep range of the first set. */
export function formatScheme(sets: PlanSetDraft[]) {
  const first = sets[0];
  if (!first) return '0';
  const reps =
    first.repsMin === first.repsMax ? `${first.repsMin}` : `${first.repsMin}–${first.repsMax}`;
  return `${sets.length} × ${reps}`;
}

export function formatFileSize(bytes: number) {
  return bytes >= 1048576
    ? `${formatNumber(bytes / 1048576, 1)} MB`
    : `${formatNumber(Math.max(1, Math.round(bytes / 1024)), 0)} KB`;
}

/** Upper-case file extension, e.g. "PDF"; falls back to the MIME subtype. */
export function fileExtension(name: string, mimeType: string | null) {
  const ext = /\.([a-z0-9]+)$/i.exec(name)?.[1];
  return (ext ?? mimeType?.split('/')[1] ?? 'file').slice(0, 4).toUpperCase();
}
