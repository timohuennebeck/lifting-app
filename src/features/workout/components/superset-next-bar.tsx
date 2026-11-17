import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { FadeIn } from 'react-native-reanimated';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { useExerciseName } from '@/shared/data/exercises';
import { colors } from '@/shared/lib/theme';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

/** The bar's height over the foot of the sets, as room to scroll them out from under it. */
export const NEXT_BAR_HEIGHT = 112;

export interface SupersetNextBarProps {
  exerciseId: string;
  /** "A2". */
  label: string;
  /** The set it does next, from 0, and how many it has. */
  setIndex: number;
  setCount: number;
  /** Its suggested set, e.g. "55 kg × 12"; none the first time. */
  suggested: string | null;
}

/**
 * At the foot of a superset's exercise: its partner, done right after this set without rest
 * (design V2: the photo carries the superset's link mark).
 */
export function SupersetNextBar({
  exerciseId,
  label,
  setIndex,
  setCount,
  suggested,
}: SupersetNextBarProps) {
  const { t, i18n } = useTranslation('workout');
  const name = useExerciseName(exerciseId, i18n.language);
  const set = t('superset.nextSet', { label, current: setIndex + 1, total: setCount });
  return (
    <BottomFade entering={FadeIn.duration(250)}>
      <View className="flex-row items-center gap-4.5 px-1 pb-1">
        <View>
          <ExerciseThumb exerciseId={exerciseId} name={name} className="h-20 w-15" />
          <View className="absolute -right-2.75 -bottom-2.75 size-7.5 items-center justify-center rounded-full border-[3px] border-bg bg-accent">
            <Icon name="link" size={12} color={colors.onAccent} />
          </View>
        </View>
        <View className="min-w-0 flex-1">
          <Text variant="overline" tone="subtle" className="text-xs leading-4 tracking-[1.2px]">
            {t('superset.nextNoRest')}
          </Text>
          <Text variant="bodyStrong" numberOfLines={1} className="mt-0.5">
            {name}
          </Text>
          <Text variant="caption" tone="subtle" numberOfLines={1} className="mt-0.5 font-inter">
            {suggested ? `${set} · ${suggested}` : set}
          </Text>
        </View>
      </View>
    </BottomFade>
  );
}
