import { Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { useImportStore } from '@/features/plan-import/stores/import-store';
import { formatDate } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { StepScreen } from '@/shared/ui/step-screen';

import { FileCards, PlanCards } from '../components/file-art';
import { FoundCard } from '../components/found-card';
import { useImportSteps } from '../hooks/use-import-steps';
import { importSteps } from '../lib/steps';
import { useWorkoutImportStore } from '../stores/workout-import-store';

const month = (date: Date) => formatDate(date, { month: 'short', year: 'numeric' });

/** 13p: the history and the plan the file holds (or the history makes), to import or not. */
export function FoundScreen() {
  const { t } = useTranslation('workoutImport');
  const { step } = usePlanFlow();
  const status = useWorkoutImportStore((s) => s.status);
  const read = useWorkoutImportStore((s) => s.read);
  const workouts = useWorkoutImportStore((s) => s.workouts);
  const planFrom = useWorkoutImportStore((s) => s.planFrom);
  const take = useWorkoutImportStore((s) => s.take);
  const setTake = useWorkoutImportStore((s) => s.setTake);
  const routines = useImportStore((s) => s.plan?.routines ?? null);
  const { afterFound, saving } = useImportSteps();
  if (status !== 'ready') return <Redirect href={step('/import')} />;

  // Workouts are in order; those without a date aren't counted for the span.
  const dates = workouts.flatMap((w) => (w.start ? [w.start] : []));
  const history = !workouts.length
    ? t('found.notInFile')
    : dates.length
      ? t('found.workouts', {
          count: workouts.length,
          from: month(dates[0]),
          to: month(dates[dates.length - 1]),
        })
      : t('found.undatedOnly', { count: workouts.length });
  const hasPlan = !!planFrom && !!routines?.length;
  const days = routines?.length ?? 0;
  const plan = !hasPlan
    ? t('found.notInFile')
    : planFrom === 'history'
      ? t('found.fromHistory', { days: t('sheets.days', { count: days }) })
      : t('found.days', { count: days, names: routines?.map((r) => r.name).join(', ') ?? '' });

  const steps = importSteps(read);
  const historyOn = take.history && workouts.length > 0;
  const planOn = take.plan && hasPlan;

  return (
    <StepScreen
      step={steps}
      total={steps}
      title={t('found.title')}
      subtitle={t('found.subtitle')}
      footer={
        <Button
          label={saving ? t('found.saving') : t('found.cta')}
          disabled={!historyOn && !planOn}
          loading={saving}
          onPress={afterFound}
        />
      }
    >
      <View className="min-h-0 flex-1 gap-4 px-4 pt-6 pb-5">
        <FoundCard
          title={t('found.history')}
          caption={history}
          found={workouts.length > 0}
          picked={take.history}
          onPress={() => setTake({ ...take, history: !take.history })}
        >
          <FileCards scale={0.6} />
        </FoundCard>
        <FoundCard
          title={t('found.plan')}
          caption={plan}
          found={hasPlan}
          picked={take.plan}
          onPress={() => setTake({ ...take, plan: !take.plan })}
        >
          <PlanCards />
        </FoundCard>
      </View>
    </StepScreen>
  );
}
