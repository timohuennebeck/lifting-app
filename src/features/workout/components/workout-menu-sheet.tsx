import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MinusGlyph } from '@/features/training/components/glyphs';
import { colors } from '@/shared/lib/theme';
import { ChoiceSheet } from '@/shared/ui/choice-sheet';
import { Icon } from '@/shared/ui/icon';

import { useWorkoutActions } from '../hooks/use-workout-actions';

type MenuOption = 'finish' | 'discard';

export interface WorkoutMenuSheetProps {
  visible: boolean;
  onClose: () => void;
  workoutId: string;
  name: string;
  doneSets: number;
  totalSets: number;
}

/**
 * The workout's X: finish or discard, as radio cards with the button below (the usual sheet
 * style). The button is the confirmation, so discarding doesn't ask again.
 */
export function WorkoutMenuSheet({
  visible,
  onClose,
  workoutId,
  name,
  doneSets,
  totalSets,
}: WorkoutMenuSheetProps) {
  const { t } = useTranslation('workout');
  const { finish, abandon, finishing } = useWorkoutActions(workoutId);
  const canFinish = doneSets > 0;
  const initial: MenuOption = canFinish ? 'finish' : 'discard';
  const [option, setOption] = useState<MenuOption>(initial);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setOption(initial);
  }

  return (
    <ChoiceSheet
      visible={visible}
      onClose={onClose}
      title={name}
      subtitle={t('menu.progress', { done: doneSets, total: totalSets })}
      value={option}
      onChange={setOption}
      onConfirm={(value) => {
        if (value === 'finish') return void finish();
        onClose();
        void abandon();
      }}
      loading={finishing}
      note={option === 'finish' && !canFinish ? t('menu.finishHint') : undefined}
      options={[
        {
          value: 'finish',
          title: t('menu.finish'),
          description: t('menu.finishDescription'),
          cta: t('menu.finish'),
          ctaDisabled: !canFinish,
          renderIcon: (active) => (
            <Icon name="check" size={16} color={active ? colors.onAccent : colors.fg} />
          ),
        },
        {
          value: 'discard',
          tone: 'danger',
          title: t('menu.discard'),
          description: t('menu.discardDescription'),
          cta: t('menu.discard'),
          renderIcon: (active) => <MinusGlyph color={active ? colors.bg : colors.fg} />,
        },
      ]}
    />
  );
}
