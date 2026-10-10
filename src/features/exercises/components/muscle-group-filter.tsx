import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { MuscleChip, type MuscleId } from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';

import { MUSCLE_GROUP_IDS, MUSCLE_GROUPS, type MuscleGroupId } from '../lib/muscle-groups';

/** The muscle whose crop of the body map pictures each group. */
const GROUP_ART: Record<MuscleGroupId, MuscleId> = {
  chest: 'chest',
  back: 'lats',
  shoulders: 'front_delts',
  arms: 'biceps',
  core: 'abs',
  glutes: 'glutes',
  legs: 'quads',
};

export interface MuscleGroupFilterProps {
  value: MuscleGroupId | null;
  onChange: (group: MuscleGroupId | null) => void;
  /** Horizontal padding of the page, so the row can scroll edge to edge. */
  inset: number;
}

/**
 * Library filter as muscle chips, one group at a time: tapping a chip selects it (neon),
 * tapping it again shows every exercise again.
 */
export function MuscleGroupFilter({ value, onChange, inset }: MuscleGroupFilterProps) {
  const { t } = useTranslation('exercises');
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // A horizontal ScrollView grows by default; this one is as tall as its chips.
      style={{ flexGrow: 0, flexShrink: 0, marginHorizontal: -inset }}
      contentContainerClassName="gap-2"
      contentContainerStyle={{ paddingHorizontal: inset }}
      keyboardShouldPersistTaps="handled"
    >
      {MUSCLE_GROUP_IDS.map((group) => {
        const selected = value === group;
        return (
          <PressableScale
            key={group}
            haptic="select"
            accessibilityRole="radio"
            accessibilityLabel={t(`groups.${group}`)}
            accessibilityState={{ selected }}
            onPress={() => onChange(selected ? null : group)}
          >
            <MuscleChip
              art={GROUP_ART[group]}
              lit={MUSCLE_GROUPS[group]}
              label={t(`groups.${group}`)}
              highlight={selected}
              selected={selected}
            />
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}
