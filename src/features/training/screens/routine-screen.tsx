import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePlans } from '@/shared/data/plans';
import { estimateMinutes, exerciseItems, useRoutineDetail } from '@/shared/data/routines';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { PlanExerciseList } from '../components/plan-exercise-list';
import { RoutineMenu, type RoutineMenuTarget } from '../components/routine-menu';
import { removeRoutineExercise, reorderRoutineExercise } from '../data/routine-mutations';
import { useStartRoutine } from '../hooks/use-start-routine';

/**
 * Routine overview: its name on top with the plan it is in, the muscles, the editable exercise
 * list and the start CTA (03·0b). "⋯" renames, copies or deletes it.
 */
export function RoutineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation(['training', 'common']);
  const insets = useSafeAreaInsets();
  const { data: routine, isLoading } = useRoutineDetail(id);
  const { data: plans = [] } = usePlans();
  const planName = plans.find((p) => p.id === routine?.planId)?.name;
  const { start, startingId } = useStartRoutine();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const [menuFor, setMenuFor] = useState<RoutineMenuTarget | null>(null);

  const exercises = routine?.exercises ?? [];
  const minutes = estimateMinutes(exerciseItems(exercises));

  // Adding and swapping happen on the library page; picks apply when it closes with "Done".
  const openPicker = (params: { mode: 'add' } | { mode: 'swap'; routineExerciseId: string }) =>
    router.push({ pathname: '/routine/[id]/picker', params: { id, ...params } });
  const openSets = (index: number) => router.push(`/routine/${id}/sets/${exercises[index].id}`);

  const header = (
    <ScreenHeader
      icon="chevron-left-thin"
      title={
        <View className="items-center">
          <Text variant="bodyStrong" numberOfLines={1} className="text-center">
            {routine?.name ?? ''}
          </Text>
          {planName ? (
            <Text variant="caption" tone="subtle" numberOfLines={1} className="font-inter-medium">
              {t('overview.partOf', { plan: planName })}
            </Text>
          ) : null}
        </View>
      }
      action={
        <IconButton
          icon="more"
          iconSize={18}
          accessibilityLabel={t('overview.more')}
          disabled={!routine}
          onPress={() =>
            routine &&
            setMenuFor({ ...routine, exerciseCount: exercises.length, estimatedMinutes: minutes })
          }
        />
      }
    />
  );

  if (!routine) {
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
          title={routine.name}
          exercises={exercises}
          keyOf={(e) => e.id}
          addLabel={t('overview.addExercise')}
          emptyHint={t('overview.emptyHint')}
          scrollRef={scrollRef}
          onAdd={() => openPicker({ mode: 'add' })}
          onOpen={openSets}
          onEditSets={openSets}
          onSwap={(i) => openPicker({ mode: 'swap', routineExerciseId: exercises[i].id })}
          onRemove={(i) => void removeRoutineExercise(exercises[i].id)}
          onMove={(from, to) => void reorderRoutineExercise(exercises[from].id, to)}
        />
      </Animated.ScrollView>

      {!empty ? (
        <BottomFade>
          <Button
            label={t('overview.start')}
            loading={startingId === routine.id}
            onPress={() => start(routine)}
          />
        </BottomFade>
      ) : null}

      <RoutineMenu
        routine={menuFor}
        onClose={() => setMenuFor(null)}
        onDelete={() => router.back()}
      />
    </Screen>
  );
}
