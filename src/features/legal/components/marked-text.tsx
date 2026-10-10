import { Fragment, useEffect, useRef, useState } from 'react';
import { type AccessibilityRole, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Text, type TextTone, type TextVariant } from '@/shared/ui/text';

import type { DiffSegment } from '../lib/legal-diff';

type Change = DiffSegment['change'];

interface Piece {
  text: string;
  change: Change;
}

/** A word as laid out: its pieces (a change can end mid-word, before a full stop) and the
 * whitespace after it. */
interface Word {
  pieces: Piece[];
  space: string;
}

/**
 * The segments word by word. A removed passage running straight into the new one gets a space,
 * so the strike-through and the neon don't touch.
 */
function toWords(segments: DiffSegment[]): Word[] {
  const words: Word[] = [];
  // The word still taking pieces: no whitespace since its last one.
  let open: Word | null = null;
  for (const { text, change } of segments) {
    for (const run of text.match(/\s+|\S+/g) ?? []) {
      if (/^\s/.test(run)) {
        if (words.length) words[words.length - 1].space += run;
        open = null;
        continue;
      }
      const last = open?.pieces.at(-1);
      if (last && last.change === change) {
        last.text += run;
      } else if (open && !(last?.change && change)) {
        open.pieces.push({ text: run, change });
      } else {
        if (open) open.space = ' ';
        open = { pieces: [{ text: run, change }], space: '' };
        words.push(open);
      }
    }
  }
  return words;
}

/** The line (its y) each word with a change landed on, measured once laid out. */
function useLines() {
  const [lines, setLines] = useState<number[]>([]);
  const measured = useRef<number[]>([]);
  const frame = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (frame.current != null) cancelAnimationFrame(frame.current);
    },
    [],
  );
  const report = (word: number, y: number) => {
    if (measured.current[word] === y) return;
    measured.current[word] = y;
    // One update for all the words of a block.
    frame.current ??= requestAnimationFrame(() => {
      frame.current = null;
      setLines([...measured.current]);
    });
  };
  return [lines, report] as const;
}

export interface MarkedTextProps {
  segments: DiffSegment[];
  variant?: TextVariant;
  tone?: TextTone;
  textClassName?: string;
  className?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel: string;
}

/**
 * Text with new words on rounded neon, like the app's chips. Native text can't round a
 * highlight inside a line, so the words are laid out one by one and the neon of neighbouring
 * new words joins into one pill per line.
 */
export function MarkedText({
  segments,
  variant,
  tone,
  textClassName,
  className,
  accessibilityRole,
  accessibilityLabel,
}: MarkedTextProps) {
  const words = toWords(segments);
  const [lines, report] = useLines();
  // Word i's change carries on into word i + 1 on the same line: one pill, one strike-through.
  const joins = (i: number) => {
    const change = words[i]?.pieces.at(-1)?.change;
    return !!change && words[i + 1]?.pieces[0].change === change && lines[i] === lines[i + 1];
  };

  return (
    <View
      accessible
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      className={cn('flex-row flex-wrap', className)}
    >
      {words.map((word, i) => (
        <View
          key={i}
          className="flex-row"
          onLayout={
            word.pieces.some((p) => p.change) ? (e) => report(i, e.nativeEvent.layout.y) : undefined
          }
        >
          {word.pieces.map((piece, j) => {
            const last = j === word.pieces.length - 1;
            const space = last ? word.space : '';
            if (!piece.change) {
              return (
                <Text key={j} variant={variant} tone={tone} className={textClassName}>
                  {piece.text + space}
                </Text>
              );
            }
            // Joined, the space is part of the pill or strike-through; otherwise it stays plain.
            const joined = last && joins(i);
            const text = joined ? piece.text + space : piece.text;
            return (
              <Fragment key={j}>
                {piece.change === 'added' ? (
                  // 2 px wider than the word where a space follows or precedes it, without
                  // moving the text; mid-word (", bevor") it would cover the letter next to it.
                  <View
                    className={cn(
                      'my-px bg-accent',
                      j === 0 && '-ml-0.5 pl-0.5',
                      last && '-mr-0.5 pr-0.5',
                      !(j === 0 && joins(i - 1)) && 'rounded-l-md',
                      !joined && 'rounded-r-md',
                    )}
                  >
                    <Text variant={variant} className={cn(textClassName, '-my-px text-on-accent')}>
                      {text}
                    </Text>
                  </View>
                ) : (
                  <Text
                    variant={variant}
                    tone={tone}
                    className={cn(textClassName, 'text-dim line-through')}
                  >
                    {text}
                  </Text>
                )}
                {space && !joined ? (
                  <Text variant={variant} tone={tone} className={textClassName}>
                    {space}
                  </Text>
                ) : null}
              </Fragment>
            );
          })}
        </View>
      ))}
    </View>
  );
}
