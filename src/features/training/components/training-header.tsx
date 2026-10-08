import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useProfile } from '@/shared/data/profile';
import { formatDate } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/avatar';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { CollectionsGlyph } from './glyphs';

export interface TrainingHeaderProps {
  onCreate: () => void;
}

/** Tab header (avatar, date, greeting) with Collections, New and Settings actions (01·V·A). */
export function TrainingHeader({ onCreate }: TrainingHeaderProps) {
  const { t } = useTranslation(['common', 'training']);
  const { profile } = useProfile();
  const name = profile?.firstName ?? '';
  return (
    <View className="flex-row items-center justify-between gap-3 px-5 pt-2.5 pb-1.5">
      <PressableScale
        className="min-w-0 flex-1 flex-row items-center gap-3"
        accessibilityLabel={t('tabs.profile')}
        onPress={() => router.navigate('/profile')}
      >
        <Avatar name={name} />
        <View className="min-w-0 flex-1 gap-0.5">
          <Text variant="caption" tone="subtle" numberOfLines={1}>
            {formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'short' })}
          </Text>
          <Text variant="bodyStrong" numberOfLines={1}>
            {t('greeting', { name })}
          </Text>
        </View>
      </PressableScale>
      <View className="flex-row gap-2">
        <PressableScale
          hitSlop={4}
          accessibilityLabel={t('training:header.collections')}
          onPress={() => router.push('/template/collections')}
          className="size-[42px] items-center justify-center rounded-full bg-elevated"
        >
          <CollectionsGlyph />
        </PressableScale>
        <IconButton
          icon="plus"
          iconSize={14}
          accessibilityLabel={t('training:header.create')}
          onPress={onCreate}
        />
        <IconButton
          icon="settings"
          iconSize={20}
          accessibilityLabel={t('settings')}
          onPress={() => router.navigate('/settings')}
        />
      </View>
    </View>
  );
}
