import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { openPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { useWorkoutDraftStore } from '@/features/workout/stores/workout-draft-store';
import { useCurrentPlan } from '@/shared/data/plans';
import { getActiveWorkoutId } from '@/shared/data/workouts';
import { useResetOnOpen } from '@/shared/hooks/use-reset-on-open';
import { ChoiceSheet } from '@/shared/ui/choice-sheet';
import { Icon } from '@/shared/ui/icon';
import { afterSheetClose } from '@/shared/ui/sheet';

import { glyphColor, PlanGlyph, RoutineGlyph } from './glyphs';

type CreateKind = 'workout' | 'routine' | 'plan' | 'meal';

export interface CreateSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * The tab bar's "+" sheet: an empty workout (or the running one, resumed), a new routine, a
 * plan, which is made, imported or built (01·V·A·6), or the meal log.
 */
export function CreateSheet({ visible, onClose }: CreateSheetProps) {
  const { t } = useTranslation('training');
  const { plan, profile } = useCurrentPlan();
  const [kind, setKind] = useResetOnOpen<CreateKind>(visible, 'workout');

  const then = (go: () => void) => {
    onClose();
    afterSheetClose(go);
  };

  // An empty workout is put together first and started from the builder. Only one workout runs
  // at a time: a running one is resumed instead.
  const emptyWorkout = async () => {
    const running = await getActiveWorkoutId();
    if (running) {
      router.push(`/workout/${running}`);
      return;
    }
    useWorkoutDraftStore.getState().begin(t('create.emptyWorkoutName'));
    router.push('/workout/new');
  };

  return (
    <ChoiceSheet
      visible={visible}
      onClose={onClose}
      value={kind}
      onChange={setKind}
      onConfirm={(value) => {
        if (value === 'workout') then(emptyWorkout);
        else if (value === 'routine') then(() => router.push('/routine/new'));
        else if (value === 'meal') then(() => router.push('/meals'));
        else then(() => openPlanFlow(profile, plan?.sessionsPerWeek));
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
        {
          value: 'meal',
          title: t('create.meal'),
          description: t('create.mealHint'),
          cta: t('create.openMeals'),
          renderIcon: (active) => <Icon name="meal" size={15} color={glyphColor(active)} />,
        },
      ]}
    />
  );
}
