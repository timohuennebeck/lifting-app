import { router } from 'expo-router';
import { Trans, useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ProfileAvatar } from '@/shared/components/user-avatar';
import type { Profile } from '@/shared/data/profile';
import type { WorkoutSummary } from '@/shared/data/workouts';
import { isSameDay, isYesterday, minutesBetween } from '@/shared/lib/date';
import { formatTime, formatWeekdayDate } from '@/shared/lib/format';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface HistoryEntryProps {
  workout: WorkoutSummary;
  /** The signed-in user's profile, from the screen (not watched once per row). */
  profile: Profile | null;
}

/** "<name> finished <workout> in <duration>" feed row; opens the summary. */
export function HistoryEntry({ workout, profile }: HistoryEntryProps) {
  const { t } = useTranslation(['profile', 'common']);
  const started = new Date(workout.startedAt);
  const now = new Date();
  const time = formatTime(started);
  let when: string;
  if (isSameDay(started, now)) when = t('when.today', { time });
  else if (isYesterday(started, now)) when = t('when.yesterday', { time });
  else when = formatWeekdayDate(started);
  const duration = `${minutesBetween(workout.startedAt, workout.finishedAt)} ${t('common:units.minShort')}`;

  return (
    <PressableScale
      className="flex-row items-center gap-3 py-3"
      onPress={() => router.push(`/workout/summary/${workout.id}`)}
    >
      <View className="rounded-full border-[1.5px] border-accent p-0.5">
        <ProfileAvatar profile={profile} size={36} className="border-0" />
      </View>
      <View className="min-w-0 flex-1">
        <Text tone="muted" className="text-sm leading-5">
          <Trans
            t={t}
            i18nKey="historyEntry"
            values={{ name: profile?.firstName ?? '', workout: workout.name, duration }}
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
