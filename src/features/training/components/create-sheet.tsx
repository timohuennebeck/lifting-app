import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { openOwnPlan, openPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { useWorkoutDraftStore } from '@/features/workout/stores/workout-draft-store';
import { useCurrentPlan } from '@/shared/data/plans';
import { getActiveWorkoutId } from '@/shared/data/workouts';
import { useResetOnOpen } from '@/shared/hooks/use-reset-on-open';
import { ChoiceSheet, glyphColor } from '@/shared/ui/choice-sheet';
import { CoachDiamond } from '@/shared/ui/coach-mark';
import { afterSheetClose } from '@/shared/ui/sheet';

import { useCreateRoutine } from '../hooks/use-create-routine';
import { PencilGlyph, PlanGlyph, RoutineGlyph } from './glyphs';

type CreateKind = 'workout' | 'routine' | 'plan' | 'ownPlan';

export interface CreateSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * The tab bar's "+" sheet: an empty workout (or the running one, resumed), a new untitled
 * routine, a plan imported from a file or made, or one built by hand in the plan editor.
 */
export function CreateSheet({ visible, onClose }: CreateSheetProps) {
  const { t } = useTranslation('training');
  const { plan, profile } = useCurrentPlan();
  const [kind, setKind] = useResetOnOpen<CreateKind>(visible, 'workout');
  const { create: createRoutine } = useCreateRoutine();

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
        else if (value === 'routine') then(() => void createRoutine());
        else if (value === 'plan') then(() => openPlanFlow(profile, plan?.sessionsPerWeek));
        else then(() => openOwnPlan(profile, plan?.sessionsPerWeek));
      }}
      options={[
        {
          value: 'workout',
          title: t('create.workout'),
          description: t('create.workoutHint'),
          cta: t('create.startWorkout'),
          renderIcon: (active) => (
            <CoachDiamond
              size={15}
              color={glyphColor(active)}
              animation={active ? 'breathe' : undefined}
            />
          ),
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
          value: 'ownPlan',
          title: t('create.ownPlan'),
          description: t('create.ownPlanHint'),
          cta: t('create.createOwnPlan'),
          renderIcon: (active) => <PencilGlyph color={glyphColor(active)} filled={active} />,
        },
      ]}
    />
  );
}
