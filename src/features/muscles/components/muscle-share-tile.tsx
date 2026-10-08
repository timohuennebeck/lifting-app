import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { MUSCLE_CARDS, MuscleMap, type MuscleId } from '@/shared/ui/muscle-map';
import { Text } from '@/shared/ui/text';

export interface MuscleShareTileProps {
  muscle: MuscleId;
  percent: number;
  /** Untrained muscles are drawn muted with an outline instead of a fill. */
  trained: boolean;
}

/** Square muscle tile of the Muscles tab grid (design 01·M·D). */
export function MuscleShareTile({ muscle, percent, trained }: MuscleShareTileProps) {
  const { t } = useTranslation('muscles');
  const card = MUSCLE_CARDS[muscle];
  return (
    <View
      className={cn(
        'min-w-0 flex-1 gap-2.5 rounded-[22px] px-2.5 pt-2.5 pb-3.5',
        trained ? 'bg-[#161616]' : 'border border-elevated',
      )}
    >
      <View
        className={cn(
          'aspect-square w-full overflow-hidden rounded-2xl',
          trained ? 'bg-elevated' : 'bg-surface',
        )}
      >
        <MuscleMap
          view={card.view}
          viewBox={card.viewBox}
          selected={trained ? [muscle] : []}
          fit="cover"
        />
      </View>
      <View className="gap-0.5 px-1">
        <Text
          variant="headline"
          tone={trained ? 'accent' : undefined}
          className={cn('text-[28px] leading-[28px]', !trained && 'text-dim')}
        >
          {percent}
          <Text
            variant="label"
            tone={trained ? 'accent' : undefined}
            className={cn('text-base', !trained && 'text-dim')}
          >
            {' %'}
          </Text>
        </Text>
        <Text variant="caption" numberOfLines={1} className={cn('text-sm', !trained && 'text-dim')}>
          {t(`names.${muscle}`)}
        </Text>
      </View>
    </View>
  );
}
