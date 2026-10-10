import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

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
      className={cn('text-[28px] leading-7', muted && 'text-dim')}
    >
      {percent}
      <Text variant="label" tone={tone} className={cn('text-base', muted && 'text-dim')}>
        {' %'}
      </Text>
    </Text>
  );
}

export interface MuscleChipProps {
  /** The muscle whose crop of the body map fills the circle. */
  art: MuscleId;
  /** Muscles lit on it; just `art` by default. Keep it a stable array. */
  lit?: readonly MuscleId[];
  label: string;
  /** Share 0–100 in a badge on the right; none when undefined. */
  percent?: number;
  /** Neon border, muscle and badge; grey without a border otherwise (e.g. an unselected filter). */
  active?: boolean;
}

/** Pill with the muscle on a round crop of the body map, its name and optionally its share. */
export function MuscleChip({ art, lit, label, percent, active }: MuscleChipProps) {
  const card = MUSCLE_CARDS[art];
  return (
    <View
      className={cn(
        // The border is always there, clear when inactive, so selecting never resizes the chip.
        'flex-row items-center gap-2.5 rounded-full border-[1.5px] bg-tile py-0.5 pl-0.75',
        active ? 'border-accent' : 'border-transparent',
        percent !== undefined ? 'pr-2.25' : 'pr-5',
      )}
    >
      <View className="size-11.5 overflow-hidden rounded-full bg-elevated">
        <MuscleMap
          view={card.view}
          viewBox={card.viewBox}
          selected={lit ?? [art]}
          accent={active ? colors.accent : colors.muted}
          fit="cover"
        />
      </View>
      <Text variant="label" numberOfLines={1}>
        {label}
      </Text>
      {percent !== undefined ? (
        <View
          className={cn(
            'ml-0.5 h-8.25 justify-center rounded-full px-2.75',
            active ? 'bg-accent' : 'bg-control',
          )}
        >
          <Text variant="label" tone={active ? 'onAccent' : 'default'}>
            {`${percent} %`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export interface MuscleTileProps {
  muscle: MuscleId;
  /** Share 0–100; hidden when undefined. */
  percent?: number;
}

/** A worked muscle with its share ("Beanspruchte Muskeln"), in grey: nothing to select there. */
export function MuscleTile({ muscle, percent }: MuscleTileProps) {
  const { t } = useTranslation('muscles');
  return <MuscleChip art={muscle} label={t(`names.${muscle}`)} percent={percent} />;
}
