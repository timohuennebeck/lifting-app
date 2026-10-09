import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Text } from '@/shared/ui/text';

import type { GroupScores } from '../lib/body-check-service';
import { type GroupBand, groupBands } from '../lib/metrics';
import { WARN_COLOR } from '../lib/poses';

const BANDS: GroupBand[] = ['top', 'mid', 'focus'];

export interface GroupBandsProps {
  scores: Partial<GroupScores>;
}

/** Muscle groups sorted into strengths, average and focus pills (design 08d-A). */
export function GroupBands({ scores }: GroupBandsProps) {
  const { t } = useTranslation('bodyCheck');
  const bands = groupBands(scores);
  const tint = { top: colors.accent, focus: WARN_COLOR, mid: null } as const;

  return (
    <View className="px-5">
      {BANDS.filter((band) => bands[band].length).map((band) => (
        <View key={band} className="gap-2.5 py-3">
          <View className="flex-row items-baseline justify-between gap-3">
            <Text variant="label">{t(`result.bands.${band}.title`)}</Text>
            {band !== 'mid' ? (
              <Text variant="caption" tone="subtle" className="font-inter text-xs">
                {t(`result.bands.${band}.subtitle`)}
              </Text>
            ) : null}
          </View>
          <View className="flex-row flex-wrap gap-2">
            {bands[band].map(({ group, value }) => {
              const color = tint[band];
              return (
                <View
                  key={group}
                  className="h-10 flex-row items-center gap-2.5 rounded-full border border-line bg-surface pr-1.5 pl-3.5"
                  style={color ? { borderColor: `${color}70` } : undefined}
                >
                  <Text variant="label" className="text-sm">
                    {t(`groups.${group}`)}
                  </Text>
                  <View
                    className="h-7 min-w-7.5 items-center justify-center rounded-full bg-control px-2"
                    style={color ? { backgroundColor: color } : undefined}
                  >
                    <Text variant="caption" tone={color ? 'onAccent' : 'default'}>
                      {value}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
