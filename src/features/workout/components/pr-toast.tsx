import { useEffect, useEffectEvent } from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { formatSet, type UnitSystem } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

import type { RecordHit } from '../hooks/use-live-workout';

const VISIBLE_MS = 2800;

export interface PrToastProps {
  record: RecordHit | null;
  units: UnitSystem;
  onHide: () => void;
}

/** "New record" toast shown when a logged set beats the best estimated 1RM. */
export function PrToast({ record, units, onHide }: PrToastProps) {
  const { t } = useTranslation('workout');
  const insets = useSafeAreaInsets();

  const hide = useEffectEvent(onHide);
  useEffect(() => {
    if (!record) return;
    const id = setTimeout(hide, VISIBLE_MS);
    return () => clearTimeout(id);
  }, [record]);

  if (!record) return null;
  return (
    <Animated.View
      key={record.at}
      entering={FadeInUp.springify().damping(18)}
      exiting={FadeOutUp.duration(200)}
      pointerEvents="none"
      className="absolute inset-x-0 z-30 items-center"
      style={{ top: insets.top + 8 }}
    >
      <View
        accessibilityLiveRegion="polite"
        className="flex-row items-center gap-3 rounded-full border border-white/8 bg-elevated py-2.5 pr-5 pl-3"
      >
        <View className="size-8 items-center justify-center rounded-full bg-accent">
          <Icon name="star" size={14} color={colors.onAccent} />
        </View>
        <View>
          <Text variant="label">{t('record.title')}</Text>
          <Text variant="caption" tone="subtle" className="font-inter">
            {formatSet(record.kg, record.reps, units)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
