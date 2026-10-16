import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { clampSessions, MAX_SESSIONS_PER_WEEK, MIN_SESSIONS_PER_WEEK } from '@/shared/data/plans';
import { Button } from '@/shared/ui/button';
import { NumberStepper } from '@/shared/ui/number-stepper';
import { StepScreen } from '@/shared/ui/step-screen';

import { useCreateStep } from '../hooks/use-create-step';
import { chosenSplit } from '../lib/splits';

/** How many workouts a week the plan is for (on whichever days suit the user); then the split. */
export function SessionsScreen() {
  const { t } = useTranslation(['planCreate', 'common']);
  const counter = useCreateStep('sessions');
  const { step } = usePlanFlow();
  const draft = useDraft();
  // A draft from before the 2–6 range shows within it.
  const sessionsPerWeek = clampSessions(draft.sessionsPerWeek);
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
            update({ sessionsPerWeek, split: chosenSplit({ ...draft, sessionsPerWeek }) });
            router.push(step('/create/split'));
          }}
        />
      }
    >
      <NumberStepper
        value={sessionsPerWeek}
        min={MIN_SESSIONS_PER_WEEK}
        max={MAX_SESSIONS_PER_WEEK}
        onChange={(next) => update({ sessionsPerWeek: next })}
        format={(n) => t('planCreate:sessions.times', { count: n })}
        unit={t('planCreate:sessions.perWeek')}
      />
    </StepScreen>
  );
}
