import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { ListRow } from '@/shared/ui/list-row';
import { PressableScale } from '@/shared/ui/pressable-scale';

import { padIndex } from '../lib/training-ui';

export interface TemplateRowProps {
  index: number;
  name: string;
  minutes: number;
  exerciseCount: number;
  onPress: () => void;
  onStart: () => void;
  /** "⋯": rename or delete. */
  onMore: () => void;
  starting?: boolean;
}

/** Numbered template row with "⋯" (rename, delete) and a quick-start play button (01·V·A). */
export function TemplateRow({
  index,
  name,
  minutes,
  exerciseCount,
  onPress,
  onStart,
  onMore,
  starting,
}: TemplateRowProps) {
  const { t } = useTranslation('training');
  return (
    <ListRow
      onPress={onPress}
      activeScale={0.98}
      // Opaque: the row slides over the delete button when swiped.
      className="bg-bg px-3"
      badge={padIndex(index)}
      title={name}
      subtitle={t('list.meta', { count: exerciseCount, minutes })}
      trailing={
        <View className="flex-row gap-2">
          <PressableScale
            haptic="tap"
            hitSlop={4}
            accessibilityLabel={t('list.more', { name })}
            onPress={onMore}
            className="size-10 items-center justify-center rounded-full bg-elevated"
          >
            <Icon name="more" size={14} />
          </PressableScale>
          <PressableScale
            haptic="press"
            hitSlop={4}
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
        </View>
      }
    />
  );
}
