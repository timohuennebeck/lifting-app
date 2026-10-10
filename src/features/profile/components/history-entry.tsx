import { router } from 'expo-router';
import { Trans, useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { WorkoutSummary } from '@/shared/data/workouts';
import { addDays, isSameDay, minutesBetween, startOfDay } from '@/shared/lib/date';
import { formatTime, formatWeekdayDate } from '@/shared/lib/format';
import { UserAvatar } from '@/shared/components/user-avatar';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface HistoryEntryProps {
  workout: WorkoutSummary;
  userName: string;
}

/** "<name> finished <workout> in <duration>" feed row; opens the summary. */
export function HistoryEntry({ workout, userName }: HistoryEntryProps) {
  const { t } = useTranslation(['profile', 'common']);
  const started = new Date(workout.startedAt);
  const now = new Date();
  const yesterday = addDays(startOfDay(now), -1);
  const time = formatTime(started);
  const when = isSameDay(started, now)
    ? t('when.today', { time })
    : isSameDay(started, yesterday)
      ? t('when.yesterday', { time })
      : formatWeekdayDate(started);
  const duration = `${minutesBetween(workout.startedAt, workout.finishedAt)} ${t('common:units.minShort')}`;

  return (
    <PressableScale
      className="flex-row items-center gap-3 py-3"
      onPress={() => router.push(`/workout/summary/${workout.id}`)}
    >
      <View className="rounded-full border-[1.5px] border-accent p-0.5">
        <UserAvatar size={36} className="border-0" />
      </View>
      <View className="min-w-0 flex-1">
        <Text tone="muted" className="text-sm leading-5">
          <Trans
            t={t}
            i18nKey="historyEntry"
            values={{ name: userName, workout: workout.name, duration }}
            components={{ b: <Text variant="label" className="text-sm leading-5" /> }}
          />
        </Text>
        <Text variant="caption" className="mt-0.75 font-inter text-xs text-dim">
          {when}
        </Text>
      </View>
    </PressableScale>
  );
}
