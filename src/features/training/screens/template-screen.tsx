import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Sortable from 'react-native-sortables';

import { WorkedMuscles } from '@/features/muscles/components/worked-muscles';
import {
  estimateMinutes,
  type TemplateExerciseDetail,
  useTemplateDetail,
} from '@/shared/data/templates';
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

import { ExerciseListHeader } from '../components/exercise-list-header';
import { type ExerciseMenuAction, ExerciseMenuSheet } from '../components/exercise-menu-sheet';
import { TemplateExerciseCard } from '../components/template-exercise-card';
import { TemplateOptionsSheet } from '../components/template-options-sheet';
import {
  deleteTemplate,
  moveTemplateExercise,
  removeTemplateExercise,
  renameTemplate,
  reorderTemplateExercise,
} from '../data/template-mutations';
import { useStartTemplate } from '../hooks/use-start-template';

/**
 * Training overview: its name on top, the muscles, the editable exercise list and the start CTA
 * (03·0b). "⋯" renames or deletes it.
 */
export function TemplateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation(['training', 'common']);
  const insets = useSafeAreaInsets();
  const { data: template, isLoading } = useTemplateDetail(id);
  const { start, startingId } = useStartTemplate();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  // Letting go of a dragged exercise also ends a press on it; that one isn't a tap.
  const dragging = useRef(false);
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
  const minutes = estimateMinutes(items);
  const menuIndex = menuShown ? exercises.findIndex((e) => e.id === menuShown.id) : -1;

  // Adding and swapping happen on the library page; picks apply when it closes with "Done".
  const openPicker = (params: { mode: 'add' } | { mode: 'swap'; templateExerciseId: string }) =>
    router.push({ pathname: '/template/[id]/picker', params: { id, ...params } });

  const onMenuAction = async (action: ExerciseMenuAction) => {
    const target = menuFor;
    setMenuFor(null);
    if (!target || !template) return;
    if (action === 'editSets')
      afterSheetClose(() => router.push(`/template/${template.id}/sets/${target.id}`));
    else if (action === 'swap')
      afterSheetClose(() => openPicker({ mode: 'swap', templateExerciseId: target.id }));
    else if (action === 'remove') await removeTemplateExercise(target.id);
    else await moveTemplateExercise(target.id, action === 'moveUp' ? -1 : 1);
  };

  const onDelete = async () => {
    if (!template) return;
    setOptionsOpen(false);
    router.back();
    try {
      await deleteTemplate(template.id);
    } catch (error) {
      console.warn('Deleting the template failed', error);
      haptics.error();
    }
  };

  const header = (
    <ScreenHeader
      icon="chevron-left-thin"
      title={template?.name ?? ''}
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

  return (
    <Screen header={header}>
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + (empty ? 40 : 130) }}
      >
        <WorkedMuscles title={template.name} items={items} />

        <ExerciseListHeader
          count={exercises.length}
          minutes={minutes}
          addLabel={t('overview.addExercise')}
          onAdd={() => openPicker({ mode: 'add' })}
        />

        <View className="px-5 pt-2">
          {empty ? (
            <EmptyExercises hint={t('overview.emptyHint')} />
          ) : (
            // Hold an exercise to drag it to another place.
            <Sortable.Grid
              data={exercises}
              keyExtractor={(exercise) => exercise.id}
              columns={1}
              scrollableRef={scrollRef}
              dragActivationDelay={250}
              activeItemScale={1.03}
              inactiveItemOpacity={0.6}
              hapticsEnabled={false}
              onDragStart={() => {
                dragging.current = true;
                haptics.press();
              }}
              onDragEnd={({ key, fromIndex, toIndex }) => {
                setTimeout(() => (dragging.current = false), 150);
                if (toIndex !== fromIndex) void reorderTemplateExercise(key, toIndex);
              }}
              renderItem={({ item: exercise }) => (
                <TemplateExerciseCard
                  exerciseId={exercise.exerciseId}
                  sets={exercise.sets.map((set) => ({
                    key: set.id,
                    min: set.target_min,
                    max: set.target_max,
                    rir: set.rir,
                  }))}
                  onMenu={() => {
                    if (!dragging.current) setMenuFor(exercise);
                  }}
                  onPress={() => {
                    if (!dragging.current)
                      router.push(`/template/${template.id}/sets/${exercise.id}`);
                  }}
                />
              )}
            />
          )}
        </View>
      </Animated.ScrollView>

      {!empty ? (
        <BottomFade>
          <Button
            label={t('overview.start')}
            loading={startingId === template.id}
            onPress={() => start(template)}
          />
        </BottomFade>
      ) : null}

      <ExerciseMenuSheet
        visible={!!menuFor}
        onClose={() => setMenuFor(null)}
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
