import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { TabScreen } from '@/shared/components/tab-screen';
import { useProfile } from '@/shared/data/profile';
import { startWorkout, useActiveWorkout } from '@/shared/data/workouts';
import { mondayIndex } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { requireUserId } from '@/shared/stores/session-store';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { DoneCard } from '../components/done-card';
import { PlannedCard } from '../components/planned-card';
import { RescheduleSheet } from '../components/reschedule-sheet';
import { RestDayCard } from '../components/rest-day-card';
import { WeekStrip } from '../components/week-strip';
import { useWeekPlan } from '../hooks/use-week-plan';
import { isSameDay } from '../lib/week';

export function TodayScreen() {
  const { t } = useTranslation('today');
  const { t: tc } = useTranslation();
  const today = new Date();
  const [selected, setSelected] = useState(mondayIndex(today));
  const [rescheduling, setRescheduling] = useState(false);
  const { profile } = useProfile();
  const { data: active } = useActiveWorkout();
  const { days, planTemplates } = useWeekPlan(today);
  const day = days[selected];

  const startEmpty = async () => {
    const id = await startWorkout(requireUserId(), t('emptyWorkoutName'), null);
    router.push(`/workout/${id}`);
  };

  const pills = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-4 pt-2 pb-0.5"
      className="grow-0"
    >
      {active ? (
        <PressableScale
          haptic="press"
          onPress={() => router.push(`/workout/${active.id}`)}
          className="h-10 flex-row items-center gap-[7px] rounded-full bg-accent px-[15px]"
        >
          <Icon name="play" size={12} color={colors.onAccent} />
          <Text variant="caption" tone="onAccent" className="text-sm">
            {t('resumeActive', { name: active.name })}
          </Text>
        </PressableScale>
      ) : (
        <PressableScale
          haptic="press"
          onPress={startEmpty}
          className="h-10 flex-row items-center gap-[7px] rounded-full bg-elevated px-[15px]"
        >
          <Icon name="plus" size={12} />
          <Text variant="caption" className="text-sm">
            {t('startEmpty')}
          </Text>
        </PressableScale>
      )}
    </ScrollView>
  );

  return (
    <TabScreen
      pinned={
        <View>
          {pills}
          <WeekStrip days={days} today={today} selected={selected} onSelect={setSelected} />
        </View>
      }
    >
      {day.workout ? (
        <DoneCard
          workout={day.workout}
          date={day.date}
          today={today}
          units={profile?.unitSystem ?? 'metric'}
        />
      ) : day.planned ? (
        <PlannedCard
          template={day.planned}
          date={day.date}
          today={today}
          activeWorkoutId={active?.id ?? null}
          onReschedule={() => setRescheduling(true)}
        />
      ) : (
        <RestDayCard
          dayName={tc('weekdays.long', { returnObjects: true })[selected]}
          isToday={isSameDay(day.date, today)}
        />
      )}
      <RescheduleSheet
        visible={rescheduling}
        template={day.planned}
        planTemplates={planTemplates}
        onClose={() => setRescheduling(false)}
        onMoved={setSelected}
      />
    </TabScreen>
  );
}
