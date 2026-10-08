import { useState } from 'react';

/** Remembers the last non-null value, so closing sheets keep their copy while animating out. */
export function useLastDefined<T>(value: T | null | undefined): T | null {
  const [last, setLast] = useState<T | null>(value ?? null);
  if (value != null && value !== last) setLast(value);
  return value ?? last;
}
