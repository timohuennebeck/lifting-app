import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Chip } from '@/shared/ui/chip';

import { POSES, type BodyPose } from '../lib/poses';

export interface PoseChipsProps {
  pose: BodyPose;
  onChange: (pose: BodyPose) => void;
  className?: string;
}

/** Front, side and back as a centred row of chips: which pose the photos show. */
export function PoseChips({ pose, onChange, className }: PoseChipsProps) {
  const { t } = useTranslation('bodyCheck');
  return (
    <View className={cn('flex-row justify-center gap-1.5', className)}>
      {POSES.map((p) => (
        <Chip
          key={p}
          label={t(`poses.${p}.short`)}
          selected={p === pose}
          onPress={() => onChange(p)}
          className="h-7.5 px-2.75"
        />
      ))}
    </View>
  );
}
