import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { IconButton } from '@/shared/ui/icon-button';
import { Text } from '@/shared/ui/text';

export interface ExerciseListHeaderProps {
  count: number;
  minutes: number;
  /** Accessibility label of the "+" button. */
  addLabel: string;
  onAdd: () => void;
  /** Adds exercises by voice; without it there is no microphone. */
  onVoice?: () => void;
}

/**
 * Exercise count and estimated duration above an exercise list, with a microphone to say
 * exercises and a "+" to pick them (03·0b).
 */
export function ExerciseListHeader({
  count,
  minutes,
  addLabel,
  onAdd,
  onVoice,
}: ExerciseListHeaderProps) {
  const { t } = useTranslation('training');
  const empty = count === 0;
  const button = { size: empty ? 56 : 44, className: 'bg-raised' };
  return (
    <View className={cn('flex-row items-center gap-3 px-5', empty ? 'pt-9' : 'pt-7.5')}>
      <View className="min-w-0 flex-1">
        <Text variant="headline">
          {empty ? t('overview.noExercises') : t('overview.exercises', { count })}
        </Text>
        <Text variant="paragraph" tone="subtle" className="mt-1.5 text-sm leading-4.5">
          {t('overview.duration', { minutes })}
        </Text>
      </View>
      {onVoice ? (
        <IconButton
          icon="mic"
          {...button}
          iconSize={empty ? 16 : 13}
          accessibilityLabel={t('overview.addByVoice')}
          onPress={onVoice}
        />
      ) : null}
      <IconButton
        icon="plus"
        {...button}
        iconSize={empty ? 18 : 14}
        accessibilityLabel={addLabel}
        onPress={onAdd}
      />
    </View>
  );
}
