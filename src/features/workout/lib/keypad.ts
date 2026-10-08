// Keypad buffers hold plain numeric strings with "." as decimal mark.
export type KeypadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '.';

export const KEYPAD_ROWS: KeypadKey[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

const MAX_INT_DIGITS = { decimal: 4, integer: 3 } as const;

/** Appends a key; a pristine buffer is replaced by the first key press. */
export function appendKey(value: string, key: KeypadKey, decimal: boolean, pristine: boolean) {
  const current = pristine ? '' : value;
  if (key === '.') {
    if (!decimal || current.includes('.')) return current;
    return current === '' ? '0.' : `${current}.`;
  }
  const [int, fraction] = current.split('.');
  if (fraction !== undefined) return fraction.length >= 2 ? current : current + key;
  if (int === '0') return key;
  if (int.length >= MAX_INT_DIGITS[decimal ? 'decimal' : 'integer']) return current;
  return current + key;
}

export const backspace = (value: string) => value.slice(0, -1);

export function parseInput(value: string): number | null {
  if (value === '' || value === '.') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function toInput(value: number | null | undefined) {
  return value == null ? '' : String(Math.round(value * 100) / 100);
}

/** Adds a delta (e.g. ±2.5) and never goes below zero. */
export function nudgeInput(value: string, delta: number) {
  return toInput(Math.max(0, (parseInput(value) ?? 0) + delta));
}

/** Shows the buffer with the locale's decimal separator. */
export const displayInput = (value: string, separator: string) => value.replace('.', separator);
