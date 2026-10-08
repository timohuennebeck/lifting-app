/** Elapsed clock that always shows hours, e.g. "0:07:20". */
export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  return `${h}:${m}:${String(s % 60).padStart(2, '0')}`;
}

/** Whole minutes between two ISO timestamps (at least 1). */
export function minutesBetween(fromIso: string, toIso: string | null) {
  if (!toIso) return 0;
  return Math.max(1, Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 60000));
}
