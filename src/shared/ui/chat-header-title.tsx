import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from './text';

export interface ChatHeaderTitleProps {
  /** The 28pt picture of who answers. */
  avatar: ReactNode;
  title: string;
  subtitle?: string | null;
}

/** A chat's header title: who answers, with a line about them or the chat under the name. */
export function ChatHeaderTitle({ avatar, title, subtitle }: ChatHeaderTitleProps) {
  return (
    <View className="flex-row items-center gap-3">
      {avatar}
      <View className="min-w-0 flex-1">
        <Text variant="bodyStrong" numberOfLines={1} className="text-base leading-5">
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="font-inter text-xs text-subtle">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
