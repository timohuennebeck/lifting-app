import { useTranslation } from 'react-i18next';

import { useResetOnOpen } from '@/shared/hooks/use-reset-on-open';
import { ChoiceSheet } from '@/shared/ui/choice-sheet';
import { Icon } from '@/shared/ui/icon';

import { glyphColor, PlanGlyph, RoutineGlyph } from './glyphs';

type CreateKind = 'workout' | 'routine' | 'plan';

export interface CreateSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreateRoutine: () => void;
  onCreatePlan: () => void;
  /** "Leeres Training": an empty workout, started now. */
  onStartWorkout: () => void;
}

/**
 * The tab bar's "+" sheet: an empty workout, a new routine, or a plan, which is made, imported or
 * built (01·V·A·6).
 */
export function CreateSheet({
  visible,
  onClose,
  onCreateRoutine,
  onCreatePlan,
  onStartWorkout,
}: CreateSheetProps) {
  const { t } = useTranslation('training');
  const [kind, setKind] = useResetOnOpen<CreateKind>(visible, 'workout');

  return (
    <ChoiceSheet
      visible={visible}
      onClose={onClose}
      value={kind}
      onChange={setKind}
      onConfirm={(value) => {
        if (value === 'workout') onStartWorkout();
        else if (value === 'routine') onCreateRoutine();
        else onCreatePlan();
      }}
      options={[
        {
          value: 'workout',
          title: t('create.workout'),
          description: t('create.workoutHint'),
          cta: t('create.startWorkout'),
          renderIcon: (active) => <Icon name="bolt" size={16} color={glyphColor(active)} />,
        },
        {
          value: 'routine',
          title: t('create.routine'),
          description: t('create.routineHint'),
          cta: t('create.createRoutine'),
          renderIcon: (active) => <RoutineGlyph color={glyphColor(active)} />,
        },
        {
          value: 'plan',
          title: t('create.plan'),
          description: t('create.planHint'),
          cta: t('create.createPlan'),
          renderIcon: (active) => <PlanGlyph color={glyphColor(active)} />,
        },
      ]}
    />
  );
}
