import { Image, type ImageContentFit } from 'expo-image';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';

import { Gradient, type GradientStop } from './gradient';
import { IconButton } from './icon-button';
import { Text } from './text';

/** Behind the strip and buttons: solid for its first third, then fading out. */
const BOTTOM_SCRIM: GradientStop[] = [
  [0, 0.9],
  [0.35, 0.9],
  [1, 0],
];

export interface PhotoReviewProps {
  uri: string;
  /** `cover` fills the screen like the camera did; `contain` shows all of it, e.g. a page. */
  fit?: ImageContentFit;
  title: string;
  /** Next to the title, e.g. whether the photo works. */
  status?: ReactNode;
  onClose: () => void;
  /** The thumbnails, to switch photos or take another. */
  strip: ReactNode;
  /** The buttons under the strip. */
  children: ReactNode;
}

/**
 * A taken photo full screen (progress check 08a, plan import 05a-2): its name at the top with a
 * close button, the thumbnails and buttons at the bottom.
 */
export function PhotoReview({
  uri,
  fit = 'cover',
  title,
  status,
  onClose,
  strip,
  children,
}: PhotoReviewProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
  return (
    <View style={StyleSheet.absoluteFill} className="bg-black">
      <Image source={{ uri }} contentFit={fit} style={StyleSheet.absoluteFill} />
      <Gradient from="top" size={200} color="black" opacity={0.6} />
      <Gradient from="bottom" size={340} color="black" stops={BOTTOM_SCRIM} />
      <View
        className="absolute inset-x-4 flex-row items-center gap-3"
        style={{ top: insets.top + 6 }}
      >
        <View className="min-w-0 flex-1 flex-row flex-wrap items-center gap-x-3 gap-y-1.5 pl-1">
          <Text className="font-inter-semibold text-[28px] leading-8.5">{title}</Text>
          {status}
        </View>
        <IconButton icon="close" accessibilityLabel={t('actions.close')} onPress={onClose} />
      </View>
      <View className="absolute inset-x-0 gap-5.5" style={{ bottom: footerInset }}>
        {strip}
        <View className="flex-row gap-3 px-4">{children}</View>
      </View>
    </View>
  );
}
