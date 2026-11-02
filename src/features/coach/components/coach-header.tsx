import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { IconButton } from '@/shared/ui/icon-button';
import { Text } from '@/shared/ui/text';

export interface CoachHeaderProps {
  /** The start screen's profile photo, or a back button. */
  leading: ReactNode;
  /** Under "Kai · KI-Coach": what the chat is about, or "Neuer Chat". */
  subtitle?: string | null;
  /** Earlier chats; left out where they are already shown. */
  onHistory?: () => void;
  /** A new chat; left out on the start screen, which is one. */
  onNew?: () => void;
}

/** "Kai · KI-Coach" centred between 80pt columns, round 36pt buttons (design "Coach Screens"). */
export function CoachHeader({ leading, subtitle, onHistory, onNew }: CoachHeaderProps) {
  const { t } = useTranslation('coach');
  return (
    <View className="flex-row items-center px-5 pt-2 pb-2.5">
      <View className="w-20 flex-row">{leading}</View>
      <View className="min-w-0 flex-1 items-center gap-0.5">
        <Text className="font-inter-bold text-xl leading-6 tracking-[-0.2px] text-fg">
          {t('title')}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="font-inter text-xs leading-[15px] text-subtle">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View className="w-20 flex-row justify-end gap-2">
        {onHistory ? (
          <IconButton
            icon="clock"
            size={36}
            iconSize={18}
            accessibilityLabel={t('history.title')}
            onPress={onHistory}
          />
        ) : null}
        {onNew ? (
          <IconButton
            icon="plus"
            size={36}
            iconSize={12}
            accessibilityLabel={t('newChat')}
            onPress={onNew}
          />
        ) : null}
      </View>
    </View>
  );
}

/** The back button of the coach's chats: 36pt like the header's others. */
export function CoachBack({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <IconButton
      icon="chevron-left"
      size={36}
      accessibilityLabel={t('actions.back')}
      onPress={onPress}
    />
  );
}
