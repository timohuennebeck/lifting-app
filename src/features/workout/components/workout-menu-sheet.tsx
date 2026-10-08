import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui/button';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { useWorkoutActions } from '../hooks/use-workout-actions';

export interface WorkoutMenuSheetProps {
  visible: boolean;
  onClose: () => void;
  workoutId: string;
  name: string;
  doneSets: number;
  totalSets: number;
}

/** Finish, continue later or discard the running workout. */
export function WorkoutMenuSheet({
  visible,
  onClose,
  workoutId,
  name,
  doneSets,
  totalSets,
}: WorkoutMenuSheetProps) {
  const { t } = useTranslation('workout');
  const { finish, discard, leave, finishing } = useWorkoutActions(workoutId);
  const canFinish = doneSets > 0;

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={name}
      subtitle={t('menu.progress', { done: doneSets, total: totalSets })}
    >
      <View className="gap-2.5">
        <Button
          label={t('menu.finish')}
          icon="check"
          disabled={!canFinish}
          loading={finishing}
          onPress={finish}
        />
        {!canFinish ? (
          <Text variant="caption" tone="subtle" className="text-center font-inter">
            {t('menu.finishHint')}
          </Text>
        ) : null}
        <Button
          label={t('menu.later')}
          variant="secondary"
          onPress={() => {
            onClose();
            leave();
          }}
        />
        <Button
          label={t('menu.discard')}
          variant="danger"
          icon="trash"
          haptic="none"
          onPress={discard}
        />
      </View>
    </Sheet>
  );
}
