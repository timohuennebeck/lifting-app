import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { padIndex } from '../lib/training-ui';

export interface TemplateRowProps {
  index: number;
  name: string;
  minutes: number;
  exerciseCount: number;
  onPress: () => void;
  onStart: () => void;
  starting?: boolean;
}

/** Numbered template row with a quick-start play button (01·V·A). */
export function TemplateRow({
  index,
  name,
  minutes,
  exerciseCount,
  onPress,
  onStart,
  starting,
}: TemplateRowProps) {
  const { t } = useTranslation('training');
  return (
    <PressableScale
      onPress={onPress}
      activeScale={0.98}
      className="h-[72px] flex-row items-center gap-3.5 px-3"
    >
      <View className="size-10 items-center justify-center rounded-full bg-elevated">
        <Text variant="label">{padIndex(index)}</Text>
      </View>
      <View className="min-w-0 flex-1 gap-1.5">
        <Text variant="bodyStrong" numberOfLines={1} className="text-lg leading-[22px]">
          {name}
        </Text>
        <Text variant="caption" tone="subtle" numberOfLines={1} className="text-sm">
          {t('list.meta', { count: exerciseCount, minutes })}
        </Text>
      </View>
      <PressableScale
        haptic="press"
        hitSlop={8}
        accessibilityLabel={t('list.start', { name })}
        onPress={onStart}
        disabled={starting}
        className="size-10 items-center justify-center rounded-full bg-elevated"
      >
        {starting ? (
          <ActivityIndicator size="small" color={colors.fg} />
        ) : (
          <Icon name="play" size={12} />
        )}
      </PressableScale>
    </PressableScale>
  );
}
