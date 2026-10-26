import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { MUSCLE_IDS, MuscleCrop, type MuscleId } from '@/shared/ui/muscle-map';
import { Text } from '@/shared/ui/text';

import { type Tier, tierOf } from '../lib/levels';

/** The neon by tier: dimmer for Anfänger and Aufsteiger, full from Fortgeschritten. */
const TIER_ACCENT: Record<Tier, string> = {
  beginner: '#8E9C2B',
  novice: '#C3DA22',
  intermediate: colors.accent,
  advanced: colors.accent,
  elite: colors.accent,
};

// Stable `selected` arrays, so the memoized map skips re-rendering with its card.
const ONLY = Object.fromEntries(MUSCLE_IDS.map((m) => [m, [m]])) as Record<MuscleId, MuscleId[]>;
const NONE: MuscleId[] = [];

export interface LevelCardProps {
  muscle: MuscleId;
  /** The level with its way to the next (e.g. 38.52); undefined without a level. */
  value?: number;
  /** Levels gained in the last 30 days. */
  gain?: number;
  /** Levels gained since the tab was last left; 0 for a level that is new itself. */
  fresh?: number;
  /** Weeks since it was last trained, once that's long enough to count as a pause. */
  pauseWeeks?: number;
}

/** A muscle on the Level tab: its picture, level, progress to the next and what changed. */
export const LevelCard = memo(function LevelCard({
  muscle,
  value,
  gain,
  fresh,
  pauseWeeks,
}: LevelCardProps) {
  const { t } = useTranslation('muscles');
  const name = t(`names.${muscle}`);

  if (value === undefined) {
    return (
      <View
        accessible
        accessibilityLabel={`${name}, ${t('level.locked')}`}
        className="min-w-0 flex-1 gap-2.5 rounded-[18px] bg-tile px-2.5 pt-2.5 pb-3.5"
      >
        <View className="aspect-square w-full overflow-hidden rounded-xl bg-elevated">
          <MuscleCrop muscle={muscle} selected={NONE} />
          <View className="absolute top-2 left-2 size-7 items-center justify-center rounded-full bg-control">
            <Icon name="lock" size={11} color={colors.subtle} />
          </View>
        </View>
        <View className="gap-1.5 px-1">
          <Text variant="label" numberOfLines={1} className="text-dim">
            {name}
          </Text>
          <View className="h-1.5 rounded-full bg-control" />
          <Text variant="caption" tone="subtle" numberOfLines={1} className="text-xs">
            {t('level.locked')}
          </Text>
        </View>
      </View>
    );
  }

  const level = Math.floor(value);
  const percent = Math.floor((value - level) * 100);
  const paused = pauseWeeks !== undefined;
  const accent = TIER_ACCENT[tierOf(level)];
  const chip =
    fresh !== undefined
      ? fresh
        ? `+${fresh} · ${t('level.new')}`
        : t('level.new')
      : gain && !paused
        ? `+${gain}`
        : null;
  const line = paused
    ? t('level.pause', { count: pauseWeeks })
    : level >= 100
      ? t('level.max')
      : t('level.toNext', { percent, next: level + 1 });

  return (
    <View
      accessible
      accessibilityLabel={[
        name,
        `${t('level.badge')} ${level}`,
        t(`level.tiers.${tierOf(level)}`),
        chip,
        line,
      ]
        .filter(Boolean)
        .join(', ')}
      className={cn(
        'min-w-0 flex-1 gap-2.5 rounded-[18px] border-[1.5px] bg-tile px-2.5 pt-2.5 pb-3.5',
        fresh !== undefined ? 'border-accent' : 'border-transparent',
      )}
    >
      <View className="aspect-square w-full overflow-hidden rounded-xl bg-elevated">
        <MuscleCrop muscle={muscle} selected={paused ? NONE : ONLY[muscle]} accent={accent} />
        <View className="absolute top-2 left-2 h-7 flex-row items-center rounded-full bg-bg px-2.5">
          <Text variant="caption" className={cn('text-xs', paused && 'text-dim')}>
            {`${t('level.badge')} `}
            <Text className={cn('font-inter-bold text-sm', paused && 'text-dim')}>{level}</Text>
          </Text>
        </View>
        {chip ? (
          <View className="absolute top-2 right-2 h-7 justify-center rounded-full bg-accent px-2.5">
            <Text variant="caption" tone="onAccent" className="font-inter-bold text-xs">
              {chip}
            </Text>
          </View>
        ) : null}
      </View>
      <View className="gap-1.5 px-1">
        <Text variant="label" numberOfLines={1}>
          {name}
        </Text>
        <View className="h-1.5 overflow-hidden rounded-full bg-control">
          <View
            className="h-full rounded-full"
            style={{
              width: `${level >= 100 ? 100 : percent}%`,
              backgroundColor: paused ? colors.track : accent,
            }}
          />
        </View>
        <Text variant="caption" tone="subtle" numberOfLines={1} className="text-xs">
          {line}
        </Text>
      </View>
    </View>
  );
});
