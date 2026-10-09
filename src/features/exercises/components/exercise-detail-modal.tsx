import { Modal, Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getExercise } from '@/shared/data/exercises';

import { ExerciseDetail } from './exercise-detail';

export interface ExerciseDetailModalProps {
  /** Exercise to show; the modal is hidden while null. */
  exerciseId: string | null;
  onClose: () => void;
}

/** Presents the exercise detail as a page sheet (iOS) or full-screen modal (Android). */
export function ExerciseDetailModal({ exerciseId, onClose }: ExerciseDetailModalProps) {
  const insets = useSafeAreaInsets();
  const pageSheet = Platform.OS === 'ios';
  // An exercise the catalog doesn't have would leave the page empty.
  const shownId = exerciseId && getExercise(exerciseId) ? exerciseId : null;
  return (
    <Modal
      visible={!!shownId}
      animationType="slide"
      presentationStyle={pageSheet ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* A modal is outside the app's gesture root: the history chart's scrub needs its own. */}
      <GestureHandlerRootView style={StyleSheet.absoluteFill}>
        {shownId ? (
          <ExerciseDetail
            exerciseId={shownId}
            onClose={onClose}
            topInset={pageSheet ? 0 : insets.top}
          />
        ) : null}
      </GestureHandlerRootView>
    </Modal>
  );
}
