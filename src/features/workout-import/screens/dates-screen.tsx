import { Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { Button } from '@/shared/ui/button';
import { StepScreen } from '@/shared/ui/step-screen';
import { TextButton } from '@/shared/ui/text-button';

import { UndatedChart } from '../components/undated-chart';
import { useImportSteps } from '../hooks/use-import-steps';
import { monthBars } from '../lib/month-bars';
import { useWorkoutImportStore } from '../stores/workout-import-store';
import { useImportStep } from '../hooks/use-import-step';
import { CTA_STYLE, LINK_STYLE, TITLE_STYLE } from '../lib/steps';

/**
 * 18a: workouts of the file without a date get one between their neighbours (spreadUndated);
 * "Passt so" keeps them so, "Ohne Datum weglassen" leaves them out.
 */
export function DatesScreen() {
  const { t } = useTranslation('workoutImport');
  const { step } = usePlanFlow();
  const workouts = useWorkoutImportStore((s) => s.workouts);
  const setKeepUndated = useWorkoutImportStore((s) => s.setKeepUndated);
  const { finish } = useImportSteps();
  const counter = useImportStep('dates');
  const undated = workouts.filter((w) => !w.start).length;
  if (!undated) return <Redirect href={step('/import')} />;

  function go(keep: boolean) {
    setKeepUndated(keep);
    finish();
  }

  return (
    <StepScreen
      {...TITLE_STYLE}
      step={counter.step}
      total={counter.total}
      title={t('dates.title')}
      subtitle={t('dates.body', { count: undated, total: workouts.length })}
      footer={
        <View className="gap-1">
          <Button {...CTA_STYLE} label={t('dates.keep')} onPress={() => go(true)} />
          <TextButton {...LINK_STYLE} label={t('dates.drop')} onPress={() => go(false)} />
        </View>
      }
    >
      <View className="flex-1 px-4 pt-6 pb-5">
        <UndatedChart
          bars={monthBars(workouts)}
          dated={workouts.length - undated}
          spread={undated}
        />
      </View>
    </StepScreen>
  );
}
