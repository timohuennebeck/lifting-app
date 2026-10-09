import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Sheet } from '@/shared/ui/sheet';

import { useAttachmentUrl } from '../data/attachments';

interface FullImageProps {
  path: string;
}

function FullImage({ path }: FullImageProps) {
  const { data: uri } = useAttachmentUrl(path);
  if (!uri) return <ActivityIndicator color={colors.subtle} className="flex-1" />;
  return (
    <Image
      source={{ uri, cacheKey: path }}
      contentFit="contain"
      style={{ flex: 1 }}
      transition={150}
    />
  );
}

export interface ScreenshotViewerSheetProps {
  /** Storage path of the screenshot to show; null closes the sheet. */
  path: string | null;
  onClose: () => void;
}

/** Full-size view of a chat screenshot. */
export function ScreenshotViewerSheet({ path, onClose }: ScreenshotViewerSheetProps) {
  // Keep the last image while the sheet animates out.
  const [shown, setShown] = useState(path);
  if (path && path !== shown) setShown(path);
  return (
    <Sheet visible={!!path} onClose={onClose} snapPoints={['92%']}>
      <View className="flex-1 pb-2">{shown ? <FullImage path={shown} /> : null}</View>
    </Sheet>
  );
}
