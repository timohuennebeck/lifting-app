import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { Text } from './text';

export interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}

/** Initials avatar with the design's dark ring. */
export function Avatar({ name, size = 42, className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return (
    <View
      className={cn(
        'items-center justify-center rounded-full border-2 border-line bg-elevated',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Text variant="label" style={{ fontSize: size * 0.38 }}>
        {initials || '·'}
      </Text>
    </View>
  );
}
