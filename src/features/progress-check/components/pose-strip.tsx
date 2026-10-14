import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PhotoThumb } from '@/shared/ui/photo-thumb';
import { Text } from '@/shared/ui/text';

import { POSES, WARN_COLOR, type Pose } from '../lib/poses';
import type { Shots } from '../stores/progress-check-store';

export interface PoseStripProps {
  shots: Shots;
  active: Pose;
  onSelect: (pose: Pose) => void;
  /** The X on a taken photo. */
  onRemove: (pose: Pose) => void;
  /** Under a photo shown full screen: the shown one is marked white, not in the accent. */
  viewing?: boolean;
}

interface ShotBadgeProps {
  warn: boolean;
}

/** 16pt badge in the thumbnail corner: accent check, or orange "!" for a weak photo. */
function ShotBadge({ warn }: ShotBadgeProps) {
  return (
    <View
      className="size-4 items-center justify-center rounded-full bg-accent"
      style={warn ? { backgroundColor: WARN_COLOR } : undefined}
    >
      {warn ? (
        <Text className="font-inter-bold text-[11px] leading-3.25 text-on-accent">!</Text>
      ) : (
        <Icon name="check" size={9} color={colors.onAccent} />
      )}
    </View>
  );
}

/** Row of the pose thumbnails with labels (camera 08a, live and over a taken photo). */
export function PoseStrip({ shots, active, onSelect, onRemove, viewing = false }: PoseStripProps) {
  const { t } = useTranslation('progressCheck');
  return (
    <View className="flex-row items-start justify-center gap-4.5">
      {POSES.map((pose) => {
        const shot = shots[pose];
        const warn = !!shot?.issue;
        return (
          <PhotoThumb
            key={pose}
            uri={shot?.uri}
            label={t(`poses.${pose}.short`)}
            accessibilityLabel={t(`poses.${pose}.name`)}
            selected={pose === active}
            viewing={viewing}
            ringColor={warn ? WARN_COLOR : undefined}
            badge={<ShotBadge warn={warn} />}
            remove={
              shot
                ? {
                    accessibilityLabel: t('photo.remove', { pose: t(`poses.${pose}.name`) }),
                    onPress: () => onRemove(pose),
                  }
                : undefined
            }
            onPress={() => onSelect(pose)}
          />
        );
      })}
    </View>
  );
}
