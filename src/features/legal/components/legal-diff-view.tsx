import { useTranslation } from 'react-i18next';
import { type AccessibilityRole, type LayoutChangeEvent, Text as RNText, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { MARKDOWN_HEADING, MarkdownBlockView } from '@/shared/ui/markdown';
import { Text, type TextTone, type TextVariant } from '@/shared/ui/text';

import type { DiffBlock, DiffSection, DiffSegment } from '../lib/legal-diff';
import { MarkedText } from './marked-text';

/** What a screen reader says for a changed passage: the changes named, not just coloured. */
function useSpoken() {
  const { t } = useTranslation('common');
  const spokenSegment = ({ text, change }: DiffSegment) => {
    if (change === 'added') return t('legal.compare.a11yNew', { text });
    if (change === 'removed') return t('legal.compare.a11yRemoved', { text });
    return text;
  };
  return (segments: DiffSegment[]) => segments.map(spokenSegment).join(' ');
}

interface SegmentTextProps {
  segments: DiffSegment[];
  variant?: TextVariant;
  tone?: TextTone;
  textClassName?: string;
  className?: string;
  accessibilityRole?: AccessibilityRole;
}

/** Removed words struck through in grey, new ones on rounded neon. */
function SegmentText({ segments, className, textClassName, ...text }: SegmentTextProps) {
  const spoken = useSpoken()(segments);
  if (segments.some((s) => s.change === 'added')) {
    return (
      <MarkedText
        segments={segments}
        className={className}
        textClassName={textClassName}
        accessibilityLabel={spoken}
        {...text}
      />
    );
  }
  // Nothing on neon: plain text flows on its own.
  return (
    <Text {...text} className={cn(textClassName, className)} accessibilityLabel={spoken}>
      {segments.map((s, i) => (
        <RNText key={i} className={s.change === 'removed' ? 'text-dim line-through' : undefined}>
          {s.text}
        </RNText>
      ))}
    </Text>
  );
}

function BlockView({ block }: { block: DiffBlock }) {
  switch (block.type) {
    case 'same':
      return <MarkdownBlockView block={block.block} />;
    case 'paragraph':
      return <SegmentText segments={block.segments} variant="paragraph" tone="secondary" />;
    case 'quote':
      return (
        <View className="border-l-2 border-accent pl-3">
          <SegmentText segments={block.segments} variant="paragraph" tone="muted" />
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
              <SegmentText
                segments={item}
                variant="paragraph"
                tone="secondary"
                className="min-w-0 flex-1"
              />
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
  return (
    <View className={cn('gap-3', className)}>
      {sections.map((section) => {
        const heading = MARKDOWN_HEADING[section.level === 3 ? 3 : 2];
        return (
          <View
            key={section.key}
            className="gap-3"
            onLayout={(e: LayoutChangeEvent) =>
              onSectionLayout(section.key, e.nativeEvent.layout.y)
            }
          >
            {section.heading ? (
              <SegmentText
                segments={section.heading}
                accessibilityRole="header"
                textClassName={cn('font-inter-semibold text-fg', heading.type)}
                className={heading.space}
              />
            ) : null}
            {section.blocks.map((block, i) => (
              <BlockView key={i} block={block} />
            ))}
          </View>
        );
      })}
    </View>
  );
}
