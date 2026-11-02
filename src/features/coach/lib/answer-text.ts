export interface TextPart {
  text: string;
  bold: boolean;
}

/**
 * An answer split into plain and **bold** parts, the only formatting the coach writes. While the
 * answer streams in, a bold part that isn't closed yet shows plain until its closing `**` comes.
 */
export function boldParts(text: string): TextPart[] {
  const parts: TextPart[] = [];
  const pieces = text.split('**');
  pieces.forEach((piece, i) => {
    const bold = i % 2 === 1 && i < pieces.length - 1;
    if (!piece) return;
    const last = parts.at(-1);
    if (last && last.bold === bold) last.text += piece;
    else parts.push({ text: piece, bold });
  });
  return parts;
}

/** The answer without its formatting, for previews. */
export const plainText = (text: string) => text.replaceAll('**', '');
