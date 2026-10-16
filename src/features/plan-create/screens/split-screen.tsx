import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { Button } from '@/shared/ui/button';
import { OptionCard } from '@/shared/ui/option-card';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { useCreateStep } from '../hooks/use-create-step';
import { chosenSplit, splitsFor } from '../lib/splits';

/**
 * How the routines divide the body, offering only the splits that suit the workouts a week (the
 * recommended one first and picked). Left out when only one suits (SessionsScreen).
 */
export function SplitScreen() {
  const { t } = useTranslation(['planCreate', 'common']);
  const counter = useCreateStep('split');
  const { step } = usePlanFlow();
  const draft = useDraft();
  const update = useUpdateDraft();
  const { sessionsPerWeek } = draft;
  const split = chosenSplit(draft);

  return (
    <StepScreen
      {...counter}
      title={t('planCreate:split.title')}
      subtitle={t('planCreate:split.subtitle', { count: sessionsPerWeek })}
      scroll
      footer={
        <Button
          label={t('common:actions.continue')}
          onPress={() => {
            update({ split });
            router.push(step('/create/duration'));
          }}
        />
      }
    >
      <View className="gap-2.5 px-4 pt-7">
        {splitsFor(sessionsPerWeek, draft.experience).map((option) => (
          <OptionCard
            key={option}
            icon={
              <Text
                tone={split === option ? 'onAccent' : 'default'}
                className="font-inter-semibold text-[13px] leading-4"
              >
                {t(`planCreate:split.options.${option}.short`)}
              </Text>
            }
            title={t(`planCreate:split.options.${option}.title`)}
            description={t(`planCreate:split.options.${option}.description`)}
            selected={split === option}
            onPress={() => update({ split: option })}
          />
        ))}
      </View>
    </StepScreen>
  );
}
