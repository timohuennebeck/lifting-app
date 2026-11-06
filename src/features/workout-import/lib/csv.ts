// Reads CSV and TSV files: the separator (comma, semicolon or tab, whichever the first line uses
// most outside quotes) and RFC 4180 fields (quotes with "" inside, line breaks in quoted fields).
// German Excel writes semicolons; Hevy and Strong write commas.

/** The first line's most used separator outside quotes. */
function detectDelimiter(text: string) {
  const counts: Record<string, number> = { ',': 0, ';': 0, '\t': 0 };
  let quoted = false;
  for (const ch of text.slice(0, 5000)) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted && ch === '\n') break;
    else if (!quoted && ch in counts) counts[ch] = counts[ch] + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

/** The file's rows as fields, trimmed; empty lines left out. */
export function parseCsv(text: string): string[][] {
  const source = text.replace(/^﻿/, '');
  const delimiter = detectDelimiter(source);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const endRow = () => {
    row.push(field);
    if (row.some((v) => v.trim() !== '')) rows.push(row.map((v) => v.trim()));
    row = [];
    field = '';
  };
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"' && source[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && source[i + 1] === '\n') i++;
      endRow();
    } else field += ch;
  }
  endRow();
  return rows;
}

/** A row as one CSV line (for the plan's text sent to read-plan). */
export const csvLine = (values: string[]) =>
  values.map((v) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(',');
