import { useTranslation } from 'react-i18next';
import { type LayoutChangeEvent, Text as RNText, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { MARKDOWN_HEADING, MarkdownBlockView } from '@/shared/ui/markdown';
import { Text } from '@/shared/ui/text';

import type { DiffBlock, DiffSection, DiffSegment } from '../lib/legal-diff';

/** New words on neon, removed ones struck through in grey. */
function Segments({ segments }: { segments: DiffSegment[] }) {
  return segments.map((segment, i) =>
    segment.change === 'added' ? (
      <RNText key={i} className="bg-accent text-on-accent">
        {segment.text}
      </RNText>
    ) : segment.change === 'removed' ? (
      <RNText key={i} className="text-dim line-through">
        {segment.text}
      </RNText>
    ) : (
      <RNText key={i}>{segment.text}</RNText>
    ),
  );
}

/** What a screen reader says for a changed passage: the changes named, not just coloured. */
function useSpoken() {
  const { t } = useTranslation('common');
  return (segments: DiffSegment[]) =>
    segments
      .map((s) =>
        s.change === 'added'
          ? t('legal.compare.a11yNew', { text: s.text })
          : s.change === 'removed'
            ? t('legal.compare.a11yRemoved', { text: s.text })
            : s.text,
      )
      .join(' ');
}

function BlockView({ block }: { block: DiffBlock }) {
  const spoken = useSpoken();
  switch (block.type) {
    case 'same':
      return <MarkdownBlockView block={block.block} />;
    case 'paragraph':
      return (
        <Text variant="paragraph" tone="secondary" accessibilityLabel={spoken(block.segments)}>
          <Segments segments={block.segments} />
        </Text>
      );
    case 'quote':
      return (
        <View className="border-l-2 border-accent pl-3">
          <Text variant="paragraph" tone="muted" accessibilityLabel={spoken(block.segments)}>
            <Segments segments={block.segments} />
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
              <Text
                variant="paragraph"
                tone="secondary"
                className="flex-1"
                accessibilityLabel={spoken(item)}
              >
                <Segments segments={item} />
              </Text>
            </View>
          ))}
        </View>
      );
    case 'rule':
      return (
        <View className={cn('my-2 h-px', block.change === 'added' ? 'bg-accent' : 'bg-white/8')} />
      );
  }
}

export interface LegalDiffViewProps {
  sections: DiffSection[];
  /** Reports where each section sits, so the page can scroll to the one asked for. */
  onSectionLayout: (key: string, y: number) => void;
  className?: string;
}

/** The new version with everything changed since the compared one marked, section by section. */
export function LegalDiffView({ sections, onSectionLayout, className }: LegalDiffViewProps) {
  const spoken = useSpoken();
  return (
    <View className={cn('gap-3', className)}>
      {sections.map((section) => (
        <View
          key={section.key}
          className="gap-3"
          onLayout={(e: LayoutChangeEvent) => onSectionLayout(section.key, e.nativeEvent.layout.y)}
        >
          {section.heading ? (
            <Text
              accessibilityRole="header"
              accessibilityLabel={spoken(section.heading)}
              className={cn(
                'font-inter-semibold text-fg',
                MARKDOWN_HEADING[section.level === 3 ? 3 : 2],
              )}
            >
              <Segments segments={section.heading} />
            </Text>
          ) : null}
          {section.blocks.map((block, i) => (
            <BlockView key={i} block={block} />
          ))}
        </View>
      ))}
    </View>
  );
}
