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
  /** Muscle and badge in neon, e.g. the muscle worked most; grey otherwise. */
  highlight?: boolean;
  /** Neon border: the chip picked in a filter. */
  selected?: boolean;
  /** Small, so several fit on a line (workout summary, muscle breakdown). */
  compact?: boolean;
}

/** Pill with the muscle on a round crop of the body map, its name and optionally its share. */
export function MuscleChip({
  art,
  lit,
  label,
  percent,
  highlight,
  selected,
  compact,
}: MuscleChipProps) {
  const card = MUSCLE_CARDS[art];
  const badged = percent !== undefined;
  return (
    <View
      className={cn(
        // The border is always there, clear unless selected, so selecting never resizes the chip.
        'flex-row items-center rounded-full border-[1.5px] bg-tile',
        selected ? 'border-accent' : 'border-transparent',
        compact
          ? cn('gap-2 py-px pl-px', badged ? 'pr-0.75' : 'pr-3')
          : cn('gap-2.5 py-0.5 pl-0.75', badged ? 'pr-2.25' : 'pr-5'),
      )}
    >
      <View
        className={cn('overflow-hidden rounded-full bg-elevated', compact ? 'size-7' : 'size-11.5')}
      >
        <MuscleMap
          view={card.view}
          viewBox={card.viewBox}
          selected={lit ?? [art]}
          accent={highlight ? colors.accent : colors.fg2}
          fit="cover"
        />
      </View>
      {/* Shrinks to "Vordere Schul…" where the chip has less room than it needs. */}
      <Text variant={compact ? 'caption' : 'label'} numberOfLines={1} className="shrink">
        {label}
      </Text>
      {badged ? (
        <View
          className={cn(
            'justify-center rounded-full',
            compact ? 'h-5.75 px-2' : 'ml-0.5 h-8.25 px-2.75',
            highlight ? 'bg-accent' : 'bg-control',
          )}
        >
          <Text variant={compact ? 'caption' : 'label'} tone={highlight ? 'onAccent' : 'default'}>
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
  /** In neon: the muscle worked most, as on the template cards. */
  highlight?: boolean;
  compact?: boolean;
}

/** A worked muscle with its share ("Beanspruchte Muskeln"); grey unless it's the top one. */
export function MuscleTile({ muscle, percent, highlight, compact }: MuscleTileProps) {
  const { t } = useTranslation('muscles');
  return (
    <MuscleChip
      art={muscle}
      label={t(`names.${muscle}`)}
      percent={percent}
      highlight={highlight}
      compact={compact}
    />
  );
}
