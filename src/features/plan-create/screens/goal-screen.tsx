import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { StepHeader } from '@/shared/ui/step-header';

import { GoalCard } from '../components/goal-card';
import { StepTitle } from '../components/step-title';
import { CREATE_STEPS } from '../lib/flow';
import { GOAL_REPS, GOALS } from '../lib/goal-ranges';

export function GoalScreen() {
  const { t } = useTranslation(['planCreate', 'common']);
  const draft = useDraft();
  const update = useUpdateDraft();
  const goal = draft.goal ?? 'hypertrophy';

  return (
    <Screen
      scroll
      header={<StepHeader step={1} total={CREATE_STEPS} />}
      footer={
        <Button
          label={t('common:actions.continue')}
          onPress={() => {
            update({ goal });
            router.push('/create/focus');
          }}
        />
      }
    >
      <StepTitle title={t('planCreate:goal.title')} />
      <View className="gap-2.5 px-4 pt-7">
        {GOALS.map((g, i) => (
          <GoalCard
            key={g}
            index={i + 1}
            title={t(`planCreate:goal.options.${g}.title`)}
            description={t(`planCreate:goal.options.${g}.description`)}
            reps={GOAL_REPS[g]}
            selected={goal === g}
            onPress={() => update({ goal: g })}
          />
        ))}
      </View>
    </Screen>
  );
}
