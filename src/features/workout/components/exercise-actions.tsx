import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/shared/lib/theme';
import { Icon, type IconName } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

interface ExerciseAction {
  icon: IconName;
  label: string;
  onPress: () => void;
}

export interface ExerciseActionsProps {
  onInfo: () => void;
  onTargets: () => void;
  onSwap: () => void;
}

/** Info · Targets · Swap pills under the exercise title. */
export function ExerciseActions({ onInfo, onTargets, onSwap }: ExerciseActionsProps) {
  const { t } = useTranslation('workout');
  const actions: ExerciseAction[] = [
    { icon: 'info', label: t('actions.info'), onPress: onInfo },
    { icon: 'target', label: t('actions.targets'), onPress: onTargets },
    { icon: 'swap', label: t('actions.swap'), onPress: onSwap },
  ];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-5 pt-4.5"
    >
      {actions.map((a) => (
        <PressableScale
          key={a.icon}
          onPress={a.onPress}
          className="h-11 flex-row items-center gap-2 rounded-full bg-raised px-4"
        >
          <Icon name={a.icon} size={14} color={colors.fg} />
          <Text variant="label">{a.label}</Text>
        </PressableScale>
      ))}
    </ScrollView>
  );
}
