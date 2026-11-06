import { Redirect, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { useDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { formatSet, useExerciseName } from '@/shared/data/exercises';
import { useUnits } from '@/shared/data/profile';
import { formatDate, type UnitSystem } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { useImportStep } from '../hooks/use-import-step';
import { useImportSteps } from '../hooks/use-import-steps';
import { type ImportedExercise, importedExercises } from '../lib/imported';
import { CTA_STYLE, LINK_STYLE, TITLE_STYLE } from '../lib/steps';
import { choosesPlan, useWorkoutImportStore } from '../stores/workout-import-store';

const month = (iso: string) => formatDate(new Date(iso), { month: 'short', year: 'numeric' });

/** An imported exercise, sized like the search's rows: how often, its best set; opens "Historie". */
function ExerciseRow({ item, units }: { item: ImportedExercise; units: UnitSystem }) {
  const { t, i18n } = useTranslation('workoutImport');
  const name = useExerciseName(item.exerciseId, i18n.language);
  return (
    <PressableScale
      haptic="select"
      activeScale={0.985}
      onPress={() =>
        router.push({ pathname: '/exercise/[id]/history', params: { id: item.exerciseId } })
      }
      accessibilityRole="button"
      className="h-19.5 flex-row items-center gap-3.5"
    >
      <ExerciseThumb exerciseId={item.exerciseId} name={name} />
      <View className="min-w-0 flex-1 gap-0.75">
        <View className="flex-row items-center gap-2">
          <Text
            numberOfLines={1}
            className="shrink font-inter-semibold text-[15px] leading-[19px] text-fg"
          >
            {name}
          </Text>
          {item.created ? (
            <View className="h-5 justify-center rounded-full bg-control px-1.75">
              <Text className="font-inter-semibold text-[11px] text-fg-mid">
                {t('imported.new')}
              </Text>
            </View>
          ) : null}
        </View>
        <View className="flex-row items-center gap-1.5">
          <Text className="font-inter text-[13px] leading-4 text-subtle">
            {`${t('imported.workouts', { count: item.workouts })} ·`}
          </Text>
          <Icon name="star" size={11} color={colors.dim} />
          <Text className="font-inter text-[13px] leading-4 text-subtle">
            {formatSet(item.exerciseId, item.best, units)}
          </Text>
        </View>
      </View>
    </PressableScale>
  );
}

/**
 * After the import: every exercise it took over, the most trained first; each opens its exercise
 * page on "Historie" (from the import until the account has them). Then on to the plan (or
 * without it), or out.
 */
export function ImportedScreen() {
  const { t } = useTranslation('workoutImport');
  const { inApp, step, done } = usePlanFlow();
  const profileUnits = useUnits();
  const draftUnits = useDraft().unitPreference;
  const imported = useWorkoutImportStore((s) => s.imported);
  // How the plan is made is asked next.
  const withChoice = useWorkoutImportStore(choosesPlan);
  const counter = useImportStep('imported');
  const { next, withPlan } = useImportSteps();
  if (!imported) return <Redirect href={step('/import')} />;

  const units = inApp ? profileUnits : draftUnits;
  const exercises = importedExercises(imported.workouts, imported.created);
  // The rows are saved oldest first (toRows).
  const first = imported.workouts[0];
  const last = imported.workouts.at(-1);
  const plan = withPlan();
  // Onward to how the plan is made, or on in onboarding; the app's import ends here.
  const goesOn = withChoice || !inApp;
  const cta = plan ? t('imported.toPlan') : goesOn ? t('imported.next') : t('imported.done');

  return (
    <StepScreen
      {...TITLE_STYLE}
      step={counter.step}
      total={counter.total}
      title={t('imported.title')}
      subtitle={t('imported.subtitle', { count: imported.workouts.length })}
      scroll
      footer={
        <View className="gap-1">
          <Button {...CTA_STYLE} label={cta} onPress={() => next()} />
          {/* The file's plan can still be left out: the history stays. */}
          {plan ? (
            <TextButton {...LINK_STYLE} label={t('imported.withoutPlan')} onPress={done} />
          ) : null}
        </View>
      }
    >
      <View className="flex-row items-baseline justify-between px-5 pt-5.5 pb-1">
        <Text className="font-inter-semibold text-xs tracking-[1.44px] text-subtle">
          {t('imported.exercises', { n: exercises.length })}
        </Text>
        {first && last ? (
          <Text className="font-inter-medium text-xs text-dim">
            {t('imported.range', { from: month(first.started_at), to: month(last.started_at) })}
          </Text>
        ) : null}
      </View>
      <View className="px-5">
        {exercises.map((item) => (
          <ExerciseRow key={item.exerciseId} item={item} units={units} />
        ))}
      </View>
    </StepScreen>
  );
}
