import { Redirect, router, useIsFocused, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EditableTitle } from '@/features/training/components/editable-title';
import { PlanBar } from '@/features/training/components/plan-bar';
import { PlanExerciseList } from '@/features/training/components/plan-exercise-list';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { haptics } from '@/shared/lib/haptics';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';
import { TextInputSheet } from '@/shared/ui/text-input-sheet';
import { PLAN_NAME_MAX } from '@/shared/lib/limits';

import { ReadingGhost } from '../components/reading-ghost';
import { ReviewPrompt } from '../components/review-prompt';
import { editDayAt, editExerciseAt, settle } from '../lib/edit-plan';
import {
  type ImportedDay,
  type ImportedExercise,
  needsReview,
  pendingReviews,
  toPlanDraft,
} from '../lib/plan-import-service';
import { useImportStore } from '../stores/import-store';

/**
 * 06c: the detected plan in the training overview layout (03·0b). Days sit in the plan strip;
 * amber dots mark what the import wasn't sure about until the user checks it. It opens with the
 * first exercise read and fills in while the analysis sends the rest, following the day being
 * read until the user picks one. "Selbst erstellen" opens it with an empty plan to build day by
 * day.
 */
export function ConfirmScreen() {
  const { t } = useTranslation(['planImport', 'training', 'common']);
  const { step, finish } = usePlanFlow();
  const insets = useSafeAreaInsets();
  const plan = useImportStore((s) => s.plan);
  const dayIndex = useImportStore((s) => s.dayIndex);
  const editPlan = useImportStore((s) => s.editPlan);
  const selectDay = useImportStore((s) => s.selectDay);
  const reading = useImportStore((s) => s.reading);
  const readingDay = useImportStore((s) => s.readingDay);
  const failure = useImportStore((s) => s.failure);
  const holdDay = useImportStore((s) => s.holdDay);
  const following = useImportStore((s) => s.following);
  const scroller = useAnimatedRef<Animated.ScrollView>();
  // The analysis this screen shows; leaving the screen stops it.
  const [run] = useState(() => useImportStore.getState().run);
  const wasReading = useRef(reading);
  const alerted = useRef(false);
  const navigation = useNavigation();
  const focused = useIsFocused();
  const [renameOpen, setRenameOpen] = useState(false);
  // On leaving, not on unmount: Fast Refresh remounts without the user going anywhere.
  useEffect(
    () => navigation.addListener('beforeRemove', () => useImportStore.getState().stop(run)),
    [navigation, run],
  );

  useEffect(() => {
    if (wasReading.current && !reading && !failure) haptics.success();
    wasReading.current = reading;
  }, [reading, failure]);

  // Broken off halfway: a partial plan isn't taken over; read it again or go back. Asked once
  // this screen is on top again, if the user had opened an exercise or the picker meanwhile.
  useEffect(() => {
    if (failure?.run !== run || !focused || alerted.current) return;
    alerted.current = true;
    Alert.alert(t(`planImport:analysis.errors.${failure.reason}`), undefined, [
      { text: t('common:actions.cancel'), style: 'cancel', onPress: () => router.back() },
      { text: t('common:actions.retry'), onPress: () => router.replace(step('/import/analysis')) },
    ]);
  }, [failure, run, focused, t, step]);

  if (!plan) return <Redirect href={step('/import')} />;

  const index = Math.min(dayIndex, plan.days.length - 1);
  const day = plan.days[index];
  const exercises = day?.exercises ?? [];
  const pending = pendingReviews(plan);
  const weekdays = t('common:weekdays.long', { returnObjects: true });
  // A plan built here starts empty; it needs an exercise before it can be taken over.
  const hasExercises = plan.days.some((d) => d.exercises.length > 0);
  const newIds = new Set(plan.newExercises.map((e) => e.id));

  function editDay(edit: (day: ImportedDay) => ImportedDay) {
    editPlan((p) => editDayAt(p, index, edit));
  }

  function editExercise(at: number, edit: (e: ImportedExercise) => ImportedExercise) {
    editDay((d) => editExerciseAt(d, at, edit));
  }

  // Adding and swapping happen on the library page; picks apply when it closes with "Done".
  const openPicker = (params: { mode: 'add' } | { mode: 'swap'; index: string }) =>
    router.push({ pathname: step('/import/picker'), params });

  function addDay() {
    if (!plan) return;
    const number = plan.days.length + 1;
    editPlan((p) => ({
      ...p,
      days: [
        ...p.days,
        { name: t('planImport:confirm.newDay', { number }), weekday: null, exercises: [] },
      ],
    }));
    selectDay(plan.days.length);
  }

  function moveExercise(from: number, to: number) {
    editDay((d) => {
      const next = d.exercises.filter((_, k) => k !== from);
      next.splice(to, 0, d.exercises[from]);
      return { ...d, exercises: next };
    });
  }

  function submit() {
    if (!plan) return;
    if (pending) {
      haptics.warning();
      const next = plan.days.findIndex(needsReview);
      if (next >= 0) selectDay(next);
      return;
    }
    void finish(toPlanDraft(plan));
  }

  return (
    <Screen
      header={
        <ScreenHeader
          icon="chevron-left-thin"
          title={plan.name}
          action={
            <IconButton
              icon="more"
              iconSize={18}
              accessibilityLabel={t('planImport:confirm.renamePlan')}
              onPress={() => setRenameOpen(true)}
            />
          }
        />
      }
    >
      <Animated.ScrollView
        ref={scroller}
        // Any touch ends following the day being read, so an edit stays on the day it began on.
        onTouchStart={holdDay}
        // Until then each exercise read scrolls into view, with the row still to come below it.
        onContentSizeChange={() => {
          if (reading && following) scroller.current?.scrollToEnd({ animated: true });
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}
      >
        <PlanBar
          items={plan.days.map((d) => ({ name: d.name, review: needsReview(d) }))}
          currentIndex={index}
          onSelect={selectDay}
          // Days the user adds go after the read ones.
          onAdd={reading ? undefined : addDay}
        />
        {day ? (
          <>
            <EditableTitle value={day.name} onSubmit={(name) => editDay((d) => ({ ...d, name }))} />
            <Text variant="paragraph" tone="subtle" className="px-5 pt-2">
              {day.weekday !== null && weekdays[day.weekday]
                ? t('training:overview.fixedDay', { day: weekdays[day.weekday] })
                : t('training:overview.noFixedDay')}
            </Text>
            {day.rawDay ? (
              <View className="px-5 pt-3">
                <ReviewPrompt
                  message={t('planImport:confirm.dayUnknown', { raw: day.rawDay })}
                  onConfirm={() => editDay(({ rawDay: _raw, ...d }) => d)}
                />
              </View>
            ) : null}

            <PlanExerciseList
              title={day.name}
              exercises={exercises}
              keyOf={(e) => e.key}
              addLabel={t('planImport:confirm.add')}
              emptyHint={t('planImport:confirm.empty')}
              scrollRef={scroller}
              onAdd={() => openPicker({ mode: 'add' })}
              onOpen={(i) =>
                router.push({ pathname: '/exercise/[id]', params: { id: exercises[i].exerciseId } })
              }
              onSwap={(i) => openPicker({ mode: 'swap', index: String(i) })}
              onRemove={(i) =>
                editDay((d) => ({ ...d, exercises: d.exercises.filter((_, k) => k !== i) }))
              }
              onMove={moveExercise}
              review={(e) => !!e.raw}
              renderExtra={(e, i) => (
                <>
                  {newIds.has(e.exerciseId) ? (
                    <Text variant="caption" tone="accent" className="pt-1.5 font-inter">
                      {t('planImport:confirm.newExercise')}
                    </Text>
                  ) : null}
                  {e.raw ? (
                    <ReviewPrompt
                      message={t('planImport:confirm.readAs', { raw: e.raw })}
                      alternatives={e.alternatives}
                      onConfirm={() => editExercise(i, settle)}
                      onPickAlternative={(exerciseId) =>
                        editExercise(i, (x) => settle({ ...x, exerciseId }))
                      }
                    />
                  ) : null}
                </>
              )}
              footer={reading && index === readingDay ? <ReadingGhost /> : null}
              // While the plan is read, its cards slide in and stay put.
              sortEnabled={!reading}
              itemEntering={reading ? FadeInDown.duration(300) : undefined}
            />
          </>
        ) : null}
      </Animated.ScrollView>

      <BottomFade>
        <Button
          label={
            reading
              ? t('planImport:confirm.reading')
              : pending
                ? t('planImport:confirm.check', { count: pending })
                : t('planImport:confirm.cta')
          }
          variant={pending || reading ? 'secondary' : 'primary'}
          // Nor after it broke off: a partial plan isn't taken over.
          disabled={!hasExercises || reading || failure?.run === run}
          onPress={submit}
        />
      </BottomFade>
      <TextInputSheet
        visible={renameOpen}
        onClose={() => setRenameOpen(false)}
        title={t('planImport:confirm.renamePlan')}
        initialValue={plan.name}
        maxLength={PLAN_NAME_MAX}
        placeholder={t('planImport:confirm.planName')}
        ctaLabel={t('common:actions.save')}
        onSubmit={(name) => {
          editPlan((p) => ({ ...p, name }));
          setRenameOpen(false);
        }}
      />
    </Screen>
  );
}
