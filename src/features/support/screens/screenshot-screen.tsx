import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/shared/lib/theme';
import { IconButton } from '@/shared/ui/icon-button';

import { useAttachmentUrl } from '../data/attachments';

/** A chat screenshot at full size; fades in over the chat and closes with the X. */
export function ScreenshotScreen() {
  const { t } = useTranslation();
  const { path } = useLocalSearchParams<{ path: string }>();
  const insets = useSafeAreaInsets();
  const { data: uri } = useAttachmentUrl(path);

  return (
    <View
      className="flex-1 bg-black"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {uri ? (
        <Image
          source={{ uri, cacheKey: path }}
          contentFit="contain"
          style={{ flex: 1 }}
          transition={150}
        />
      ) : (
        <ActivityIndicator color={colors.subtle} className="flex-1" />
      )}
      <View className="absolute left-4" style={{ top: insets.top + 6 }}>
        <IconButton
          icon="close"
          accessibilityLabel={t('actions.close')}
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}
