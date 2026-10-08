import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { Button } from '@/shared/ui/button';
import { OptionCard } from '@/shared/ui/option-card';
import { StepScreen } from '@/shared/ui/step-screen';

import { CREATE_STEPS } from '../lib/flow';
import { GOALS } from '../lib/goal-ranges';

export function GoalScreen() {
  const { t } = useTranslation(['planCreate', 'common']);
  const draft = useDraft();
  const update = useUpdateDraft();
  const goal = draft.goal ?? 'hypertrophy';

  return (
    <StepScreen
      step={1}
      total={CREATE_STEPS}
      title={t('planCreate:goal.title')}
      scroll
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
