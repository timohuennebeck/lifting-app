import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PagerPage } from '@/shared/components/pager-page';
import { type RoutineSummary, useLastDone, useRoutines } from '@/shared/data/routines';
import { formatWeekdayDate } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

import { AddRoutineButton } from '../components/add-routine-button';
import { RoutineRow, useRoutineMeta } from '../components/routine-row';
import { SectionTitle } from '../components/section-title';
import { useStartRoutine } from '../hooks/use-start-routine';

/** Routines done most recently, shown above the full list once it is longer than this. */
const RECENT = 3;

/** A faint sketch of a routine card: photo, name, sets, chips, menu. */
function RoutineSketch() {
  return (
    <View
      className="w-full flex-row gap-4"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View className="h-24 w-18 rounded-xl bg-surface" />
      <View className="flex-1 gap-2.5 pt-1">
        <View className="h-2.5 w-11/12 rounded-full bg-surface" />
        <View className="h-2.5 w-2/3 rounded-full bg-surface" />
        {[0, 1].map((i) => (
          <View key={i} className="flex-row items-center gap-3">
            <View className="size-6.5 rounded-full bg-surface" />
            <View className="h-2 w-9 rounded-full bg-surface" />
          </View>
        ))}
        <View className="flex-row gap-2 pt-1">
          <View className="h-8 w-16 rounded-full bg-surface" />
          <View className="h-8 w-19 rounded-full bg-surface" />
        </View>
      </View>
      <View className="items-center gap-4 pt-1">
        <View className="gap-0.75">
          {[0, 1, 2].map((i) => (
            <View key={i} className="size-1 rounded-full bg-surface" />
          ))}
        </View>
        <View className="mt-5 size-6 rounded-full bg-surface" />
        <View className="size-6 rounded-full bg-surface" />
      </View>
    </View>
  );
}

/** Before the first routine of their own: a sketch of one and a way to make it. */
function NoRoutines() {
  const { t } = useTranslation('training');
  return (
    <View className="flex-1 items-center justify-center px-8 pb-12">
      <RoutineSketch />
      <Text variant="headline" className="mt-10 text-center">
        {t('empty.routinesTitle')}
      </Text>
      <Text variant="paragraph" tone="subtle" className="mt-2 text-center">
        {t('empty.routinesBody')}
      </Text>
      <Button
        label={t('create.createRoutine')}
        className="mt-6 h-12 px-7"
        onPress={() => router.push('/routine/new')}
      />
    </View>
  );
}

/**
 * Training → Alle Trainings: the routines outside a plan, the ones done most recently first
 * (once there are more than three), then all of them A–Z.
 */
export function AllRoutinesPage() {
  const { t, i18n } = useTranslation('training');
  const { data: routines = [], isLoading } = useRoutines();
  const { data: lastDone = {} } = useLastDone();
  const { start, startingId } = useStartRoutine();
  const meta = useRoutineMeta();

  const library = routines.filter((r) => r.planId === null);
  const all = [...library].sort((a, b) => a.name.localeCompare(b.name, i18n.language));
  const recent =
    library.length > RECENT
      ? library
          .filter((r) => lastDone[r.id])
          .sort((a, b) => lastDone[b.id].localeCompare(lastDone[a.id]))
          .slice(0, RECENT)
      : [];

  const row = (routine: RoutineSummary, line: string) => (
    <RoutineRow
      key={routine.id}
      name={routine.name}
      items={routine.items}
      meta={line}
      starting={startingId === routine.id}
      onPress={() => router.push(`/routine/${routine.id}`)}
      // An empty routine has nothing to start: play opens it to add exercises.
      onStart={() =>
        routine.exerciseCount ? start(routine) : router.push(`/routine/${routine.id}`)
      }
    />
  );

  if (!library.length) {
    return <PagerPage>{isLoading ? null : <NoRoutines />}</PagerPage>;
  }
  return (
    <PagerPage>
      {recent.length ? (
        <>
          <SectionTitle>{t('all.recent')}</SectionTitle>
          <View className="gap-2 px-4">
            {recent.map((routine) =>
              row(
                routine,
                t('all.lastDone', { date: formatWeekdayDate(new Date(lastDone[routine.id])) }),
              ),
            )}
          </View>
          <SectionTitle>{t('all.all')}</SectionTitle>
        </>
      ) : (
        <View className="h-5" />
      )}
      <View className="gap-2 px-4">{all.map((routine) => row(routine, meta(routine)))}</View>
      <AddRoutineButton />
      {/* The list ends 40pt above the tab bar inset; PagerPage adds 24. */}
      <View className="h-4" />
    </PagerPage>
  );
}
