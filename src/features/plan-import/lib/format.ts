import { formatNumber } from '@/shared/lib/format';

/** Steps in the "Import plan" branch. */
export const IMPORT_STEPS = 3;

const KB = 1024;
const MB = 1024 * KB;

export function formatFileSize(bytes: number) {
  return bytes >= MB
    ? `${formatNumber(bytes / MB, 1)} MB`
    : `${formatNumber(Math.max(1, Math.round(bytes / KB)), 0)} KB`;
}

/** Upper-case file extension, e.g. "PDF"; falls back to the MIME subtype. */
export function fileExtension(name: string, mimeType: string | null) {
  const ext = /\.([a-z0-9]+)$/i.exec(name)?.[1];
  return (ext ?? mimeType?.split('/')[1] ?? 'file').slice(0, 4).toUpperCase();
}
