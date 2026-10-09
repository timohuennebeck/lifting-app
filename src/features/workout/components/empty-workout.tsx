import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { EmptyExercises } from '@/shared/ui/empty-exercises';
import { IconButton } from '@/shared/ui/icon-button';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

export interface EmptyWorkoutProps {
  name: string;
  onBack: () => void;
  onMenu: () => void;
  onAdd: () => void;
}

/** Workout without exercises yet (design 03·0 Leeres Training). */
export function EmptyWorkout({ name, onBack, onMenu, onAdd }: EmptyWorkoutProps) {
  const { t } = useTranslation('workout');
  return (
    <View className="flex-1">
      <ScreenHeader
        className="gap-3.5 pr-5"
        icon="chevron-left-thin"
        onBack={onBack}
        title={
          <Text variant="bodyStrong" numberOfLines={1} className="text-center text-lg">
            {name}
          </Text>
        }
        action={
          <IconButton
            icon="more-vertical"
            iconSize={4}
            accessibilityLabel={t('menu.open')}
            onPress={onMenu}
          />
        }
      />
      <View className="flex-row items-center gap-4 px-5 pt-9">
        <View className="flex-1">
          <Text variant="headline" className="leading-5.5">
            {t('empty.title')}
          </Text>
          <Text variant="label" tone="subtle" className="mt-2 font-inter">
            {t('empty.duration', { minutes: 0 })}
          </Text>
        </View>
        <IconButton
          icon="plus"
          size={56}
          iconSize={18}
          haptic="press"
          activeScale={0.95}
          accessibilityLabel={t('addExercise')}
          onPress={onAdd}
          className="bg-raised"
        />
      </View>
      <View className="px-5 pt-2">
        <EmptyExercises hint={t('empty.hint')} />
      </View>
    </View>
  );
}
