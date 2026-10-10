import * as WebBrowser from 'expo-web-browser';
import type { ReactNode } from 'react';
import { Linking, Text as RNText, View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { Text } from './text';

interface ListBlock {
  type: 'list';
  ordered: boolean;
  items: string[];
}

export type MarkdownBlock =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string }
  | ListBlock
  | { type: 'rule' };

/**
 * Splits Markdown into blocks: headings, paragraphs, quotes, bullet and numbered lists, rules.
 * Enough for legal texts; tables, images and code aren't supported.
 */
export function parseMarkdown(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let lines: string[] = [];
  let list = null as ListBlock | null;
  let quote = null as { type: 'quote'; text: string } | null;
  const close = () => {
    if (lines.length) blocks.push({ type: 'paragraph', text: lines.join(' ') });
    lines = [];
    list = null;
    quote = null;
  };
  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim();
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    const item = /^(?:([-*+])|\d+[.)])\s+(.+)$/.exec(line);
    const quoted = /^>\s?(.*)$/.exec(line);
    if (!line) {
      close();
    } else if (heading) {
      close();
      const level = Math.min(heading[1].length, 3) as 1 | 2 | 3;
      blocks.push({ type: 'heading', level, text: heading[2] });
    } else if (quoted) {
      // Consecutive quote lines form one quote.
      if (quote) quote.text += ` ${quoted[1]}`;
      else {
        close();
        quote = { type: 'quote', text: quoted[1] };
        blocks.push(quote);
      }
    } else if (/^([-*_])(\s*\1){2,}$/.test(line)) {
      close();
      blocks.push({ type: 'rule' });
    } else if (item) {
      const ordered = !item[1];
      if (lines.length || list?.ordered !== ordered) {
        close();
        list = { type: 'list', ordered, items: [] };
        blocks.push(list);
      }
      list!.items.push(item[2]);
    } else if (list && /^\s/.test(raw)) {
      // An indented line continues the last list item.
      list.items[list.items.length - 1] += ` ${line}`;
    } else {
      list = null;
      quote = null;
      lines.push(line);
    }
  }
  close();
  return blocks;
}

function openLink(url: string) {
  if (/^https?:/i.test(url)) void WebBrowser.openBrowserAsync(url);
  else void Linking.openURL(url);
}

const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\*(.+?)\*/g;

/** **bold**, *italic* and [links](url); nested spans inherit the paragraph's style. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index;
    if (at > last) out.push(text.slice(last, at));
    if (m[1] != null) {
      out.push(
        <RNText key={at} className="font-inter-semibold text-fg">
          {inline(m[1])}
        </RNText>,
      );
    } else if (m[2] != null) {
      const url = m[3];
      out.push(
        <RNText
          key={at}
          accessibilityRole="link"
          onPress={() => openLink(url)}
          className="text-accent underline"
        >
          {m[2]}
        </RNText>,
      );
    } else {
      out.push(
        <RNText key={at} className="italic">
          {m[4]}
        </RNText>,
      );
    }
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const HEADING = {
  1: { space: 'mt-6', type: 'text-[24px] leading-7.5' },
  2: { space: 'mt-6', type: 'text-[19px] leading-6' },
  3: { space: 'mt-4', type: 'text-base leading-5.5' },
} as const;

/** Text without its inline Markdown: **bold** and *italic* lose their stars, links keep their label. */
export const plainText = (text: string) =>
  text.replace(INLINE, (_, bold, label, _url, italic) => bold ?? label ?? italic ?? '');

export interface MarkdownProps {
  blocks: MarkdownBlock[];
  className?: string;
}

/** Renders parsed Markdown in the app's type styles. */
export function Markdown({ blocks, className }: MarkdownProps) {
  return (
    <View className={cn('gap-3', className)}>
      {blocks.map((block, i) => (
        <MarkdownBlockView key={i} block={block} />
      ))}
    </View>
  );
}

/** One block in the app's type styles (for pages that lay blocks out themselves). */
export function MarkdownBlockView({ block }: { block: MarkdownBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        <Text
          accessibilityRole="header"
          className={cn(
            'font-inter-semibold text-fg',
            HEADING[block.level].space,
            HEADING[block.level].type,
          )}
        >
          {inline(block.text)}
        </Text>
      );
    case 'paragraph':
      return (
        <Text variant="paragraph" tone="secondary">
          {inline(block.text)}
        </Text>
      );
    case 'quote':
      return (
        <View className="border-l-2 border-accent pl-3">
          <Text variant="paragraph" tone="muted">
            {inline(block.text)}
          </Text>
        </View>
      );
    case 'list':
      return (
        <View className="gap-1.5">
          {block.items.map((item, j) => (
            <View key={j} className="flex-row gap-2">
              <Text variant="paragraph" tone="subtle" className="min-w-4">
                {block.ordered ? `${j + 1}.` : '•'}
              </Text>
              <Text variant="paragraph" tone="secondary" className="flex-1">
                {inline(item)}
              </Text>
            </View>
          ))}
        </View>
      );
    case 'rule':
      return <View className="my-2 h-px bg-white/8" />;
  }
}

/** Heading spacing and sizes, for pages that draw headings of their own. */
export const MARKDOWN_HEADING = HEADING;
