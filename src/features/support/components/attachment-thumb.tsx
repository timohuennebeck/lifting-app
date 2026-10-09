import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';

import { useAttachmentUrl } from '../data/attachments';

export interface AttachmentThumbProps {
  path: string;
  onOpen: (path: string) => void;
}

/** 72×156 screenshot preview in a chat bubble; tap opens it, a failed load retries. */
export function AttachmentThumb({ path, onOpen }: AttachmentThumbProps) {
  const { t } = useTranslation('support');
  const { data: uri, isError, refetch } = useAttachmentUrl(path);
  return (
    <PressableScale
      haptic="select"
      accessibilityLabel={t('chat.screenshot')}
      onPress={() => (uri ? onOpen(path) : refetch())}
      className="h-39 w-18 items-center justify-center overflow-hidden rounded-[14px] bg-raised"
    >
      {uri ? (
        <Image
          // Signed URLs change; the storage path keeps the disk cache hit.
          source={{ uri, cacheKey: path }}
          contentFit="cover"
          contentPosition="top"
          transition={150}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
      ) : isError ? (
        <Icon name="refresh" size={16} color={colors.subtle} />
      ) : (
        <ActivityIndicator color={colors.subtle} />
      )}
    </PressableScale>
  );
}
