import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { MAX_SESSIONS_PER_WEEK, MIN_SESSIONS_PER_WEEK } from '@/shared/data/plans';
import { Button } from '@/shared/ui/button';
import { StepScreen } from '@/shared/ui/step-screen';

import { NumberStepper } from '../components/number-stepper';
import { useCreateStep } from '../hooks/use-create-step';
import { chosenSplit } from '../lib/splits';

/** How many workouts a week the plan is for (on whichever days suit the user); then the split. */
export function SessionsScreen() {
  const { t } = useTranslation(['planCreate', 'common']);
  const counter = useCreateStep('sessions');
  const { step } = usePlanFlow();
  const draft = useDraft();
  const update = useUpdateDraft();

  return (
    <StepScreen
      {...counter}
      title={t('planCreate:sessions.title')}
      footer={
        <Button
          label={t('common:actions.continue')}
          onPress={() => {
            // Keeps the split picked before while it suits the week, else none (the AI picks).
            update({ split: chosenSplit(draft) });
            router.push(step('/create/split'));
          }}
        />
      }
    >
      <NumberStepper
        value={draft.sessionsPerWeek}
        min={MIN_SESSIONS_PER_WEEK}
        max={MAX_SESSIONS_PER_WEEK}
        onChange={(next) => update({ sessionsPerWeek: next })}
        format={(n) => t('planCreate:sessions.times', { count: n })}
        unit={t('planCreate:sessions.perWeek')}
      />
    </StepScreen>
  );
}
