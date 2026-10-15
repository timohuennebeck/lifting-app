import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PagerPage } from '@/shared/components/pager-page';
import { type RoutineSummary, useLastDone, useRoutines } from '@/shared/data/routines';
import { formatWeekdayDate } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';

import { AddRoutineButton } from '../components/add-routine-button';
import { RoutineRow, useRoutineMeta } from '../components/routine-row';
import { SectionTitle } from '../components/section-title';
import { useStartRoutine } from '../hooks/use-start-routine';

/** Routines done most recently, shown above the full list once it is longer than this. */
const RECENT = 3;

/**
 * "Alle Trainings" on the Training tab: the routines outside a plan, the ones done most
 * recently first, then all of them A–Z.
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

  return (
    <PagerPage>
      {library.length ? (
        <>
          {recent.length ? (
            <>
              <SectionTitle>{t('all.recent')}</SectionTitle>
              <View className="gap-2 px-4">
                {recent.map((routine) =>
                  row(
                    routine,
                    t('all.lastDone', {
                      date: formatWeekdayDate(new Date(lastDone[routine.id])),
                    }),
                  ),
                )}
              </View>
            </>
          ) : null}
          {/* Without recent ones the tab's name says what the list is. */}
          {recent.length ? <SectionTitle>{t('all.all')}</SectionTitle> : <View className="h-5" />}
          <View className="gap-2 px-4">{all.map((routine) => row(routine, meta(routine)))}</View>
          <AddRoutineButton />
        </>
      ) : !isLoading ? (
        <Card className="mx-4 mt-6 items-center gap-4 py-7">
          <View className="items-center gap-2">
            <Text variant="headline" className="text-center">
              {t('all.emptyTitle')}
            </Text>
            <Text variant="paragraph" tone="subtle" className="text-center">
              {t('list.libraryEmpty')}
            </Text>
          </View>
          <Button
            label={t('create.createRoutine')}
            icon="plus"
            size="md"
            variant="secondary"
            onPress={() => router.push('/routine/new')}
          />
        </Card>
      ) : null}
      {/* The list ends 40pt above the tab bar inset; PagerPage adds 24. */}
      <View className="h-4" />
    </PagerPage>
  );
}
