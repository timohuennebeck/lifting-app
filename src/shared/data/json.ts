/** Parses a JSON text column, falling back when empty or malformed. */
export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const nowIso = () => new Date().toISOString();

export { randomUUID as newId } from 'expo-crypto';
