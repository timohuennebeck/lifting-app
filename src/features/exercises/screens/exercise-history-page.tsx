import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseHistoryPanel } from '@/features/workout/components/exercise-history-panel';

import { useExerciseId } from '../components/exercise-layout';

/** Exercise page, "Historie": best weights over time and the past sessions. */
export function ExerciseHistoryPage() {
  const exerciseId = useExerciseId();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      contentContainerClassName="px-4 pt-7"
      contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
      showsVerticalScrollIndicator={false}
    >
      <ExerciseHistoryPanel exerciseId={exerciseId} />
    </ScrollView>
  );
}
