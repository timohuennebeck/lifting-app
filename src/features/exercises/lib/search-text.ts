/** German letters as typed on keyboards without them: "druecken" for "drücken". */
const SPELLED_OUT: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue' };

/**
 * Text as the exercise search compares it: lower case, without accents, spaces and dashes, and
 * Hangul split into its letters, so a syllable still being typed matches: "Kurzhantel-
 * Schulterdrücken" → "kurzhantelschulterdrucken", "벤ㅊ" finds "벤치".
 */
export const searchText = (text: string) =>
  text
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\s\-‐–—.,'’()/]+/g, '');

/** The forms a name is found by: its `searchText`, and with ä, ö and ü spelled out. */
export function searchKeys(name: string) {
  const plain = searchText(name);
  const spelled = searchText(name.toLowerCase().replace(/[äöü]/g, (c) => SPELLED_OUT[c]));
  return spelled === plain ? [plain] : [plain, spelled];
}
