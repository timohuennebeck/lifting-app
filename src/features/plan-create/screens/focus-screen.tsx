import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  groupOfMuscle,
  MUSCLE_GROUP_IDS,
  MUSCLE_GROUPS,
  type MuscleGroupId,
} from '@/features/exercises/lib/muscle-groups';
import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { MuscleMap } from '@/shared/ui/muscle-map';
import { Screen } from '@/shared/ui/screen';
import { StepHeader } from '@/shared/ui/step-header';

import { StepTitle } from '../components/step-title';
import { CREATE_STEPS } from '../lib/flow';

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
    <Screen
      scroll
      header={<StepHeader step={2} total={CREATE_STEPS} />}
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
      <StepTitle title={t('planCreate:focus.title')} subtitle={t('planCreate:focus.subtitle')} />
      <View className="flex-row flex-wrap gap-2 px-4 pt-[22px]">
        <Chip
          label={t('planCreate:focus.none')}
          selected={!groups.length}
          onPress={() => update({ focus: [] })}
          className="h-11 px-[18px]"
        />
        {MUSCLE_GROUP_IDS.map((g) => (
          <Chip
            key={g}
            label={t(`exercises:groups.${g}`)}
            selected={groups.includes(g)}
            onPress={() => toggle(g)}
            className="h-11 px-[18px]"
          />
        ))}
      </View>
      <View
        accessibilityLabel={t('planCreate:focus.mapA11y')}
        className="mx-4 mt-5 h-80 flex-row gap-1 rounded-[28px] bg-surface px-2 pt-4 pb-3"
      >
        {(['front', 'back'] as const).map((view) => (
          <View key={view} className="min-w-0 flex-1">
            <MuscleMap
              view={view}
              selected={focus}
              onToggle={(muscle) => toggle(groupOfMuscle(muscle))}
            />
          </View>
        ))}
      </View>
    </Screen>
  );
}
