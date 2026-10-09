import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseDetailModal } from '@/features/exercises/components/exercise-detail-modal';
import { ExercisePickerSheet } from '@/features/exercises/components/exercise-picker-sheet';
import { useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { defaultSetDrafts, swapTargets } from '@/shared/data/exercises';
import { muscleShares } from '@/shared/data/muscles';
import { haptics } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/button';
import { MuscleTileRow } from '@/shared/ui/muscle-map';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import { DayEditor } from '../components/day-editor';
import { DayTabs } from '../components/day-tabs';
import { ImportedExerciseRow } from '../components/imported-exercise-row';
import { IMPORT_STEPS } from '../lib/format';
import {
  type ImportedDay,
  type ImportedExercise,
  needsReview,
  pendingReviews,
  toPlanDraft,
} from '../lib/plan-import-service';
import { useImportStore } from '../stores/import-store';

type Picker = { mode: 'add' } | { mode: 'swap'; index: number };

/** 06c: review the detected plan per day (name, weekday, exercises) and confirm it. */
export function ConfirmScreen() {
  const { t } = useTranslation(['planImport', 'common']);
  const plan = useImportStore((s) => s.plan);
  const dayIndex = useImportStore((s) => s.dayIndex);
  const editPlan = useImportStore((s) => s.editPlan);
  const selectDay = useImportStore((s) => s.selectDay);
  const updateDraft = useUpdateDraft();
  const [picker, setPicker] = useState<Picker | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  if (!plan) return <Redirect href="/import" />;

  const index = Math.min(dayIndex, plan.days.length - 1);
  const day = plan.days[index];
  const pending = pendingReviews(plan);
  const shares = day
    ? muscleShares(day.exercises.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets.length })))
    : [];

  function editDay(edit: (day: ImportedDay) => ImportedDay) {
    editPlan((p) => ({ ...p, days: p.days.map((d, i) => (i === index ? edit(d) : d)) }));
  }

  function editExercise(at: number, edit: (e: ImportedExercise) => ImportedExercise) {
    editDay((d) => ({ ...d, exercises: d.exercises.map((e, i) => (i === at ? edit(e) : e)) }));
  }

  const settle = ({ raw: _raw, alternatives: _alts, ...e }: ImportedExercise): ImportedExercise =>
    e;

  function pick(exerciseId: string) {
    if (picker?.mode === 'swap') {
      editExercise(picker.index, (e) =>
        settle({
          ...e,
          exerciseId,
          sets: swapTargets(e.exerciseId, exerciseId)
            ? defaultSetDrafts(exerciseId, e.sets.length)
            : e.sets,
        }),
      );
    } else {
      editDay((d) => ({
        ...d,
        exercises: [
          ...d.exercises,
          { exerciseId, sets: defaultSetDrafts(exerciseId, 3), restSeconds: null },
        ],
      }));
    }
    setPicker(null);
  }

  function submit() {
    if (!plan) return;
    if (pending) {
      haptics.warning();
      const next = plan.days.findIndex(needsReview);
      if (next >= 0) selectDay(next);
      return;
    }
    updateDraft({ plan: toPlanDraft(plan) });
    router.push('/promise');
  }

  return (
    <StepScreen
      step={IMPORT_STEPS}
      total={IMPORT_STEPS}
      title={t('planImport:confirm.title')}
      scroll
      footer={
        <Button
          label={
            pending
              ? t('planImport:confirm.check', { count: pending })
              : t('planImport:confirm.cta')
          }
          variant={pending ? 'secondary' : 'primary'}
          disabled={!plan.name.trim()}
          onPress={submit}
        />
      }
    >
      <View className="px-4 pt-6">
        <TextField
          label={t('planImport:confirm.planName')}
          value={plan.name}
          onChangeText={(name) => editPlan((p) => ({ ...p, name }))}
          maxLength={30}
          clearable
          returnKeyType="done"
        />
      </View>
      <View className="pt-6">
        <DayTabs days={plan.days} selected={index} onSelect={selectDay} />
      </View>
      {day ? (
        <>
          <DayEditor day={day} fallbackName={`${index + 1}`} onEdit={editDay} />
          {shares.length ? (
            <View className="gap-2.5 pt-6">
              <Text variant="overline" tone="subtle" className="px-4 tracking-[1.5px]">
                {t('planImport:confirm.muscles')}
              </Text>
              <MuscleTileRow shares={shares} />
            </View>
          ) : null}
          <View className="gap-2 px-4 pt-6">
            {day.exercises.length ? (
              day.exercises.map((e, i) => (
                <ImportedExerciseRow
                  key={`${e.exerciseId}-${i}`}
                  exercise={e}
                  onOpen={() => setDetailId(e.exerciseId)}
                  onSwap={() => setPicker({ mode: 'swap', index: i })}
                  onRemove={() =>
                    editDay((d) => ({ ...d, exercises: d.exercises.filter((_, k) => k !== i) }))
                  }
                  onConfirm={() => editExercise(i, settle)}
                  onPickAlternative={(exerciseId) =>
                    editExercise(i, (x) => settle({ ...x, exerciseId }))
                  }
                />
              ))
            ) : (
              <Text variant="paragraph" tone="subtle" className="py-4 text-center">
                {t('planImport:confirm.empty')}
              </Text>
            )}
            <View className="flex-row gap-2 pt-1">
              <Button
                label={t('planImport:confirm.add')}
                variant="secondary"
                size="md"
                icon="plus"
                className="flex-1"
                onPress={() => setPicker({ mode: 'add' })}
              />
              <Button
                label={t('planImport:confirm.voice')}
                variant="outline"
                size="md"
                icon="mic"
                onPress={() => router.push('/import/voice')}
              />
            </View>
          </View>
        </>
      ) : null}
      <ExercisePickerSheet
        visible={!!picker}
        onClose={() => setPicker(null)}
        onSelect={pick}
        mode={picker?.mode ?? 'add'}
        title={picker?.mode === 'swap' ? t('planImport:confirm.swap') : t('planImport:confirm.add')}
        excludeIds={day?.exercises.map((e) => e.exerciseId) ?? []}
        muscleItems={day?.exercises.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets.length }))}
      />
      <ExerciseDetailModal exerciseId={detailId} onClose={() => setDetailId(null)} />
    </StepScreen>
  );
}
