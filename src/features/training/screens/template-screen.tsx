import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExercisePickerSheet } from '@/features/exercises/components/exercise-picker-sheet';
import { exerciseName } from '@/shared/data/exercises';
import { muscleShares } from '@/shared/data/muscles';
import {
  estimateMinutes,
  type TemplateExerciseDetail,
  useCollections,
  useTemplateDetail,
} from '@/shared/data/templates';
import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';
import { EmptyExercises } from '@/shared/ui/empty-exercises';
import { IconButton } from '@/shared/ui/icon-button';
import { MuscleTileRow } from '@/shared/ui/muscle-map';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';
import { TextInputSheet } from '@/shared/ui/text-input-sheet';

import { type ExerciseMenuAction, ExerciseMenuSheet } from '../components/exercise-menu-sheet';
import { PlanBar } from '../components/plan-bar';
import { TemplateExerciseCard } from '../components/template-exercise-card';
import { TemplateOptionsSheet } from '../components/template-options-sheet';
import {
  addTemplateExercise,
  deleteTemplate,
  moveTemplateExercise,
  removeTemplateExercise,
  renameTemplate,
  swapTemplateExercise,
} from '../data/template-mutations';
import { usePlanProgress } from '../data/use-plan-progress';
import { useLastDefined } from '../hooks/use-last-defined';
import { useStartTemplate } from '../hooks/use-start-template';

type PickerState = { mode: 'add' } | { mode: 'swap'; templateExerciseId: string };

/** Training overview with plan bar, muscles, editable exercise list and start CTA (03·0b). */
export function TemplateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation(['training', 'common']);
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useTemplateDetail(id);
  // Keep showing the previous training while a plan-bar switch loads the next one.
  const previous = useLastDefined(data);
  const template = isLoading ? previous : data;
  const { data: collections = [] } = useCollections();
  const collectionId = template?.collectionId ?? null;
  const { data: plan = [] } = usePlanProgress(collectionId, !!template);
  const { start, startingId } = useStartTemplate();

  const [picker, setPicker] = useState<PickerState | null>(null);
  const [menuFor, setMenuFor] = useState<TemplateExerciseDetail | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const menuShown = useLastDefined(menuFor);

  const exercises = template?.exercises ?? [];
  const items = exercises.map((e) => ({
    exerciseId: e.exerciseId,
    sets: e.sets.length,
    restSeconds: e.restSeconds,
  }));
  const shares = muscleShares(items);
  const minutes = estimateMinutes(items);
  const collectionName = collectionId
    ? (collections.find((c) => c.id === collectionId)?.name ?? '')
    : t('list.noCollection');
  const menuIndex = menuShown ? exercises.findIndex((e) => e.id === menuShown.id) : -1;

  const onPick = async (exerciseId: string) => {
    if (!template || !picker) return;
    const current = picker;
    setPicker(null);
    if (current.mode === 'add') await addTemplateExercise(requireUserId(), template.id, exerciseId);
    else await swapTemplateExercise(current.templateExerciseId, exerciseId);
    haptics.success();
  };

  const onMenuAction = async (action: ExerciseMenuAction) => {
    const target = menuFor;
    setMenuFor(null);
    if (!target || !template) return;
    if (action === 'editSets')
      afterSheetClose(() => router.push(`/template/${template.id}/sets/${target.id}`));
    else if (action === 'swap')
      afterSheetClose(() => setPicker({ mode: 'swap', templateExerciseId: target.id }));
    else if (action === 'remove') await removeTemplateExercise(target.id);
    else await moveTemplateExercise(target.id, action === 'moveUp' ? -1 : 1);
  };

  const onDelete = async () => {
    if (!template) return;
    setOptionsOpen(false);
    router.back();
    await deleteTemplate(template.id);
  };

  const header = (
    <ScreenHeader
      icon="chevron-left-thin"
      title={template ? collectionName : ''}
      action={
        <IconButton
          icon="more"
          iconSize={18}
          accessibilityLabel={t('overview.more')}
          disabled={!template}
          onPress={() => setOptionsOpen(true)}
        />
      }
    />
  );

  if (!template) {
    return (
      <Screen header={header}>
        {!isLoading ? (
          <Text variant="paragraph" tone="subtle" className="px-5 pt-10 text-center">
            {t('overview.notFound')}
          </Text>
        ) : null}
      </Screen>
    );
  }

  const empty = exercises.length === 0;
  const weekdays = t('common:weekdays.long', { returnObjects: true }) as string[];

  return (
    <Screen header={header}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + (empty ? 40 : 130) }}
      >
        <PlanBar
          items={plan}
          currentId={template.id}
          onSelect={(templateId) => router.setParams({ id: templateId })}
          onAdd={() =>
            router.push({
              pathname: '/template/new',
              params: collectionId ? { collectionId } : {},
            })
          }
        />
        <Text variant="title" className="px-5 pt-7.5 normal-case">
          {template.name}
        </Text>
        <Text variant="paragraph" tone="subtle" className="px-5 pt-2">
          {template.weekday !== null && weekdays[template.weekday]
            ? t('overview.fixedDay', { day: weekdays[template.weekday] })
            : t('overview.noFixedDay')}
        </Text>

        {shares.length ? (
          <>
            <Text variant="headline" className="px-5 pt-6 leading-5.5">
              {t('overview.musclesWorked')}
            </Text>
            <View className="pt-3.5">
              <MuscleTileRow shares={shares} />
            </View>
          </>
        ) : null}

        <View className={cn('flex-row items-center gap-3 px-5', empty ? 'pt-9' : 'pt-7.5')}>
          <View className="min-w-0 flex-1">
            <Text variant="headline" className="leading-5.5">
              {empty
                ? t('overview.noExercises')
                : t('overview.exercises', { count: exercises.length })}
            </Text>
            <Text variant="paragraph" tone="subtle" className="mt-1.5 text-sm leading-4.5">
              {t('overview.duration', { minutes })}
            </Text>
          </View>
          <IconButton
            icon="plus"
            size={empty ? 56 : 44}
            iconSize={empty ? 18 : 14}
            accessibilityLabel={t('overview.addExercise')}
            className="bg-raised"
            onPress={() => setPicker({ mode: 'add' })}
          />
        </View>

        <View className="px-5 pt-2">
          {empty ? (
            <EmptyExercises hint={t('overview.emptyHint')} />
          ) : (
            exercises.map((exercise) => (
              <TemplateExerciseCard
                key={exercise.id}
                exercise={exercise}
                onMenu={() => setMenuFor(exercise)}
                onPress={() => router.push(`/template/${template.id}/sets/${exercise.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {!empty ? (
        <BottomFade>
          <Button
            label={t('overview.start')}
            loading={startingId === template.id}
            onPress={() => start(template)}
          />
        </BottomFade>
      ) : null}

      <ExercisePickerSheet
        visible={!!picker}
        onClose={() => setPicker(null)}
        onSelect={onPick}
        title={picker?.mode === 'swap' ? t('overview.swapTitle') : undefined}
        excludeIds={exercises.map((e) => e.exerciseId)}
      />
      <ExerciseMenuSheet
        visible={!!menuFor}
        onClose={() => setMenuFor(null)}
        title={menuShown ? exerciseName(menuShown.exerciseId, i18n.language) : ''}
        canMoveUp={menuIndex > 0}
        canMoveDown={menuIndex >= 0 && menuIndex < exercises.length - 1}
        onAction={onMenuAction}
      />
      <TemplateOptionsSheet
        visible={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        name={template.name}
        exerciseCount={exercises.length}
        minutes={minutes}
        onRename={() => {
          setOptionsOpen(false);
          afterSheetClose(() => setRenameOpen(true));
        }}
        onDelete={onDelete}
      />
      <TextInputSheet
        visible={renameOpen}
        onClose={() => setRenameOpen(false)}
        title={t('options.renameTitle')}
        initialValue={template.name}
        placeholder={t('options.namePlaceholder')}
        ctaLabel={t('common:actions.save')}
        onSubmit={async (name) => {
          await renameTemplate(template.id, name);
          setRenameOpen(false);
        }}
      />
    </Screen>
  );
}
