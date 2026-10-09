import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { POSES, WARN_COLOR, type BodyPose } from '../lib/poses';
import type { Shots } from '../stores/body-check-store';

export interface PoseStripProps {
  shots: Shots;
  active: BodyPose;
  onSelect: (pose: BodyPose) => void;
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

/** Row of the four pose thumbnails with labels (camera 08a and review 08b). */
export function PoseStrip({ shots, active, onSelect }: PoseStripProps) {
  const { t } = useTranslation('bodyCheck');
  return (
    <View className="flex-row items-start justify-center gap-4.5">
      {POSES.map((pose) => {
        const shot = shots[pose];
        const selected = pose === active;
        const warn = !!shot?.issue;
        const ring = selected
          ? `inset 0 0 0 2px ${colors.accent}`
          : warn
            ? `inset 0 0 0 1.5px ${WARN_COLOR}`
            : 'inset 0 0 0 1px rgba(255,255,255,0.18)';
        return (
          <PressableScale
            key={pose}
            haptic="select"
            accessibilityLabel={t(`poses.${pose}.name`)}
            accessibilityState={{ selected }}
            onPress={() => onSelect(pose)}
            className="items-center gap-2"
          >
            <View className="h-18.5 w-14 rounded-xl bg-surface p-1.5" style={{ boxShadow: ring }}>
              <View className="flex-1 items-center justify-center overflow-hidden rounded-md bg-raised">
                {shot ? (
                  <>
                    <Image
                      source={{ uri: shot.uri }}
                      contentFit="cover"
                      style={StyleSheet.absoluteFill}
                    />
                    <View className="absolute right-0.75 bottom-0.75">
                      <ShotBadge warn={warn} />
                    </View>
                  </>
                ) : (
                  <Icon name="plus" size={12} color={colors.subtle} />
                )}
              </View>
            </View>
            <Text
              variant="caption"
              tone={selected ? 'accent' : 'muted'}
              className="tracking-[0.5px] uppercase"
            >
              {t(`poses.${pose}.short`)}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
