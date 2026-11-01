import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/shared/ui/text';

const HEADLINE = 'text-[46px] leading-13 tracking-[-0.5px]';

/** The neon words of a story headline, for `Trans`'s `<accent>`. */
export const storyAccent = <Text variant="title" tone="accent" className={HEADLINE} />;

export interface StoryTitleProps {
  overline: string;
  /** The headline, with its neon words from `storyAccent`. */
  children: ReactNode;
}

/**
 * A story page's grey overline over its big uppercase headline. A long word ("Feuerwehrauto")
 * shrinks the headline instead of breaking across lines.
 */
export function StoryTitle({ overline, children }: StoryTitleProps) {
  return (
    <View className="gap-3">
      <Text variant="overline" tone="subtle" className="text-[15px] leading-5 tracking-[2px]">
        {overline}
      </Text>
      <Text
        variant="title"
        accessibilityRole="header"
        numberOfLines={3}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        className={HEADLINE}
      >
        {children}
      </Text>
    </View>
  );
}
