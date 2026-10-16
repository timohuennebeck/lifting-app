import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import type { Split } from '@/shared/data/profile';
import { Button } from '@/shared/ui/button';
import { OptionCard } from '@/shared/ui/option-card';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { useCreateStep } from '../hooks/use-create-step';
import { chosenSplit, splitsFor } from '../lib/splits';

/** "Keine Präferenz" (null) leaves the split to the AI. */
const NONE = 'none';

/**
 * How the routines divide the body: "Keine Präferenz" (the AI picks, the default), then only the
 * splits that suit the workouts a week, the recommended one first.
 */
export function SplitScreen() {
  const { t } = useTranslation(['planCreate', 'common']);
  const counter = useCreateStep('split');
  const { step } = usePlanFlow();
  const draft = useDraft();
  const update = useUpdateDraft();
  const { sessionsPerWeek } = draft;
  const split = chosenSplit(draft);
  const options: (Split | typeof NONE)[] = [NONE, ...splitsFor(sessionsPerWeek, draft.experience)];

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
        {options.map((option) => {
          const selected = (split ?? NONE) === option;
          return (
            <OptionCard
              key={option}
              icon={
                <Text
                  tone={selected ? 'onAccent' : 'default'}
                  className="font-inter-semibold text-[13px] leading-4"
                >
                  {t(`planCreate:split.options.${option}.short`)}
                </Text>
              }
              title={t(`planCreate:split.options.${option}.title`)}
              description={t(`planCreate:split.options.${option}.description`)}
              selected={selected}
              onPress={() => update({ split: option === NONE ? null : option })}
            />
          );
        })}
      </View>
    </StepScreen>
  );
}
