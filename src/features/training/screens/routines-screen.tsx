import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLastDone, useRoutines } from '@/shared/data/routines';
import { formatWeekdayDate } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { RECENT_ROUTINES, RoutineRows, useRoutineMeta } from '../components/routine-row';
import { SectionTitle } from '../components/section-title';
import { useCreateRoutine } from '../hooks/use-create-routine';
import { useStartRoutine } from '../hooks/use-start-routine';

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
function NoRoutines({ creating, onCreate }: { creating: boolean; onCreate: () => void }) {
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
        loading={creating}
        onPress={onCreate}
      />
    </View>
  );
}

/**
 * Einzeltrainings, opened from Training's "Alle anzeigen": the routines outside a plan, the ones
 * done most recently first (once there are more than three), then all of them A–Z. "+" makes a
 * new one.
 */
export function RoutinesScreen() {
  const { t, i18n } = useTranslation('training');
  const insets = useSafeAreaInsets();
  const { data: routines = [], isLoading } = useRoutines();
  const { data: lastDone = {} } = useLastDone();
  const { start, startingId } = useStartRoutine();
  const meta = useRoutineMeta();
  const { create, creating } = useCreateRoutine();

  const library = routines.filter((r) => r.planId === null);
  const all = [...library].sort((a, b) => a.name.localeCompare(b.name, i18n.language));
  const recent =
    library.length > RECENT_ROUTINES
      ? library
          .filter((r) => lastDone[r.id])
          .sort((a, b) => lastDone[b.id].localeCompare(lastDone[a.id]))
          .slice(0, RECENT_ROUTINES)
      : [];

  return (
    <Screen
      header={
        <ScreenHeader
          title={t('home.single')}
          action={
            <IconButton
              icon="plus"
              accessibilityLabel={t('create.createRoutine')}
              disabled={creating}
              onPress={() => void create()}
            />
          }
        />
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}
      >
        {!library.length ? (
          isLoading ? null : (
            <NoRoutines creating={creating} onCreate={() => void create()} />
          )
        ) : (
          <>
            {recent.length ? (
              <>
                <SectionTitle>{t('all.recent')}</SectionTitle>
                <RoutineRows
                  routines={recent}
                  meta={(r) =>
                    t('all.lastDone', { date: formatWeekdayDate(new Date(lastDone[r.id])) })
                  }
                  startingId={startingId}
                  onStart={start}
                />
                <SectionTitle>{t('all.all')}</SectionTitle>
              </>
            ) : (
              <View className="h-3" />
            )}
            <RoutineRows routines={all} meta={meta} startingId={startingId} onStart={start} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
