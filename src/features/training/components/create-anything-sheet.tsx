import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { openPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { useWorkoutDraftStore } from '@/features/workout/stores/workout-draft-store';
import { useCurrentPlan } from '@/shared/data/plans';
import { getActiveWorkoutId } from '@/shared/data/workouts';
import { afterSheetClose } from '@/shared/ui/sheet';

import { CreateSheet } from './create-sheet';

export interface CreateAnythingSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * The tab bar's "+": an empty workout (or the running one, resumed), a new routine, or a plan.
 */
export function CreateAnythingSheet({ visible, onClose }: CreateAnythingSheetProps) {
  const { t } = useTranslation('today');
  const { plan, profile } = useCurrentPlan();

  const then = (go: () => void) => {
    onClose();
    afterSheetClose(go);
  };

  return (
    <CreateSheet
      visible={visible}
      onClose={onClose}
      onStartWorkout={() =>
        then(async () => {
          // Only one workout runs at a time: a running one is resumed instead.
          const running = await getActiveWorkoutId();
          if (running) {
            router.push(`/workout/${running}`);
            return;
          }
          // Put together first, started from the builder.
          useWorkoutDraftStore.getState().begin(t('emptyWorkoutName'));
          router.push('/workout/new');
        })
      }
      onCreateRoutine={() => then(() => router.push('/routine/new'))}
      onCreatePlan={() => then(() => openPlanFlow(profile, '/', plan?.sessionsPerWeek))}
    />
  );
}
