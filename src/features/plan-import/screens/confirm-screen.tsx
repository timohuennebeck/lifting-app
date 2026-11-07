import {
  Redirect,
  router,
  Stack,
  useIsFocused,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown, useAnimatedRef } from 'react-native-reanimated';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { EditableExerciseList } from '@/features/training/components/editable-exercise-list';
import { EditableTitle } from '@/features/training/components/editable-title';
import { newId } from '@/shared/data/json';
import { useFlowSwipeOff } from '@/shared/hooks/use-flow-swipe-off';
import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { AI_BLOCK_WEEKS } from '@/shared/data/plans';
import { moved } from '@/shared/lib/array';
import { haptics } from '@/shared/lib/haptics';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';
import { DeleteSheet } from '@/shared/ui/delete-sheet';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';
import { TextInputSheet } from '@/shared/ui/text-input-sheet';
import { PLAN_NAME_MAX } from '@/shared/lib/limits';

import { ReadingGhost } from '../components/reading-ghost';
import { ReviewPrompt } from '../components/review-prompt';
import { RoutineBar } from '../components/routine-bar';
import { editExerciseAt, editRoutineAt, IMPORT_PLAN_SOURCES, settle } from '../lib/edit-plan';
import { showPlanFailure } from '../lib/plan-failure';
import {
  type ImportedExercise,
  type ImportedRoutine,
  needsReview,
  pendingReviews,
  toPlanDraft,
} from '../lib/plan-import-service';
import { useImportStore } from '../stores/import-store';

/** After the shown day is built, the next of the others is built after this long. */
const BUILD_GAP_MS = 250;
const HIDDEN = { display: 'none' } as const;

/**
 * 06c: the plan in the training overview layout (03·0b). Its routines sit in the plan strip, in
 * the order they are trained; amber dots mark exercises not sure yet (voice input) until the user
 * checks them. A workout import opens it with the plan it read or found in the history. A plan
 * the AI makes (BuildingScreen) opens with its first exercise and fills in while the function
 * sends the rest, following the routine being made until the user picks one, and goes on to its
 * name. After a workout import (`afterImport`) an X replaces the back button and asks before the
 * import is left, with no swiping back. "Plan selbst erstellen" opens it with an empty plan to
 * build routine by routine. A saved plan opens here to be edited (`openPlanEditor`) and is saved
 * back. Hold a routine in the strip to move it. Each day's list is built once and then kept,
 * hidden while another day shows; the others are built one by one once the screen is up.
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
  // Going back would read the file again: the X, Android's back and no swipe ask first.
  const { from } = useLocalSearchParams<{ from?: string }>();
  const importedFrom = IMPORT_PLAN_SOURCES.find((source) => source === from) ?? null;
  const afterImport = importedFrom !== null;
  const [leaving, setLeaving] = useState(false);
  useFlowSwipeOff(afterImport);
  useHardwareBack(() => setLeaving(true), afterImport);
  // The days whose lists are built (by routine key); the shown one is added while rendering.
  const [built, setBuilt] = useState<readonly string[]>([]);
  const unbuilt = plan?.routines.find((r) => !built.includes(r.key))?.key;
  const buildsMore = focused && !reading && built.length > 0;
  useEffect(() => {
    if (!unbuilt || !buildsMore) return;
    const timer = setTimeout(
      () => setBuilt((keys) => (keys.includes(unbuilt) ? keys : [...keys, unbuilt])),
      BUILD_GAP_MS,
    );
    return () => clearTimeout(timer);
  }, [unbuilt, buildsMore]);
  // On leaving, not on unmount: Fast Refresh remounts without the user going anywhere.
  useEffect(
    () => navigation.addListener('beforeRemove', () => useImportStore.getState().stop(run)),
    [navigation, run],
  );

  useEffect(() => {
    if (wasReading.current && !reading && !failure) haptics.success();
    wasReading.current = reading;
  }, [reading, failure]);

  // The AI's plan broke off halfway: a partial plan isn't taken over; make it again or go back.
  // Asked once this screen is on top again, if the user had opened an exercise meanwhile. (An
  // imported plan is read completely before the editor opens.)
  useEffect(() => {
    if (failure?.run !== run || !focused || alerted.current) return;
    alerted.current = true;
    showPlanFailure(
      failure.reason,
      () => router.replace(step('/create/building')),
      () => router.back(),
    );
  }, [failure, run, focused, step]);

  if (!plan) return <Redirect href={step('/import')} />;

  const index = Math.min(routineIndex, plan.routines.length - 1);
  const routine = plan.routines[index];
  const pending = pendingReviews(plan);
  // A plan built here starts empty; it needs an exercise before it can be taken over.
  const hasExercises = plan.routines.some((r) => r.exercises.length > 0);
  const newIds = new Set(plan.newExercises.map((e) => e.id));
  if (routine && !built.includes(routine.key)) setBuilt([...built, routine.key]);

  function editDay(at: number, edit: (routine: ImportedRoutine) => ImportedRoutine) {
    editPlan((p) => editRoutineAt(p, at, edit));
  }

  function editRoutine(edit: (routine: ImportedRoutine) => ImportedRoutine) {
    editDay(index, edit);
  }

  function editExercise(day: number, at: number, edit: (e: ImportedExercise) => ImportedExercise) {
    editDay(day, (r) => editExerciseAt(r, at, edit));
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
    const routines = moved(plan.routines, from, to);
    editPlan((p) => ({ ...p, routines }));
    selectRoutine(routines.indexOf(routine));
  }

  function moveExercise(day: number, from: number, to: number) {
    editDay(day, (r) => ({ ...r, exercises: moved(r.exercises, from, to) }));
  }

  /** Leaves the import for its start, where the file is picked again. */
  function leaveImport() {
    setLeaving(false);
    router.dismissTo(step('/import'));
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
    void finish(toPlanDraft(plan), importedFrom ?? 'own');
  }

  return (
    <Screen
      header={
        <ScreenHeader
          icon={afterImport ? 'close' : 'chevron-left'}
          onBack={afterImport ? () => setLeaving(true) : undefined}
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
      <Stack.Screen options={{ gestureEnabled: !afterImport }} />
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
          <EditableTitle
            value={routine.name}
            onSubmit={(name) => editRoutine((r) => ({ ...r, name }))}
          />
        ) : null}
        {plan.routines.map((day, i) =>
          built.includes(day.key) ? (
            // Each day keeps its own list, hidden while another one shows.
            <View key={day.key} style={i === index ? undefined : HIDDEN}>
              <EditableExerciseList
                title={day.name}
                exercises={day.exercises}
                keyOf={(e) => e.key}
                addLabel={t('planImport:confirm.add')}
                emptyHint={t('planImport:confirm.empty')}
                scrollRef={scroller}
                onAdd={() => openPicker({ mode: 'add' })}
                // Not while the plan is still read into the routines.
                onVoice={reading ? undefined : () => router.push(step('/import/voice'))}
                onOpen={openSets}
                onSwap={(at) => openPicker({ mode: 'swap', index: String(at) })}
                onRemove={(at) =>
                  editDay(i, (r) => ({
                    ...r,
                    exercises: r.exercises.filter((_, k) => k !== at),
                  }))
                }
                onMove={(from, to) => moveExercise(i, from, to)}
                review={(e) => !!e.raw}
                renderExtra={(e, at) => (
                  <>
                    {newIds.has(e.exerciseId) ? (
                      <Text variant="caption" tone="accent" className="pt-1.5 font-inter">
                        {t('planImport:confirm.newExercise')}
                      </Text>
                    ) : null}
                    {e.raw ? (
                      <ReviewPrompt
                        message={t('voice:heardAs', { raw: e.raw })}
                        alternatives={e.alternatives}
                        onConfirm={() => editExercise(i, at, settle)}
                        onPickAlternative={(exerciseId) =>
                          editExercise(i, at, (x) => settle({ ...x, exerciseId }))
                        }
                      />
                    ) : null}
                  </>
                )}
                footer={reading && i === readingRoutine ? <ReadingGhost /> : null}
                // While the plan is read, its cards slide in and stay put.
                sortEnabled={!reading}
                itemEntering={reading ? FadeInDown.duration(300) : undefined}
              />
            </View>
          ) : null,
        )}
      </Animated.ScrollView>

      <BottomFade>
        <Button
          label={
            // Only the AI's plan still comes in here; an import's is read before the editor opens.
            reading
              ? t('planCreate:generate.making')
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
      <DeleteSheet
        visible={leaving}
        onClose={() => setLeaving(false)}
        title={t('planImport:confirm.leave.title')}
        option={t('planImport:confirm.leave.option')}
        description={t('planImport:confirm.leave.description')}
        cta={t('planImport:confirm.leave.cta')}
        onDelete={leaveImport}
      />
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
