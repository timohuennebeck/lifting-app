import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { MUSCLE_CARDS, MuscleMap, type MuscleId } from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

/** Push, pull, legs: one muscle each. */
const MUSCLES: MuscleId[] = ['chest', 'lats', 'quads'];
const CIRCLE = 64;
/** Background-coloured ring that cuts each circle out of the one it overlaps. */
const RING = 3;
const OUTER = CIRCLE + 2 * RING;
const STEP = 44;
const STACK_WIDTH = STEP * MUSCLES.length + OUTER;

function MuscleCircle({ muscle, left }: { muscle: MuscleId; left: number }) {
  const card = MUSCLE_CARDS[muscle];
  return (
    <View
      className="absolute top-0 overflow-hidden rounded-full border-bg bg-elevated"
      style={{ left, width: OUTER, height: OUTER, borderWidth: RING }}
    >
      <MuscleMap
        view={card.view}
        viewBox={card.viewBox}
        selected={[muscle]}
        accent={colors.dim}
        fit="cover"
      />
    </View>
  );
}

export interface UnplannedDayProps {
  /** Picks a workout for the day. */
  onPress: () => void;
}

/** Shown when the selected day has neither a finished nor a planned workout. */
export function UnplannedDay({ onPress }: UnplannedDayProps) {
  const { t } = useTranslation('today');
  return (
    <View className="flex-1 items-center justify-center px-8 pb-12">
      <PressableScale
        haptic="tap"
        activeScale={0.97}
        accessibilityRole="button"
        accessibilityLabel={`${t('unplanned.title')}. ${t('unplanned.body')}`}
        onPress={onPress}
        className="items-center"
      >
        <View style={{ width: STACK_WIDTH, height: OUTER }}>
          {/* Drawn back to front: each circle lies on the one to its right, the plus on top. */}
          {MUSCLES.map((muscle, i) => ({ muscle, left: i * STEP }))
            .reverse()
            .map(({ muscle, left }) => (
              <MuscleCircle key={muscle} muscle={muscle} left={left} />
            ))}
          <View
            className="absolute top-0 items-center justify-center rounded-full border-bg bg-accent"
            style={{ left: MUSCLES.length * STEP, width: OUTER, height: OUTER, borderWidth: RING }}
          >
            <Icon name="plus" size={22} color={colors.onAccent} />
          </View>
        </View>
        <Text variant="headline" className="mt-6 text-center">
          {t('unplanned.title')}
        </Text>
        <Text variant="paragraph" tone="subtle" className="mt-2 text-center">
          {t('unplanned.body')}
        </Text>
      </PressableScale>
    </View>
  );
}
