import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { EditableTitle } from '@/features/training/components/editable-title';
import { ExerciseListHeader } from '@/features/training/components/exercise-list-header';
import {
  type ExerciseMenuAction,
  ExerciseMenuSheet,
} from '@/features/training/components/exercise-menu-sheet';
import { PlanBar } from '@/features/training/components/plan-bar';
import { TemplateExerciseCard } from '@/features/training/components/template-exercise-card';
import { WorkedMuscles } from '@/features/muscles/components/worked-muscles';
import { estimateMinutes } from '@/shared/data/templates';
import { useLastDefined } from '@/shared/hooks/use-last-defined';
import { haptics } from '@/shared/lib/haptics';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';
import { EmptyExercises } from '@/shared/ui/empty-exercises';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';
import { TextInputSheet } from '@/shared/ui/text-input-sheet';

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
 * amber dots mark what the import wasn't sure about until the user checks it.
 */
export function ConfirmScreen() {
  const { t } = useTranslation(['planImport', 'training', 'common']);
  const insets = useSafeAreaInsets();
  const plan = useImportStore((s) => s.plan);
  const dayIndex = useImportStore((s) => s.dayIndex);
  const editPlan = useImportStore((s) => s.editPlan);
  const selectDay = useImportStore((s) => s.selectDay);
  const updateDraft = useUpdateDraft();
  // The menu keeps its content while it animates out.
  const [menuFor, setMenuFor] = useState<number | null>(null);
  const menuShown = useLastDefined(menuFor);
  const [renameOpen, setRenameOpen] = useState(false);
  if (!plan) return <Redirect href="/import" />;

  const index = Math.min(dayIndex, plan.days.length - 1);
  const day = plan.days[index];
  const exercises = day?.exercises ?? [];
  const pending = pendingReviews(plan);
  const items = exercises.map((e) => ({
    exerciseId: e.exerciseId,
    sets: e.sets.length,
    restSeconds: e.restSeconds ?? null,
  }));
  const weekdays = t('common:weekdays.long', { returnObjects: true });
  const empty = exercises.length === 0;

  function editDay(edit: (day: ImportedDay) => ImportedDay) {
    editPlan((p) => editDayAt(p, index, edit));
  }

  function editExercise(at: number, edit: (e: ImportedExercise) => ImportedExercise) {
    editDay((d) => editExerciseAt(d, at, edit));
  }

  // Adding and swapping happen on the library page; picks apply when it closes with "Done".
  const openPicker = (params: { mode: 'add' } | { mode: 'swap'; index: string }) =>
    router.push({ pathname: '/import/picker', params });

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

  function onMenuAction(action: ExerciseMenuAction) {
    const at = menuFor;
    setMenuFor(null);
    if (at === null) return;
    if (action === 'swap') afterSheetClose(() => openPicker({ mode: 'swap', index: String(at) }));
    else if (action === 'remove')
      editDay((d) => ({ ...d, exercises: d.exercises.filter((_, k) => k !== at) }));
    else if (action === 'moveUp' || action === 'moveDown') {
      const to = at + (action === 'moveUp' ? -1 : 1);
      editDay((d) => {
        const next = [...d.exercises];
        [next[at], next[to]] = [next[to], next[at]];
        return { ...d, exercises: next };
      });
    }
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}
      >
        <PlanBar
          items={plan.days.map((d) => ({ name: d.name, review: needsReview(d) }))}
          currentIndex={index}
          onSelect={selectDay}
          onAdd={addDay}
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

            <WorkedMuscles title={day.name} items={items} />

            <ExerciseListHeader
              count={exercises.length}
              minutes={estimateMinutes(items)}
              addLabel={t('planImport:confirm.add')}
              onAdd={() => openPicker({ mode: 'add' })}
            />

            <View className="px-5 pt-2">
              {empty ? (
                <EmptyExercises hint={t('planImport:confirm.empty')} />
              ) : (
                exercises.map((e, i) => (
                  <TemplateExerciseCard
                    key={`${e.exerciseId}-${i}`}
                    exerciseId={e.exerciseId}
                    sets={e.sets.map((set, k) => ({
                      key: String(k),
                      min: set.targetMin,
                      max: set.targetMax,
                      rir: set.rir,
                    }))}
                    review={!!e.raw}
                    onMenu={() => setMenuFor(i)}
                    onPress={() =>
                      router.push({ pathname: '/exercise/[id]', params: { id: e.exerciseId } })
                    }
                  >
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
                  </TemplateExerciseCard>
                ))
              )}
            </View>
          </>
        ) : null}
      </ScrollView>

      <BottomFade>
        <Button
          label={
            pending
              ? t('planImport:confirm.check', { count: pending })
              : t('planImport:confirm.cta')
          }
          variant={pending ? 'secondary' : 'primary'}
          onPress={submit}
        />
      </BottomFade>

      <ExerciseMenuSheet
        visible={menuFor !== null}
        onClose={() => setMenuFor(null)}
        hidden={['editSets']}
        canMoveUp={(menuShown ?? 0) > 0}
        canMoveDown={menuShown !== null && menuShown < exercises.length - 1}
        onAction={onMenuAction}
      />
      <TextInputSheet
        visible={renameOpen}
        onClose={() => setRenameOpen(false)}
        title={t('planImport:confirm.renamePlan')}
        initialValue={plan.name}
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
