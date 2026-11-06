import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { useExercise, useExerciseName } from '@/shared/data/exercises';
import { primaryGroup } from '@/shared/data/muscle-groups';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Screen } from '@/shared/ui/screen';
import { StepHeader } from '@/shared/ui/step-header';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { useImportSteps } from '../hooks/use-import-steps';
import { type Decision, nameKey, type ReviewItem } from '../lib/review';
import { canMakeCustom, useWorkoutImportStore } from '../stores/workout-import-store';
import { CTA_STYLE, LINK_STYLE } from '../lib/steps';

/** What the radio picks: an exercise's id, or a new exercise of the user's. */
type Choice = string | 'custom' | null;

function Radio({ selected }: { selected: boolean }) {
  return (
    <View
      className={cn(
        'size-5.5 rounded-full',
        selected ? 'border-[6px] border-accent bg-bg' : 'border-2 border-[#3A3A3A]',
      )}
    />
  );
}

interface RowProps {
  selected: boolean;
  onPress: () => void;
  title: string;
  caption: string;
  /** The 40 × 54 tile on the left. */
  tile: React.ReactNode;
  recommended?: boolean;
}

function Row({ selected, onPress, title, caption, tile, recommended }: RowProps) {
  const { t } = useTranslation('workoutImport');
  return (
    <PressableScale
      haptic="select"
      activeScale={0.985}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className="flex-row items-center gap-3 py-2.5"
    >
      {tile}
      <View className="min-w-0 flex-1 gap-0.75">
        <Text className="font-inter-semibold text-[15px] leading-[19px] text-fg">{title}</Text>
        <Text className="font-inter text-[13px] leading-4 text-subtle">{caption}</Text>
      </View>
      {recommended ? (
        <View className="h-6 justify-center rounded-full bg-control px-2">
          <Text className="font-inter-semibold text-xs text-fg-mid">{t('check.recommended')}</Text>
        </View>
      ) : null}
      <Radio selected={selected} />
    </PressableScale>
  );
}

function ExerciseRow({
  exerciseId,
  ...props
}: { exerciseId: string } & Omit<RowProps, 'title' | 'caption' | 'tile'>) {
  const { t, i18n } = useTranslation('exercises');
  const exercise = useExercise(exerciseId);
  const name = useExerciseName(exerciseId, i18n.language);
  return (
    <Row
      {...props}
      title={name}
      caption={t(`groups.${primaryGroup(exercise)}`)}
      tile={<ExerciseThumb exerciseId={exerciseId} name={name} className="h-13.5 w-10" />}
    />
  );
}

/** The choice a decision (or none yet) stands for: the likeliest exercise when undecided. */
function choiceOf(item: ReviewItem, decision: Decision | undefined): Choice {
  if (!decision) return item.options[0] ?? (canMakeCustom(item) ? 'custom' : null);
  if (decision.kind === 'exercise') return decision.exerciseId;
  return decision.kind === 'custom' ? 'custom' : null;
}

/**
 * 15a: a name the model wasn't sure about, one per screen (`index` from 1): the likeliest
 * exercise, its alternatives, or a new exercise under the file's name; or leave it out.
 */
export function CheckScreen() {
  const { t } = useTranslation('workoutImport');
  const { step } = usePlanFlow();
  const { index } = useLocalSearchParams<{ index: string }>();
  const position = Math.max(1, Number(index) || 1);
  const reviews = useWorkoutImportStore((s) => s.reviews);
  const decisions = useWorkoutImportStore((s) => s.decisions);
  const decide = useWorkoutImportStore((s) => s.decide);
  const { afterCheck, saving } = useImportSteps();
  const items = reviews;
  const item = items.at(position - 1);
  const [choice, setChoice] = useState<Choice>(() =>
    item ? choiceOf(item, decisions[nameKey(item.name)]) : null,
  );
  // An exercise found with "Andere Übung suchen" is picked, and listed with the others.
  const decided = item ? decisions[nameKey(item.name)] : undefined;
  const decidedId = decided?.kind === 'exercise' ? decided.exerciseId : null;
  const listed = !item || decidedId === null || item.options.includes(decidedId);
  const searched = listed ? null : decidedId;
  // Back from the search: its exercise becomes the choice (set while rendering, not in an effect).
  const [seenSearch, setSeenSearch] = useState(searched);
  if (searched !== seenSearch) {
    setSeenSearch(searched);
    if (searched) setChoice(searched);
  }
  if (!item) return <Redirect href={step('/import')} />;
  const options = searched ? [...item.options, searched] : item.options;

  function next(decision: Decision) {
    if (!item) return;
    decide(item.name, decision);
    afterCheck(position);
  }
  const confirm = () =>
    next(
      choice === 'custom'
        ? { kind: 'custom' }
        : choice
          ? { kind: 'exercise', exerciseId: choice }
          : { kind: 'skip' },
    );

  return (
    <Screen
      header={<StepHeader step={position} total={items.length} />}
      scroll
      footer={
        <View className="gap-1">
          <Button {...CTA_STYLE} label={t('check.next')} loading={saving} onPress={confirm} />
          <TextButton
            {...LINK_STYLE}
            label={t('check.skip')}
            onPress={() => next({ kind: 'skip' })}
          />
        </View>
      }
    >
      <View className="px-4 pt-4.5">
        <View className="gap-2.5 px-1">
          <Text className="font-inter-semibold text-xs tracking-[1.44px] text-subtle">
            {item.workouts > 0 ? t('check.inFile', { count: item.workouts }) : t('check.inPlan')}
          </Text>
          <Text
            accessibilityRole="header"
            className="font-inter-semibold text-[30px] leading-9 text-fg uppercase"
          >
            {item.name}
          </Text>
        </View>
        <View className="px-1 pt-6">
          {options.map((id, i) => (
            <ExerciseRow
              key={id}
              exerciseId={id}
              selected={choice === id}
              recommended={i === 0 && id !== searched}
              onPress={() => setChoice(id)}
            />
          ))}
          {canMakeCustom(item) ? (
            <Row
              selected={choice === 'custom'}
              onPress={() => setChoice('custom')}
              title={t('check.custom')}
              caption={t('check.customHint', { name: item.name })}
              tile={
                <View className="h-13.5 w-10 items-center justify-center rounded-[5px] bg-raised">
                  <Icon name="plus" size={14} color={colors.fgMid} />
                </View>
              }
            />
          ) : null}
          {/* Any exercise of the catalog, also for a name nothing matched. */}
          <PressableScale
            haptic="select"
            activeScale={0.985}
            onPress={() =>
              router.push({ pathname: step('/import/check-search'), params: { name: item.name } })
            }
            accessibilityRole="button"
            className="flex-row items-center gap-3 py-2.5"
          >
            <View className="h-13.5 w-10 items-center justify-center rounded-[5px] bg-raised">
              <Icon name="search" size={14} color={colors.fgMid} />
            </View>
            <View className="min-w-0 flex-1 gap-0.75">
              <Text className="font-inter-semibold text-[15px] leading-[19px] text-fg">
                {t('check.search')}
              </Text>
              <Text className="font-inter text-[13px] leading-4 text-subtle">
                {t('check.searchHint')}
              </Text>
            </View>
          </PressableScale>
        </View>
      </View>
    </Screen>
  );
}
