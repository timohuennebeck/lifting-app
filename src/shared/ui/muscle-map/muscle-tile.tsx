import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { Text } from '../text';
import { MUSCLE_CARDS, type MuscleId } from './body-paths';
import { MuscleMap } from './muscle-map';

export interface MusclePercentProps {
  percent: number;
  /** Dim grey instead of the accent, for untrained muscles. */
  muted?: boolean;
}

/** Big muscle share, e.g. "32 %". */
export function MusclePercent({ percent, muted }: MusclePercentProps) {
  const tone = muted ? undefined : 'accent';
  return (
    <Text
      variant="headline"
      tone={tone}
      className={cn('text-[28px] leading-[28px]', muted && 'text-dim')}
    >
      {percent}
      <Text variant="label" tone={tone} className={cn('text-base', muted && 'text-dim')}>
        {' %'}
      </Text>
    </Text>
  );
}

export interface MuscleTileProps {
  muscle: MuscleId;
  /** Share 0–100; hidden when undefined. */
  percent?: number;
  className?: string;
}

/** Muscle card from design 03·0b: cropped muscle art, big accent %, name. */
export function MuscleTile({ muscle, percent, className }: MuscleTileProps) {
  const { t } = useTranslation('muscles');
  const card = MUSCLE_CARDS[muscle];
  return (
    <View
      className={cn(
        'w-60 flex-row items-center gap-3 rounded-[22px] bg-tile py-2 pr-4 pl-2',
        className,
      )}
    >
      <View className="size-[84px] overflow-hidden rounded-2xl bg-elevated">
        <MuscleMap view={card.view} viewBox={card.viewBox} selected={[muscle]} fit="cover" />
      </View>
      <View className="min-w-0 flex-1 gap-1">
        {percent !== undefined ? <MusclePercent percent={percent} /> : null}
        <Text variant="caption" numberOfLines={1} className="text-sm leading-[18px]">
          {t(`names.${muscle}`)}
        </Text>
      </View>
    </View>
  );
}
