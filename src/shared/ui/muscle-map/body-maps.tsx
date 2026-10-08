import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { MuscleMap, type MuscleMapProps } from './muscle-map';

export interface BodyMapsProps extends Pick<MuscleMapProps, 'selected' | 'onToggle' | 'accent'> {
  accessibilityLabel?: string;
  className?: string;
}

/** Front and back muscle maps side by side in a 320pt high panel. */
export function BodyMaps({ accessibilityLabel, className, ...props }: BodyMapsProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      className={cn('mx-4 mt-5 h-80 flex-row gap-1 px-2 pt-4 pb-3', className)}
    >
      {(['front', 'back'] as const).map((view) => (
        <View key={view} className="min-w-0 flex-1">
          <MuscleMap view={view} {...props} />
        </View>
      ))}
    </View>
  );
}
