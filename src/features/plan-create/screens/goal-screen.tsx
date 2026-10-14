import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { Button } from '@/shared/ui/button';
import { OptionCard } from '@/shared/ui/option-card';
import { StepScreen } from '@/shared/ui/step-screen';

import { useCreateStep } from '../hooks/use-create-step';
import { GOALS } from '../lib/goals';

export function GoalScreen() {
  const { t } = useTranslation(['planCreate', 'common']);
  const counter = useCreateStep('goal');
  const { step } = usePlanFlow();
  const draft = useDraft();
  const update = useUpdateDraft();
  const goal = draft.goal ?? 'hypertrophy';

  return (
    <StepScreen
      {...counter}
      title={t('planCreate:goal.title')}
      scroll
      footer={
        <Button
          label={t('common:actions.continue')}
          onPress={() => {
            update({ goal });
            router.push(step('/create/focus'));
          }}
        />
      }
    >
      <View className="gap-2.5 px-4 pt-7">
        {GOALS.map((g, i) => (
          <OptionCard
            key={g}
            index={i + 1}
            title={t(`planCreate:goal.options.${g}.title`)}
            description={t(`planCreate:goal.options.${g}.description`)}
            selected={goal === g}
            onPress={() => update({ goal: g })}
          />
        ))}
      </View>
    </StepScreen>
  );
}
