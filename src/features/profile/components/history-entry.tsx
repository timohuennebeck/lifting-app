import { router } from 'expo-router';
import { Trans, useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { isSameDay } from '@/features/today/lib/week';
import { minutesBetween } from '@/features/workout/lib/time';
import type { WorkoutSummary } from '@/shared/data/workouts';
import { formatDate } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/avatar';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface HistoryEntryProps {
  workout: WorkoutSummary;
  userName: string;
}

/** "<name> finished <workout> in <duration>" feed row; opens the summary. */
export function HistoryEntry({ workout, userName }: HistoryEntryProps) {
  const { t } = useTranslation('profile');
  const { t: tc } = useTranslation();
  const started = new Date(workout.startedAt);
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const time = formatDate(started, { hour: '2-digit', minute: '2-digit' });
  const when = isSameDay(started, now)
    ? t('when.today', { time })
    : isSameDay(started, yesterday)
      ? t('when.yesterday', { time })
      : formatDate(started, { weekday: 'short', day: 'numeric', month: 'short' });
  const duration = `${minutesBetween(workout.startedAt, workout.finishedAt)} ${tc('units.minShort')}`;

  return (
    <PressableScale
      className="flex-row items-center gap-3 py-3"
      onPress={() => router.push(`/workout/summary/${workout.id}`)}
    >
      <View className="rounded-full border-[1.5px] border-accent p-0.5">
        <Avatar name={userName} size={36} className="border-0" />
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
        <Text variant="caption" className="mt-[3px] font-inter text-xs text-dim">
          {when}
        </Text>
      </View>
    </PressableScale>
  );
}
