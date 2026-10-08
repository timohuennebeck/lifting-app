import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

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
    <ListRow
      onPress={onPress}
      activeScale={0.98}
      className="px-3"
      badge={padIndex(index)}
      title={name}
      subtitle={t('list.meta', { count: exerciseCount, minutes })}
      trailing={
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
      }
    />
  );
}
