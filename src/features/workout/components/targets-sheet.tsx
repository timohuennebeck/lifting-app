import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { WorkoutExercise, WorkoutSet } from '@/shared/data/workouts';
import { clamp } from '@/shared/lib/math';
import { colors } from '@/shared/lib/theme';
import { useUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { Sheet } from '@/shared/ui/sheet';
import { RirBadge } from '@/shared/ui/rir-badge';
import { Text } from '@/shared/ui/text';

import {
  addWorkoutSet,
  removeWorkoutSet,
  type SetTargets,
  updateSetTargets,
} from '../data/workout-mutations';

interface MiniStepperProps {
  value: number | null;
  label: string;
  onStep: (delta: number) => void;
  children?: ReactNode;
}

function MiniStepper({ value, label, onStep, children }: MiniStepperProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center gap-1" accessibilityLabel={label}>
      <IconButton
        icon="minus"
        size={30}
        iconSize={10}
        haptic="select"
        accessibilityLabel={`${label} ${t('actions.decrease')}`}
        onPress={() => onStep(-1)}
      />
      <View className="w-7 items-center">
        {children ?? <Text variant="bodyStrong">{value ?? '–'}</Text>}
      </View>
      <IconButton
        icon="plus"
        size={30}
        iconSize={10}
        haptic="select"
        accessibilityLabel={`${label} ${t('actions.increase')}`}
        onPress={() => onStep(1)}
      />
    </View>
  );
}

function targetsOf(set: WorkoutSet): SetTargets {
  const min = set.targetMin ?? 8;
  return { min, max: set.targetMax ?? min, rir: set.targetRir };
}

export interface TargetsSheetProps {
  visible: boolean;
  onClose: () => void;
  exercise: WorkoutExercise | undefined;
  exerciseName: string;
}

/** Edit rep range and target RIR per set of the current exercise. */
export function TargetsSheet({ visible, onClose, exercise, exerciseName }: TargetsSheetProps) {
  const { t } = useTranslation('workout');
  const userId = useUserId();
  const sets = exercise?.sets ?? [];

  const change = (set: WorkoutSet, patch: (v: SetTargets) => SetTargets) =>
    updateSetTargets(set.id, patch(targetsOf(set)));

  return (
    <Sheet visible={visible} onClose={onClose} title={t('targets.title')} subtitle={exerciseName}>
      <View className="flex-row items-center gap-2 pb-2">
        <View className="w-7" />
        <Text variant="overline" tone="subtle" className="flex-1 text-center text-[11px]">
          {t('targets.min')}
        </Text>
        <Text variant="overline" tone="subtle" className="flex-1 text-center text-[11px]">
          {t('targets.max')}
        </Text>
        <Text variant="overline" tone="subtle" className="flex-1 text-center text-[11px]">
          {t('targets.rir')}
        </Text>
        <View className="w-7" />
      </View>
      <View className="gap-2">
        {sets.map((set, i) => {
          const v = targetsOf(set);
          return (
            <View key={set.id} className="h-12 flex-row items-center gap-2">
              <View className="size-7 items-center justify-center rounded-full bg-elevated">
                <Text variant="caption">{i + 1}</Text>
              </View>
              <View className="flex-1 items-center">
                <MiniStepper
                  value={v.min}
                  label={t('targets.min')}
                  onStep={(d) =>
                    change(set, (x) => {
                      const min = clamp(x.min + d, 1, 50);
                      return { ...x, min, max: Math.max(min, x.max) };
                    })
                  }
                />
              </View>
              <View className="flex-1 items-center">
                <MiniStepper
                  value={v.max}
                  label={t('targets.max')}
                  onStep={(d) => change(set, (x) => ({ ...x, max: clamp(x.max + d, x.min, 60) }))}
                />
              </View>
              <View className="flex-1 items-center">
                <MiniStepper
                  value={v.rir}
                  label={t('targets.rir')}
                  onStep={(d) =>
                    change(set, (x) => ({ ...x, rir: x.rir == null ? 2 : clamp(x.rir + d, 0, 5) }))
                  }
                >
                  {v.rir != null ? <RirBadge rir={v.rir} size={24} /> : undefined}
                </MiniStepper>
              </View>
              <IconButton
                icon="trash"
                size={28}
                iconSize={12}
                color={colors.subtle}
                className={sets.length <= 1 ? 'bg-transparent opacity-30' : 'bg-transparent'}
                disabled={sets.length <= 1}
                accessibilityLabel={t('targets.remove', { n: i + 1 })}
                onPress={() => removeWorkoutSet(set.id)}
              />
            </View>
          );
        })}
      </View>
      <Button
        label={t('table.addSet')}
        variant="secondary"
        icon="plus"
        className="mt-5"
        onPress={() => exercise && userId && addWorkoutSet(userId, exercise.id)}
      />
    </Sheet>
  );
}
