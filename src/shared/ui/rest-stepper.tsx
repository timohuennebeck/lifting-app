import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatDuration } from '@/shared/lib/format';
import { clamp } from '@/shared/lib/math';

import { IconButton } from './icon-button';
import { Text } from './text';

const REST_STEP = 15;
const REST_MIN = 15;
const REST_MAX = 600;

export interface RestStepperProps {
  /** Rest in seconds. */
  value: number;
  onChange: (seconds: number) => void;
}

/** Rest between sets as "1:30 Min." with minus and plus in 15 s steps, 0:15 to 10:00. */
export function RestStepper({ value, onChange }: RestStepperProps) {
  const { t } = useTranslation(['training', 'common']);
  const step = (delta: number) => onChange(clamp(value + delta, REST_MIN, REST_MAX));
  return (
    <View className="h-16 flex-row items-center justify-between">
      <IconButton
        icon="minus"
        size={48}
        haptic="select"
        className="bg-raised"
        accessibilityLabel={t('common:actions.decrease')}
        disabled={value <= REST_MIN}
        onPress={() => step(-REST_STEP)}
      />
      <View className="flex-row items-baseline gap-1.5">
        <Text variant="headline" className="text-[26px] leading-7.5 tabular-nums">
          {formatDuration(value)}
        </Text>
        <Text variant="caption" tone="subtle" className="font-inter text-sm">
          {t('training:sets.minutes')}
        </Text>
      </View>
      <IconButton
        icon="plus"
        size={48}
        haptic="select"
        className="bg-raised"
        accessibilityLabel={t('common:actions.increase')}
        disabled={value >= REST_MAX}
        onPress={() => step(REST_STEP)}
      />
    </View>
  );
}
