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
  /** The exercise's page: how it works and its history. */
  onInfo: () => void;
  /** Pairs the exercise as a superset, or splits its superset. */
  onSuperset: () => void;
  onTargets: () => void;
  onSwap: () => void;
  /** The "⋯" menu: reorder, remove. */
  onMore: () => void;
}

const CHIP = 'h-11 flex-row items-center rounded-full bg-raised';

/** Info · Superset · Targets · Swap pills and a round "⋯" under the exercise title; they scroll. */
export function ExerciseActions({
  onInfo,
  onSuperset,
  onTargets,
  onSwap,
  onMore,
}: ExerciseActionsProps) {
  const { t } = useTranslation('workout');
  const actions: ExerciseAction[] = [
    { icon: 'page', label: t('actions.info'), onPress: onInfo },
    { icon: 'link', label: t('actions.superset'), onPress: onSuperset },
    { icon: 'target', label: t('actions.targets'), onPress: onTargets },
    { icon: 'swap', label: t('actions.swap'), onPress: onSwap },
  ];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-1.5 px-5 pt-4.5"
    >
      {actions.map((a) => (
        <PressableScale key={a.icon} onPress={a.onPress} className={`${CHIP} gap-2 px-3.5`}>
          <Icon name={a.icon} size={14} color={colors.fg} />
          <Text variant="label">{a.label}</Text>
        </PressableScale>
      ))}
      <PressableScale
        accessibilityLabel={t('actions.more')}
        onPress={onMore}
        className={`${CHIP} w-11 justify-center`}
      >
        <Icon name="more" size={14} color={colors.fg} />
      </PressableScale>
    </ScrollView>
  );
}
