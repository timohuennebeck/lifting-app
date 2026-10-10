import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { TopTabs } from 'expo-router/js-top-tabs';
import { createContext, use } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SwipeTabs } from '@/shared/components/swipe-tabs';
import { exerciseName, getExercise } from '@/shared/data/exercises';
import { Gradient, type GradientStop } from '@/shared/ui/gradient';
import { IconButton } from '@/shared/ui/icon-button';
import { Text } from '@/shared/ui/text';

import { primaryGroup } from '../lib/muscle-groups';
import { ExerciseThumb } from './exercise-thumb';

/** Shades the photo under the back button and blends its foot into the page. */
const HERO_FADE: GradientStop[] = [
  [0, 0.55],
  [0.25, 0],
  [0.45, 0],
  [0.92, 1],
];

// The tabs are routes of their own; switching between them doesn't carry the URL's id along.
const ExerciseIdContext = createContext('');

/** The exercise shown on the exercise page, for its tabs. */
export const useExerciseId = () => use(ExerciseIdContext);

/**
 * Exercise info (design 06e): photo, name and the swipeable tabs "Übung" (muscles, technique)
 * and "Historie" (/exercise/[id]/history). Both stay mounted. Opened from the live workout, the
 * templates, the plan import and the search.
 */
export function ExerciseLayout() {
  const { id: exerciseId } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation(['exercises', 'common']);
  const insets = useSafeAreaInsets();
  const exercise = getExercise(exerciseId);
  const back = (
    <View className="absolute left-4" style={{ top: insets.top + 16 }}>
      <IconButton
        icon="chevron-left"
        iconSize={7}
        accessibilityLabel={t('common:actions.back')}
        onPress={() => router.back()}
      />
    </View>
  );
  // An exercise the catalog doesn't have: nothing to show but the way back.
  if (!exercise) return <View className="flex-1 bg-bg">{back}</View>;

  const name = exerciseName(exerciseId, i18n.language);

  return (
    <View className="flex-1 bg-bg">
      <View className="h-85 overflow-hidden">
        {exercise.image ? (
          <Image
            source={exercise.image}
            contentFit="cover"
            contentPosition={{ left: '50%', top: '35%' }}
            style={[StyleSheet.absoluteFill, { bottom: 24 }]}
          />
        ) : (
          <ExerciseThumb
            exerciseId={exerciseId}
            name={name}
            className="absolute inset-0 h-auto w-auto rounded-none"
            initialsClassName="text-[64px] leading-16"
          />
        )}
        <Gradient from="top" stops={HERO_FADE} />
        {back}
        <View className="absolute right-5 bottom-1.5 left-5">
          <Text variant="headline" className="text-[30px] leading-8">
            {name}
          </Text>
          <Text variant="label" tone="muted" className="mt-2 font-inter">
            {`${t(`exercises:equipment.${exercise.equipment}`)} · ${t(`exercises:groups.${primaryGroup(exerciseId)}`)}`}
          </Text>
        </View>
      </View>
      <ExerciseIdContext value={exerciseId}>
        <SwipeTabs>
          <TopTabs.Screen name="index" options={{ title: t('exercises:detail.tabs.exercise') }} />
          <TopTabs.Screen name="history" options={{ title: t('exercises:detail.tabs.history') }} />
        </SwipeTabs>
      </ExerciseIdContext>
    </View>
  );
}
