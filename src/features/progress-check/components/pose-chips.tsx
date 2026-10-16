import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SegmentedControl } from '@/shared/ui/segmented-control';

import { POSES, type Pose } from '../lib/poses';

export interface PoseChipsProps {
  pose: Pose;
  onChange: (pose: Pose) => void;
  className?: string;
}

/** Front, side and back as one pill of tabs, like the history ranges: which pose the photos show. */
export function PoseChips({ pose, onChange, className }: PoseChipsProps) {
  const { t } = useTranslation('progressCheck');
  return (
    <View className={className}>
      <SegmentedControl
        className="bg-surface"
        value={pose}
        onChange={onChange}
        options={POSES.map((p) => ({ value: p, label: t(`poses.${p}.short`) }))}
      />
    </View>
  );
}
