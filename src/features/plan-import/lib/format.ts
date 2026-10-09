import type { PlanSetDraft } from '@/shared/data/templates';
import { formatNumber, formatTarget } from '@/shared/lib/format';

/** Steps in the "Import plan" branch. */
export const IMPORT_STEPS = 3;

/** "4 × 6–8" or "3 × 30–45 s": set count × target range of the first set. */
export function formatScheme(sets: PlanSetDraft[], timed: boolean) {
  const first = sets[0];
  if (!first) return '0';
  return `${sets.length} × ${formatTarget(first.targetMin, first.targetMax, timed)}`;
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
