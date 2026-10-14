import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { muscleShares } from '@/shared/data/muscles';
import type { RoutineSummary } from '@/shared/data/routines';
import { CheckBadge } from '@/shared/ui/check-item';
import { MuscleCircle } from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

export interface OtherRoutineSheetProps {
  visible: boolean;
  planName: string;
  /** The plan's routines in order. */
  routines: RoutineSummary[];
  /** The routine the card shows now. */
  shownId: string | null;
  /** The plan's next routine, tagged "Als Nächstes". */
  nextId: string | null;
  onPick: (routineId: string) => void;
  onClose: () => void;
}

/** "Anderes Training": another routine of the plan for the day instead of the next one. */
export function OtherRoutineSheet({
  visible,
  planName,
  routines,
  shownId,
  nextId,
  onPick,
  onClose,
}: OtherRoutineSheetProps) {
  const { t } = useTranslation(['today', 'training']);
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('otherSheet.title')}
      subtitle={t('otherSheet.subtitle', { plan: planName })}
    >
      <View className="gap-1.5">
        {routines.map((routine) => {
          const shown = routine.id === shownId;
          const meta = t('training:list.meta', {
            count: routine.exerciseCount,
            minutes: routine.estimatedMinutes,
          });
          return (
            <PressableScale
              key={routine.id}
              haptic="select"
              accessibilityRole="radio"
              accessibilityState={{ checked: shown }}
              onPress={() => onPick(routine.id)}
              className="flex-row items-center gap-3 rounded-2xl py-2 pr-4 pl-2"
            >
              {/* The muscle it works most. */}
              <MuscleCircle
                muscle={muscleShares(routine.items)[0]?.muscle ?? null}
                className="size-11"
              />
              <View className="min-w-0 flex-1 gap-0.5">
                <Text variant="label" numberOfLines={1}>
                  {routine.name}
                </Text>
                <Text
                  variant="caption"
                  tone={routine.id === nextId ? 'accent' : 'subtle'}
                  className="font-inter"
                >
                  {routine.id === nextId ? `${t('status.next')} · ${meta}` : meta}
                </Text>
              </View>
              {shown ? <CheckBadge size={24} glyph={12} /> : null}
            </PressableScale>
          );
        })}
      </View>
    </Sheet>
  );
}
