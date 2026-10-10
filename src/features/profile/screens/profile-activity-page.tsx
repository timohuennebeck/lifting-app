import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PagerPage } from '@/shared/components/pager-page';
import { useProfile } from '@/shared/data/profile';
import { useWorkoutCount, useWorkoutHistory } from '@/shared/data/workouts';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

import { ActivityHeatmap } from '../components/activity-heatmap';
import { HistoryEntry } from '../components/history-entry';

const PAGE = 10;

/** Profile, "Profil": the activity of the last months and the workout history, ten at a time. */
export function ProfileActivityPage() {
  const { t } = useTranslation('profile');
  const { profile } = useProfile();
  const name = profile?.firstName ?? '';
  const [visible, setVisible] = useState(PAGE);
  const { data: history = [] } = useWorkoutHistory(visible);
  const { data: workoutCount = 0 } = useWorkoutCount();

  return (
    <PagerPage>
      <View className="mx-5 mt-6">
        <View className="flex-row items-baseline justify-between">
          <Text variant="overline" tone="subtle" className="text-[11px]">
            {t('activity')}
          </Text>
          <Text tone="subtle" className="text-xs">
            {t('lastMonths')}
          </Text>
        </View>
        <ActivityHeatmap />
      </View>

      <Text variant="overline" tone="subtle" className="mx-5 mt-7 mb-3 text-[11px]">
        {t('history')}
      </Text>
      <View className="mx-5">
        {history.length ? (
          history.map((w) => <HistoryEntry key={w.id} workout={w} userName={name} />)
        ) : (
          <Text variant="paragraph" tone="subtle">
            {t('historyEmpty')}
          </Text>
        )}
      </View>
      {workoutCount > visible ? (
        <Button
          label={t('showMore')}
          variant="secondary"
          size="md"
          className="mx-5 mt-2"
          onPress={() => setVisible((v) => v + PAGE)}
        />
      ) : null}
    </PagerPage>
  );
}
