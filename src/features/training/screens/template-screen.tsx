import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { estimateMinutes, exerciseItems, useTemplateDetail } from '@/shared/data/templates';
import { haptics } from '@/shared/lib/haptics';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';
import { TextInputSheet } from '@/shared/ui/text-input-sheet';
import { TRAINING_NAME_MAX } from '@/shared/lib/limits';

import { PlanExerciseList } from '../components/plan-exercise-list';
import { TemplateOptionsSheet } from '../components/template-options-sheet';
import {
  deleteTemplate,
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
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);

  const exercises = template?.exercises ?? [];
  const minutes = estimateMinutes(exerciseItems(exercises));

  // Adding and swapping happen on the library page; picks apply when it closes with "Done".
  const openPicker = (params: { mode: 'add' } | { mode: 'swap'; templateExerciseId: string }) =>
    router.push({ pathname: '/template/[id]/picker', params: { id, ...params } });
  const openSets = (index: number) => router.push(`/template/${id}/sets/${exercises[index].id}`);

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
        <PlanExerciseList
          title={template.name}
          exercises={exercises}
          keyOf={(e) => e.id}
          addLabel={t('overview.addExercise')}
          emptyHint={t('overview.emptyHint')}
          scrollRef={scrollRef}
          onAdd={() => openPicker({ mode: 'add' })}
          onOpen={openSets}
          onEditSets={openSets}
          onSwap={(i) => openPicker({ mode: 'swap', templateExerciseId: exercises[i].id })}
          onRemove={(i) => void removeTemplateExercise(exercises[i].id)}
          onMove={(from, to) => void reorderTemplateExercise(exercises[from].id, to)}
        />
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
        maxLength={TRAINING_NAME_MAX}
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
