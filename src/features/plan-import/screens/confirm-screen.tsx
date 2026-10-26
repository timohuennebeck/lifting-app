import { Redirect, router, useIsFocused, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown, useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { EditableExerciseList } from '@/features/training/components/editable-exercise-list';
import { EditableTitle } from '@/features/training/components/editable-title';
import { newId } from '@/shared/data/json';
import { AI_BLOCK_WEEKS } from '@/shared/data/plans';
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
import { RoutineBar } from '../components/routine-bar';
import { editExerciseAt, editRoutineAt, settle } from '../lib/edit-plan';
import { showPlanFailure } from '../lib/plan-failure';
import {
  type ImportedExercise,
  type ImportedRoutine,
  needsReview,
  pendingReviews,
  toPlanDraft,
} from '../lib/plan-import-service';
import { useImportStore } from '../stores/import-store';

/** What an unsure exercise says it was taken from: read, or heard by voice input. */
const reviewLabel = (e: ImportedExercise) =>
  e.heard ? ('voice:heardAs' as const) : ('planImport:confirm.readAs' as const);

/**
 * 06c: the detected plan in the training overview layout (03·0b). Its routines sit in the plan
 * strip, in the order they are trained; amber dots mark what the import wasn't sure about until
 * the user checks it. It opens with the first exercise read and fills in while the function sends
 * the rest, following the routine being read until the user picks one. "Selbst erstellen" opens
 * it with an empty plan to build routine by routine. A plan the AI makes (BuildingScreen) opens
 * here the same way and goes on to its name. A saved plan opens here to be edited
 * (`openPlanEditor`) and is saved back. Hold a routine in the strip to move it.
 */
export function ConfirmScreen() {
  const { t } = useTranslation(['planImport', 'planCreate', 'training', 'voice', 'common']);
  const { step, finish, saveEdits } = usePlanFlow();
  const updateDraft = useUpdateDraft();
  const insets = useSafeAreaInsets();
  const plan = useImportStore((s) => s.plan);
  const routineIndex = useImportStore((s) => s.routineIndex);
  const editPlan = useImportStore((s) => s.editPlan);
  const selectRoutine = useImportStore((s) => s.selectRoutine);
  const reading = useImportStore((s) => s.reading);
  const readingRoutine = useImportStore((s) => s.readingRoutine);
  const failure = useImportStore((s) => s.failure);
  const holdRoutine = useImportStore((s) => s.holdRoutine);
  const following = useImportStore((s) => s.following);
  // A saved plan being edited: saving writes it back.
  const editing = useImportStore((s) => s.editing);
  // Made from the answers, not read: it goes on to its name, and is made again on a retry.
  const answers = useImportStore((s) => (s.source?.kind === 'answers' ? s.source.answers : null));
  const made = !!answers;
  const scroller = useAnimatedRef<Animated.ScrollView>();
  // The run this screen shows; leaving the screen stops it.
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
    const again = made ? step('/create/building') : step('/import/reading');
    showPlanFailure(
      failure.reason,
      made,
      () => router.replace(again),
      () => router.back(),
    );
  }, [failure, run, focused, made, step]);

  if (!plan) return <Redirect href={step('/import')} />;

  const index = Math.min(routineIndex, plan.routines.length - 1);
  const routine = plan.routines[index];
  const exercises = routine?.exercises ?? [];
  const pending = pendingReviews(plan);
  // A plan built here starts empty; it needs an exercise before it can be taken over.
  const hasExercises = plan.routines.some((r) => r.exercises.length > 0);
  const newIds = new Set(plan.newExercises.map((e) => e.id));

  function editRoutine(edit: (routine: ImportedRoutine) => ImportedRoutine) {
    editPlan((p) => editRoutineAt(p, index, edit));
  }

  function editExercise(at: number, edit: (e: ImportedExercise) => ImportedExercise) {
    editRoutine((r) => editExerciseAt(r, at, edit));
  }

  // Adding and swapping happen on the library page; picks apply when it closes with "Done".
  const openPicker = (params: { mode: 'add' } | { mode: 'swap'; index: string }) =>
    router.push({ pathname: step('/import/picker'), params });
  const openSets = (i: number) =>
    router.push({ pathname: step('/import/sets'), params: { index: String(i) } });

  function addRoutine() {
    if (!plan) return;
    const number = plan.routines.length + 1;
    editPlan((p) => ({
      ...p,
      routines: [
        ...p.routines,
        { key: newId(), name: t('planImport:confirm.newRoutine', { number }), exercises: [] },
      ],
    }));
    selectRoutine(plan.routines.length);
  }

  // The routine shown stays shown at its new place.
  function moveRoutine(from: number, to: number) {
    if (!plan || !routine) return;
    const routines = plan.routines.filter((_, k) => k !== from);
    routines.splice(to, 0, plan.routines[from]);
    editPlan((p) => ({ ...p, routines }));
    selectRoutine(routines.indexOf(routine));
  }

  function moveExercise(from: number, to: number) {
    editRoutine((r) => {
      const next = r.exercises.filter((_, k) => k !== from);
      next.splice(to, 0, r.exercises[from]);
      return { ...r, exercises: next };
    });
  }

  function submit() {
    if (!plan) return;
    if (pending) {
      haptics.warning();
      const next = plan.routines.findIndex(needsReview);
      if (next >= 0) selectRoutine(next);
      return;
    }
    if (editing) {
      void saveEdits(editing, plan);
      return;
    }
    if (answers) {
      // The AI's plan trains as often as asked and runs in blocks with a deload.
      updateDraft({
        plan: toPlanDraft(plan, {
          sessionsPerWeek: answers.sessionsPerWeek,
          blockWeeks: AI_BLOCK_WEEKS,
        }),
      });
      router.push(step('/create/plan-name'));
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
        // Any touch ends following the routine being read, so an edit stays where it began.
        onTouchStart={holdRoutine}
        // Until then each exercise read scrolls into view, with the row still to come below it.
        onContentSizeChange={() => {
          if (reading && following) scroller.current?.scrollToEnd({ animated: true });
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}
      >
        <RoutineBar
          items={plan.routines.map((r) => ({ key: r.key, name: r.name, review: needsReview(r) }))}
          currentIndex={index}
          onSelect={selectRoutine}
          // Routines the user adds go after the read ones; all can be moved once the plan is read.
          onAdd={reading ? undefined : addRoutine}
          onMove={reading ? undefined : moveRoutine}
        />
        {routine ? (
          <>
            <EditableTitle
              value={routine.name}
              onSubmit={(name) => editRoutine((r) => ({ ...r, name }))}
            />
            <EditableExerciseList
              title={routine.name}
              exercises={exercises}
              keyOf={(e) => e.key}
              addLabel={t('planImport:confirm.add')}
              emptyHint={t('planImport:confirm.empty')}
              scrollRef={scroller}
              onAdd={() => openPicker({ mode: 'add' })}
              // Not while the plan is still read into the routines.
              onVoice={reading ? undefined : () => router.push(step('/import/voice'))}
              onOpen={openSets}
              onEditSets={openSets}
              onSwap={(i) => openPicker({ mode: 'swap', index: String(i) })}
              onRemove={(i) =>
                editRoutine((r) => ({ ...r, exercises: r.exercises.filter((_, k) => k !== i) }))
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
                      message={t(reviewLabel(e), { raw: e.raw })}
                      alternatives={e.alternatives}
                      onConfirm={() => editExercise(i, settle)}
                      onPickAlternative={(exerciseId) =>
                        editExercise(i, (x) => settle({ ...x, exerciseId }))
                      }
                    />
                  ) : null}
                </>
              )}
              footer={reading && index === readingRoutine ? <ReadingGhost /> : null}
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
              ? made
                ? t('planCreate:generate.making')
                : t('planImport:confirm.reading')
              : pending
                ? t('planImport:confirm.check', { count: pending })
                : editing
                  ? t('common:actions.save')
                  : made
                    ? t('common:actions.continue')
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
