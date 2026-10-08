import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

interface GhostExerciseProps {
  faded?: boolean;
  widths: [`${number}%`, `${number}%`];
}

function GhostExercise({ faded, widths }: GhostExerciseProps) {
  return (
    <View className="flex-row gap-3.5 py-[18px]" style={{ opacity: faded ? 0.45 : 1 }}>
      <View className="h-[86px] w-16 rounded-[5px] bg-[#161616]" />
      <View className="flex-1 gap-2.5">
        <View className="gap-[7px] pt-[7px]">
          <View className="h-2.5 rounded-[5px] bg-[#1E1E1C]" style={{ width: widths[0] }} />
          <View className="h-2.5 rounded-[5px] bg-[#1E1E1C]" style={{ width: widths[1] }} />
        </View>
        {[0, 1].map((k) => (
          <View key={k} className="flex-row items-center gap-2.5">
            <View className="size-6 rounded-full bg-[#1A1A1A]" />
            <View className="flex-1">
              <View className="h-2 w-[34px] rounded bg-[#1A1A1A]" />
            </View>
            <View className="size-[22px] rounded-full bg-[#161616]" />
          </View>
        ))}
        <View className="flex-row gap-1.5">
          <View className="h-7 w-14 rounded-full bg-[#161616]" />
          <View className="h-7 w-[68px] rounded-full bg-[#161616]" />
        </View>
      </View>
    </View>
  );
}

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
        <PressableScale
          haptic="press"
          activeScale={0.95}
          accessibilityLabel={t('addExercise')}
          onPress={onAdd}
          className="size-14 items-center justify-center rounded-full bg-[#1E1E1E]"
        >
          <Icon name="plus" size={18} color={colors.fg} />
        </PressableScale>
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
