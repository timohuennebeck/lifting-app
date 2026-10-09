import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ProBadge } from '@/features/paywall/components/pro-badge';
import { useIsPro } from '@/features/paywall/stores/subscription-store';
import { OpenTicketsSection } from '@/features/support/components/open-tickets-section';
import { TabScreen } from '@/shared/components/tab-screen';
import { useProfile } from '@/shared/data/profile';
import { useWorkoutCount, useWorkoutHistory } from '@/shared/data/workouts';
import { formatDate } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

import { ActivityHeatmap } from '../components/activity-heatmap';
import { HistoryEntry } from '../components/history-entry';

const PAGE = 10;

export function ProfileScreen() {
  const { t } = useTranslation('profile');
  const { profile } = useProfile();
  const isPro = useIsPro();
  const [visible, setVisible] = useState(PAGE);
  const { data: history = [] } = useWorkoutHistory(visible);
  const { data: workoutCount = 0 } = useWorkoutCount();
  const name = profile?.firstName ?? '';
  const facts = [
    profile?.trainingDays.length
      ? t('facts.perWeek', { count: profile.trainingDays.length })
      : null,
    t('facts.workouts', { count: workoutCount }),
  ].filter(Boolean);

  return (
    <TabScreen greeting={false}>
      <View className="items-start px-5 pt-4">
        <View className="rounded-full border-[3px] border-accent p-1">
          <Avatar name={name} size={106} className="border-0" />
        </View>
        <Text className="mt-4.5 font-inter-semibold text-[34px] leading-9.5 tracking-[-0.7px]">
          {name}
        </Text>
        <View className="mt-3 flex-row items-center gap-2.5">
          {isPro ? <ProBadge className="self-center" /> : null}
          {profile?.createdAt ? (
            <Text tone="muted" className="text-sm">
              {t('memberSince', {
                date: formatDate(new Date(profile.createdAt), { month: 'long', year: 'numeric' }),
              })}
            </Text>
          ) : null}
        </View>
        <View className="mt-4.5 gap-2">
          {facts.map((fact) => (
            <Text key={fact} variant="paragraph" className="text-fg-mid">
              {`• ${fact}`}
            </Text>
          ))}
        </View>
      </View>

      <OpenTicketsSection />

      <View className="mx-5 mt-7.5">
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
    </TabScreen>
  );
}
