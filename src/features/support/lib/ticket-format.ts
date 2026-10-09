/** Epoch ms of a local ISO string or a synced Postgres timestamp (any fraction length). */
export function toMs(iso: string) {
  const ms = Date.parse(iso);
  if (!Number.isNaN(ms)) return ms;
  return Date.parse(iso.replace(' ', 'T').replace(/(\.\d{3})\d+/, '$1'));
}

/** First line of a message, used as the ticket subject. */
export const firstLine = (text: string) => text.trim().split('\n')[0]?.trim().slice(0, 120) ?? '';
