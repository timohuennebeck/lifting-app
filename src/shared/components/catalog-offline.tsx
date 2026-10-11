import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

export interface CatalogOfflineProps {
  retrying: boolean;
  onRetry: () => void;
}

/** Covers the app on a first launch without connection: nothing works before the exercises. */
export function CatalogOffline({ retrying, onRetry }: CatalogOfflineProps) {
  const { t } = useTranslation();
  return (
    <View className="absolute inset-0 items-center justify-center bg-bg px-8">
      <View className="size-16 items-center justify-center rounded-full bg-elevated">
        <Icon name="refresh" size={24} color={colors.subtle} />
      </View>
      <Text variant="headline" className="mt-6 text-center">
        {t('catalogOffline.title')}
      </Text>
      <Text variant="paragraph" tone="subtle" className="mt-2 text-center">
        {t('catalogOffline.body')}
      </Text>
      <Button
        label={t('actions.retry')}
        loading={retrying}
        className="mt-6 h-12 px-7"
        onPress={onRetry}
      />
    </View>
  );
}
