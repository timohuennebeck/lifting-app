import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { TopTabs } from 'expo-router/js-top-tabs';
import { createContext, use, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { archiveCustomExercise } from '@/shared/data/custom-exercises';
import {
  type Exercise,
  useCustomExerciseStore,
  useEquipmentName,
  useExercise,
  useExerciseName,
} from '@/shared/data/exercises';
import { primaryGroup } from '@/shared/data/muscle-groups';
import { haptics } from '@/shared/lib/haptics';
import { afterSheetClose } from '@/shared/ui/sheet';
import { ActionSheet } from '@/shared/ui/action-sheet';
import { Gradient, type GradientStop } from '@/shared/ui/gradient';
import { IconButton } from '@/shared/ui/icon-button';
import { Text } from '@/shared/ui/text';

import { ExerciseThumb } from './exercise-thumb';
import { SwipeTabs } from './swipe-tabs';

/** Shades the status bar and blends the photo's foot into the page. */
const HERO_FADE: GradientStop[] = [
  [0, 0.7],
  [0.18, 0],
  [0.5, 0],
  [0.92, 1],
];

const PHOTO_HEIGHT = 316;
/** The hero below the photo, which the fade covers. */
const HERO_FOOT = 24;
/** Every photo starts with this much plain backdrop, which may lie under the status bar. */
const PHOTO_HEADROOM = 34;

// The tabs are routes of their own; switching between them doesn't carry the URL's id along.
const ExerciseIdContext = createContext('');

/** The exercise shown on the exercise page, for its tabs. */
export const useExerciseId = () => use(ExerciseIdContext);

/**
 * Exercise info (design 06e): photo, name and the swipeable tabs "Übung" (muscles, technique)
 * and "Historie" (/exercise/[id]/history). Both stay mounted. Opened from the live workout, the
 * workout summary, the routines, the plan import and the search.
 */
export function ExerciseLayout() {
  const { id: exerciseId } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation(['exercises', 'common']);
  const insets = useSafeAreaInsets();
  const photoTop = Math.max(0, insets.top - PHOTO_HEADROOM);
  const [menuOpen, setMenuOpen] = useState(false);
  const [failedImage, setFailedImage] = useState<Exercise['image']>(null);
  const exercise = useExercise(exerciseId);
  const name = useExerciseName(exerciseId, i18n.language);
  const equipment = useEquipmentName(exercise?.equipment ?? '', i18n.language);
  // An imported plan's new exercise isn't saved before sign-up: nothing to edit yet.
  const saved = useCustomExerciseStore((s) => !!s.exercises[exerciseId]);
  const back = (
    <View className="absolute left-4" style={{ top: insets.top + 16 }}>
      <IconButton
        icon="chevron-left"
        accessibilityLabel={t('common:actions.back')}
        onPress={() => router.back()}
      />
    </View>
  );
  // An exercise neither the catalog nor the user has: nothing to show but the way back.
  if (!exercise) return <View className="flex-1 bg-bg">{back}</View>;

  // The user's own exercises can be edited or deleted; a deleted one only keeps its history.
  const editable = saved && exercise.isActive;

  const onMenu = (action: 'edit' | 'delete') => {
    setMenuOpen(false);
    if (action === 'edit') {
      afterSheetClose(() => router.push(`/custom-exercise/${exerciseId}`));
      return;
    }
    void archiveCustomExercise(exerciseId).then(() => {
      haptics.success();
      router.back();
    });
  };

  return (
    <View className="flex-1 bg-bg">
      <View className="overflow-hidden" style={{ height: photoTop + PHOTO_HEIGHT + HERO_FOOT }}>
        {/* A photo that can't load (no connection, not saved yet) falls back to the thumbnail. */}
        {exercise.image && exercise.image !== failedImage ? (
          <>
            {/* Its mirror image fills the gap up to the screen's edge: only backdrop shows there. */}
            <Image
              source={exercise.image}
              contentFit="cover"
              contentPosition="top"
              style={[
                StyleSheet.absoluteFill,
                {
                  top: photoTop - PHOTO_HEIGHT,
                  bottom: undefined,
                  height: PHOTO_HEIGHT,
                  transform: [{ scaleY: -1 }],
                },
              ]}
            />
            <Image
              source={exercise.image}
              contentFit="cover"
              contentPosition="top"
              style={[
                StyleSheet.absoluteFill,
                { top: photoTop, bottom: undefined, height: PHOTO_HEIGHT },
              ]}
              onError={() => setFailedImage(exercise.image)}
            />
          </>
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
        {editable ? (
          <View className="absolute right-4" style={{ top: insets.top + 16 }}>
            <IconButton
              icon="more"
              accessibilityLabel={t('exercises:custom.menu')}
              onPress={() => setMenuOpen(true)}
            />
          </View>
        ) : null}
        <View className="absolute right-5 bottom-1.5 left-5">
          <Text variant="headline" className="text-[30px] leading-9">
            {name}
          </Text>
          <Text variant="label" tone="muted" className="mt-2 font-inter">
            {`${exercise.equipment ? equipment : t('exercises:custom.label')} · ${t(`exercises:groups.${primaryGroup(exercise)}`)}`}
          </Text>
        </View>
      </View>
      <ExerciseIdContext value={exerciseId}>
        <SwipeTabs>
          <TopTabs.Screen name="index" options={{ title: t('exercises:detail.tabs.exercise') }} />
          <TopTabs.Screen name="history" options={{ title: t('exercises:detail.tabs.history') }} />
        </SwipeTabs>
      </ExerciseIdContext>
      {editable ? (
        <ActionSheet
          visible={menuOpen}
          onClose={() => setMenuOpen(false)}
          onAction={onMenu}
          items={[
            { action: 'edit', icon: 'pencil', label: t('exercises:custom.edit') },
            { action: 'delete', label: t('common:actions.delete') },
          ]}
        />
      ) : null}
    </View>
  );
}
