import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { MAX_SESSIONS_PER_WEEK } from '@/shared/data/plans';
import { Button } from '@/shared/ui/button';
import { NumberStepper } from '@/shared/ui/number-stepper';
import { StepScreen } from '@/shared/ui/step-screen';

import { useCreateStep } from '../hooks/use-create-step';
import { chosenSplit, splitsFor } from '../lib/splits';

/**
 * How many workouts a week the plan is for (on whichever days suit the user); then the split,
 * when more than one suits that many.
 */
export function SessionsScreen() {
  const { t } = useTranslation(['planCreate', 'common']);
  const counter = useCreateStep('sessions');
  const { step } = usePlanFlow();
  const draft = useDraft();
  const { sessionsPerWeek } = draft;
  const update = useUpdateDraft();

  return (
    <StepScreen
      {...counter}
      title={t('planCreate:sessions.title')}
      footer={
        <Button
          label={t('common:actions.continue')}
          onPress={() => {
            // Keeps the split picked before if it still suits, else the recommended one.
            update({ split: chosenSplit(draft) });
            const ask = splitsFor(sessionsPerWeek, draft.experience).length > 1;
            router.push(step(ask ? '/create/split' : '/create/duration'));
          }}
        />
      }
    >
      <NumberStepper
        value={sessionsPerWeek}
        min={1}
        max={MAX_SESSIONS_PER_WEEK}
        onChange={(next) => update({ sessionsPerWeek: next })}
        format={(n) => t('planCreate:sessions.times', { count: n })}
        unit={t('planCreate:sessions.perWeek')}
      />
    </StepScreen>
  );
}
