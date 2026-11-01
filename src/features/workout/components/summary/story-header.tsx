import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/avatar';
import { IconButton } from '@/shared/ui/icon-button';
import { Text } from '@/shared/ui/text';

export interface StoryHeaderProps {
  name: string;
  /** The page shown, from 0. */
  page: number;
  pages: number;
  onClose: () => void;
}

/**
 * The finished story's top: a bar per page (the shown one and those before it filled), the
 * workout's initials and name with "1 / 3", and an X.
 */
export function StoryHeader({ name, page, pages, onClose }: StoryHeaderProps) {
  const { t } = useTranslation(['workout', 'common']);
  return (
    <View className="gap-3 px-4 pt-2">
      <View className="flex-row gap-1">
        {Array.from({ length: pages }, (_, i) => (
          <View
            key={i}
            className={cn('h-0.75 flex-1 rounded-full', i <= page ? 'bg-fg' : 'bg-track')}
          />
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
