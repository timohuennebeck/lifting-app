import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useNow } from '@/shared/hooks/use-now';
import { formatDuration } from '@/shared/lib/format';
import { IconButton } from '@/shared/ui/icon-button';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Text } from '@/shared/ui/text';

import { RestTimer } from './rest-timer';

interface ElapsedClockProps {
  startedAt: string;
}

function ElapsedClock({ startedAt }: ElapsedClockProps) {
  const now = useNow(1000);
  return (
    <Text variant="bodyStrong" className="text-xl leading-6">
      {formatDuration((now - Date.parse(startedAt)) / 1000, { alwaysHours: true })}
    </Text>
  );
}

export interface WorkoutTopBarProps {
  startedAt: string;
  /** 0–1, position of the current exercise in the workout. */
  progress: number;
  restSeconds: number;
  onClose: () => void;
}

/** Close · elapsed time · rest timer · progress (design 03·C header). */
export function WorkoutTopBar({ startedAt, progress, restSeconds, onClose }: WorkoutTopBarProps) {
  const { t } = useTranslation('workout');
  return (
    <View className="flex-row items-center gap-3.5 px-5 py-1.5">
      <IconButton icon="chevron-left" accessibilityLabel={t('menu.open')} onPress={onClose} />
      <ElapsedClock startedAt={startedAt} />
      <RestTimer defaultSeconds={restSeconds} />
      <ProgressBar value={progress} className="h-1.5 w-24 flex-none" />
    </View>
  );
}
