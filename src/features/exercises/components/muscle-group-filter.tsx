import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { MUSCLE_CARDS, MuscleMap, type MuscleId } from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

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

/** "All": every muscle of the front view lit up. */
const ALL_MUSCLES = MUSCLE_GROUP_IDS.flatMap((g) => MUSCLE_GROUPS[g]);

interface GroupBoxProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
}

function GroupBox({ label, selected, onPress, children }: GroupBoxProps) {
  return (
    <PressableScale
      haptic="select"
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      className="w-16 items-center gap-1.5"
    >
      <View className="size-16 overflow-hidden rounded-2xl bg-elevated">
        {children}
        {selected ? (
          <View
            pointerEvents="none"
            className="absolute inset-0 rounded-2xl border-2 border-accent"
          />
        ) : null}
      </View>
      <Text
        variant="caption"
        numberOfLines={1}
        className={cn('text-xs leading-4', selected ? 'text-fg' : 'text-subtle')}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

export interface MuscleGroupFilterProps {
  value: MuscleGroupId | null;
  onChange: (group: MuscleGroupId | null) => void;
  /** Horizontal padding of the page, so the row can scroll edge to edge. */
  inset: number;
}

/** Library filter as muscle boxes: the group's muscles lit on the body map, its name below. */
export function MuscleGroupFilter({ value, onChange, inset }: MuscleGroupFilterProps) {
  const { t } = useTranslation('exercises');
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // A horizontal ScrollView grows by default; this one is as tall as its boxes.
      style={{ flexGrow: 0, flexShrink: 0, marginHorizontal: -inset }}
      contentContainerClassName="gap-2.5"
      contentContainerStyle={{ paddingHorizontal: inset }}
      keyboardShouldPersistTaps="handled"
    >
      <GroupBox label={t('groups.all')} selected={!value} onPress={() => onChange(null)}>
        <MuscleMap view="front" selected={ALL_MUSCLES} />
      </GroupBox>
      {MUSCLE_GROUP_IDS.map((group) => {
        const card = MUSCLE_CARDS[GROUP_ART[group]];
        return (
          <GroupBox
            key={group}
            label={t(`groups.${group}`)}
            selected={value === group}
            onPress={() => onChange(value === group ? null : group)}
          >
            <MuscleMap
              view={card.view}
              viewBox={card.viewBox}
              selected={MUSCLE_GROUPS[group]}
              fit="cover"
            />
          </GroupBox>
        );
      })}
    </ScrollView>
  );
}
