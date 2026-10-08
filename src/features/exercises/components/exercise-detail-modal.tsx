import { Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  return (
    <Modal
      visible={!!exerciseId}
      animationType="slide"
      presentationStyle={pageSheet ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {exerciseId ? (
        <ExerciseDetail
          exerciseId={exerciseId}
          onClose={onClose}
          topInset={pageSheet ? 0 : insets.top}
        />
      ) : null}
    </Modal>
  );
}
