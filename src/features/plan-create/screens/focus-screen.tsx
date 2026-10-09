import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  groupOfPart,
  MUSCLE_GROUP_IDS,
  MUSCLE_GROUPS,
  type MuscleGroupId,
} from '@/features/exercises/lib/muscle-groups';
import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { BodyMaps, type BodyPartId } from '@/shared/ui/muscle-map';
import { StepScreen } from '@/shared/ui/step-screen';

import { CREATE_STEPS } from '../lib/flow';

/** Joints (knees, hands, feet) and the neck belong to no focus group. */
const hasGroup = (part: BodyPartId) => groupOfPart(part) !== null;

export function FocusScreen() {
  const { t } = useTranslation(['planCreate', 'exercises', 'common']);
  const { focus } = useDraft();
  const update = useUpdateDraft();
  const groups = MUSCLE_GROUP_IDS.filter((g) => MUSCLE_GROUPS[g].some((m) => focus.includes(m)));

  function toggle(group: MuscleGroupId) {
    const muscles = MUSCLE_GROUPS[group];
    update({
      focus: groups.includes(group)
        ? focus.filter((m) => !muscles.includes(m))
        : [...focus, ...muscles.filter((m) => !focus.includes(m))],
    });
  }

  return (
    <StepScreen
      step={2}
      total={CREATE_STEPS}
      title={t('planCreate:focus.title')}
      subtitle={t('planCreate:focus.subtitle')}
      subtitleTone="subtle"
      scroll
      footer={
        <Button
          label={
            groups.length
              ? t('planCreate:focus.cta', { count: groups.length })
              : t('common:actions.continue')
          }
          onPress={() => router.push('/create/equipment')}
        />
      }
    >
      <View className="flex-row flex-wrap gap-2 px-4 pt-5.5">
        <Chip
          label={t('planCreate:focus.none')}
          selected={!groups.length}
          onPress={() => update({ focus: [] })}
          className="h-11 px-4.5"
        />
        {MUSCLE_GROUP_IDS.map((g) => (
          <Chip
            key={g}
            label={t(`exercises:groups.${g}`)}
            selected={groups.includes(g)}
            onPress={() => toggle(g)}
            className="h-11 px-4.5"
          />
        ))}
      </View>
      <BodyMaps
        accessibilityLabel={t('planCreate:focus.mapA11y')}
        selected={focus}
        isSelectable={hasGroup}
        onToggle={(part) => {
          const group = groupOfPart(part);
          if (group) toggle(group);
        }}
      />
    </StepScreen>
  );
}
