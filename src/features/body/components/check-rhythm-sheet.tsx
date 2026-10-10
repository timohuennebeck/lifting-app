import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { MIN_CHECK_GAP_DAYS } from '@/features/body-check/lib/eligibility';
import { BODY_CHECK_INTERVALS, type BodyCheckInterval } from '@/shared/data/profile';
import { formatShortDate } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { RadioList } from '@/shared/ui/radio-list-sheet';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

export interface CheckRhythmSheetProps {
  visible: boolean;
  onClose: () => void;
  interval: BodyCheckInterval;
  /** Saves the picked rhythm right away. */
  onIntervalChange: (interval: BodyCheckInterval) => void;
  /** When the next check is due with the current rhythm. */
  dueAt: number;
  /** When an early check is possible. */
  earliestAt: number;
  canStart: boolean;
  onStart: () => void;
}

/**
 * Opened from the next check while it is not due yet: how often checks come due, and a way to
 * do one early (not within MIN_CHECK_GAP_DAYS of the last one).
 */
export function CheckRhythmSheet({
  visible,
  onClose,
  interval,
  onIntervalChange,
  dueAt,
  earliestAt,
  canStart,
  onStart,
}: CheckRhythmSheetProps) {
  const { t } = useTranslation('body');
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('rhythm.title')}
      subtitle={t('rhythm.subtitle')}
      footer={
        <View className="gap-2.5 pt-2">
          <Text variant="caption" tone="subtle" className="text-center font-inter">
            {t('rhythm.nextOn', { date: formatShortDate(dueAt) })}
            {canStart ? '' : `\n${t('rhythm.gapNote', { days: MIN_CHECK_GAP_DAYS })}`}
          </Text>
          <Button
            label={
              canStart
                ? t('rhythm.checkNow')
                : t('rhythm.availableOn', { date: formatShortDate(earliestAt) })
            }
            disabled={!canStart}
            onPress={onStart}
          />
        </View>
      }
    >
      <RadioList
        options={BODY_CHECK_INTERVALS.map((days) => ({
          value: String(days),
          label: t(`rhythm.options.${days}`),
        }))}
        value={String(interval)}
        onSelect={(value) => onIntervalChange(Number(value) as BodyCheckInterval)}
      />
    </Sheet>
  );
}
