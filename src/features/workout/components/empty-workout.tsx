import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhostExercise } from '@/shared/ui/ghost-exercise';
import { IconButton } from '@/shared/ui/icon-button';
import { Text } from '@/shared/ui/text';

export interface EmptyWorkoutProps {
  name: string;
  onBack: () => void;
  onMenu: () => void;
  onAdd: () => void;
}

/** Workout without exercises yet (design 03·0 Leeres Training). */
export function EmptyWorkout({ name, onBack, onMenu, onAdd }: EmptyWorkoutProps) {
  const { t } = useTranslation(['workout', 'common']);
  return (
    <View className="flex-1">
      <View className="flex-row items-center gap-3.5 py-1.5 pr-5 pl-4">
        <IconButton
          icon="chevron-left"
          iconSize={10}
          accessibilityLabel={t('common:actions.back')}
          onPress={onBack}
        />
        <Text variant="bodyStrong" numberOfLines={1} className="flex-1 text-center text-lg">
          {name}
        </Text>
        <IconButton
          icon="more"
          iconSize={14}
          accessibilityLabel={t('menu.open')}
          onPress={onMenu}
        />
      </View>
      <View className="flex-row items-center gap-4 px-5 pt-9">
        <View className="flex-1">
          <Text variant="headline" className="leading-[22px]">
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
          className="bg-[#1E1E1E]"
        />
      </View>
      <View className="px-5 pt-2">
        <GhostExercise widths={['88%', '58%']} />
        <GhostExercise faded widths={['74%', '44%']} />
      </View>
      <Text tone="subtle" className="px-[30px] pt-2 text-center text-sm leading-5">
        {t('empty.hint')}
      </Text>
    </View>
  );
}
