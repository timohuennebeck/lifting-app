import { ExerciseHistoryPanel } from '@/features/workout/components/exercise-history-panel';

import { useExerciseId } from '../components/exercise-layout';

/** Exercise page, "Historie": best weights over time and the past sessions. */
export function ExerciseHistoryPage() {
  const exerciseId = useExerciseId();
  return <ExerciseHistoryPanel exerciseId={exerciseId} />;
}
