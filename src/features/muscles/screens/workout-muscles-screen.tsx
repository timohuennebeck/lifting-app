import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { workoutMuscleSplit } from '@/features/exercises/lib/muscle-groups';
import { MuscleMap } from '@/shared/ui/muscle-map';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import { MuscleSplit } from '../components/muscle-split';
import { parseWorkoutItems } from '../lib/workout-muscles-link';

/**
 * Behind the ⓘ of "Beanspruchte Muskeln": the workout's muscles on both body views, then split
 * into primary (targeted by an exercise, at least 10 %) and secondary.
 */
export function WorkoutMusclesScreen() {
  const { title, items } = useLocalSearchParams<{ title?: string; items?: string }>();
  const insets = useSafeAreaInsets();
  const { primary, secondary } = workoutMuscleSplit(parseWorkoutItems(items));
  const primaryIds = primary.map((s) => s.muscle);
  const secondaryIds = secondary.map((s) => s.muscle);

  return (
    <Screen header={<ScreenHeader title={title} />}>
      <ScrollView
        contentContainerClassName="px-4 pt-11"
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="flex-row justify-center gap-4.5"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {(['front', 'back'] as const).map((view) => (
            <MuscleMap
              key={view}
              view={view}
              selected={primaryIds}
              secondary={secondaryIds}
              width={155}
              height={314}
            />
          ))}
        </View>
        <MuscleSplit primary={primary} secondary={secondary} className="pt-14" />
      </ScrollView>
    </Screen>
  );
}
