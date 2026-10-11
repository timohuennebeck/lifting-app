import { useState } from 'react';

/**
 * State that starts over at `initial` each time `visible` turns true, e.g. a sheet's picked
 * option or typed draft. Reset while rendering, so the sheet never shows the old value.
 */
export function useResetOnOpen<T>(visible: boolean, initial: T) {
  const [value, setValue] = useState(initial);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setValue(initial);
  }
  return [value, setValue] as const;
}
