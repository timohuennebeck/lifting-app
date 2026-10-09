import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';

import type { ScreenshotDraft } from '../hooks/use-screenshot-draft';

export interface ScreenshotTilesProps {
  draft: ScreenshotDraft;
  /** Size of each tile; the form uses the design's 64×88. */
  tileClassName?: string;
  /** Shows the trailing "+" tile while fewer than five are attached. */
  showAdd?: boolean;
  className?: string;
}

/** Thumbnails of attached screenshots with remove buttons and a spinner while compressing. */
export function ScreenshotTiles({
  draft,
  tileClassName = 'h-22 w-16',
  showAdd = true,
  className,
}: ScreenshotTilesProps) {
  const { t } = useTranslation('support');
  return (
    <View className={cn('flex-row flex-wrap gap-2.5', className)}>
      {draft.shots.map((shot) => {
        return (
          <View key={shot.id} className={cn('overflow-hidden rounded-xl bg-chip', tileClassName)}>
            <Image source={{ uri: shot.uri }} contentFit="cover" style={{ flex: 1 }} />
            {!shot.ready ? (
              <View className="absolute inset-0 items-center justify-center bg-black/45">
                <ActivityIndicator color={colors.fg} />
              </View>
            ) : null}
            <PressableScale
              haptic="select"
              hitSlop={8}
              accessibilityLabel={t('form.removeScreenshot')}
              onPress={() => draft.remove(shot.id)}
              className="absolute top-1 right-1 size-5.5 items-center justify-center rounded-full bg-elevated"
            >
              <Icon name="close" size={8} />
            </PressableScale>
          </View>
        );
      })}
      {showAdd && draft.canAdd ? (
        <PressableScale
          haptic="select"
          accessibilityLabel={t('form.addScreenshot')}
          onPress={draft.add}
          className={cn('items-center justify-center rounded-xl bg-chip', tileClassName)}
        >
          <Icon name="plus" size={14} />
        </PressableScale>
      ) : null}
    </View>
  );
}
