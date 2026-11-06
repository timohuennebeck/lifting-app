import { Redirect, router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { RoutineGlyph } from '@/features/training/components/glyphs';
import { MAX_SESSIONS_PER_WEEK, MIN_SESSIONS_PER_WEEK } from '@/shared/data/plans';
import { DAY_MS } from '@/shared/lib/date';
import { clamp } from '@/shared/lib/math';
import { glyphColor } from '@/shared/ui/choice-sheet';
import { CoachDiamond } from '@/shared/ui/coach-mark';
import { Button } from '@/shared/ui/button';
import { OptionCard } from '@/shared/ui/option-card';
import { StepScreen } from '@/shared/ui/step-screen';
import { TextButton } from '@/shared/ui/text-button';

import type { WorkoutRow } from '../lib/save-history';
import { CTA_STYLE, flowSteps, LINK_STYLE, TITLE_STYLE } from '../lib/steps';
import { undatedCount, useWorkoutImportStore } from '../stores/workout-import-store';

type Way = 'training' | 'questions';

const WEEK_MS = 7 * DAY_MS;
/** The weeks at the end of the history that say how often the user trains now. */
const RECENT_WEEKS = 8;

/** Workouts a week over the history's last weeks, as the plan flow asks for them. */
function weeklyWorkouts(workouts: WorkoutRow[]) {
  const times = workouts.map((w) => Date.parse(w.started_at)).filter(Number.isFinite);
  const last = Math.max(...times);
  const recent = times.filter((time) => time > last - RECENT_WEEKS * WEEK_MS).length;
  return clamp(Math.round(recent / RECENT_WEEKS), MIN_SESSIONS_PER_WEEK, MAX_SESSIONS_PER_WEEK);
}

/**
 * After "Importiert", when the file had no plan: the AI makes one from the training (the routines
 * found in the history open in the editor; without any, a plan is made for the workouts a week the
 * history shows) or from the plan flow's questions, which start with the history's workouts a
 * week. Or the flow goes on without a plan.
 */
export function PlanChoiceScreen() {
  const { t } = useTranslation('workoutImport');
  const { inApp, step, done } = usePlanFlow();
  const [way, setWay] = useState<Way>('training');
  const imported = useWorkoutImportStore((s) => s.imported);
  const read = useWorkoutImportStore((s) => s.read);
  const planFrom = useWorkoutImportStore((s) => s.planFrom);
  const withDates = useWorkoutImportStore((s) => undatedCount(s) > 0);
  if (!imported?.workouts.length) return <Redirect href={step('/import')} />;
  const { total } = flowSteps(read, inApp, withDates, true);

  function go() {
    if (way === 'training' && planFrom === 'history') {
      router.push(step('/import/confirm'));
      return;
    }
    useOnboardingStore
      .getState()
      .update({ sessionsPerWeek: weeklyWorkouts(imported?.workouts ?? []) });
    router.push(step(way === 'training' ? '/create/building' : '/create/goal'));
  }

  const option = (value: Way, icon: (active: boolean) => ReactNode) => (
    <OptionCard
      look="sheet"
      title={t(`choice.${value}.title`)}
      description={t(`choice.${value}.hint`)}
      icon={icon(way === value)}
      selected={way === value}
      onPress={() => setWay(value)}
    />
  );

  return (
    <StepScreen
      {...TITLE_STYLE}
      step={total}
      total={total}
      title={t('choice.title')}
      subtitle={t('choice.subtitle')}
      footer={
        <View className="gap-1">
          <Button
            {...CTA_STYLE}
            label={way === 'training' ? t('choice.create') : t('choice.toQuestions')}
            onPress={go}
          />
          <TextButton {...LINK_STYLE} label={t('imported.withoutPlan')} onPress={done} />
        </View>
      }
    >
      <View className="gap-2.5 px-4 pt-6">
        {option('training', (active) => (
          <CoachDiamond
            size={15}
            color={glyphColor(active)}
            animation={active ? 'breathe' : undefined}
          />
        ))}
        {option('questions', (active) => (
          <RoutineGlyph color={glyphColor(active)} />
        ))}
      </View>
    </StepScreen>
  );
}
