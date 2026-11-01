import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/avatar';
import { IconButton } from '@/shared/ui/icon-button';
import { Text } from '@/shared/ui/text';

export interface StoryHeaderProps {
  name: string;
  /** The page shown, from 0. */
  page: number;
  pages: number;
  /** How far the shown page is through its time, 0–1. */
  progress: SharedValue<number>;
  onClose: () => void;
}

/**
 * The finished story's top: a bar per page (those before the shown one full, the shown one
 * filling as its time runs), the workout's initials and name with "1 / 3", and an X.
 */
export function StoryHeader({ name, page, pages, progress, onClose }: StoryHeaderProps) {
  const { t } = useTranslation(['workout', 'common']);
  const filling = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));
  return (
    <View className="gap-3 px-4 pt-2">
      <View className="flex-row gap-1">
        {Array.from({ length: pages }, (_, i) => (
          <View key={i} className="h-0.75 flex-1 overflow-hidden rounded-full bg-track">
            {i === page ? (
              <Animated.View className="h-full rounded-full bg-fg" style={filling} />
            ) : (
              <View className={cn('h-full rounded-full bg-fg', i < page ? 'w-full' : 'w-0')} />
            )}
          </View>
        ))}
      </View>
      <View className="flex-row items-center gap-2.5 pl-1">
        <Avatar name={name} size={36} accent />
        <Text variant="label" numberOfLines={1} className="shrink">
          {name}
        </Text>
        <Text
          variant="label"
          tone="subtle"
          className="font-inter tabular-nums"
          accessibilityLabel={t('summary.story.page', { current: page + 1, total: pages })}
        >
          {`${page + 1} / ${pages}`}
        </Text>
        <View className="flex-1" />
        <IconButton
          icon="close"
          className="bg-transparent"
          accessibilityLabel={t('common:actions.close')}
          onPress={onClose}
        />
      </View>
    </View>
  );
}
