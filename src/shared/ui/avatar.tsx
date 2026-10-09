import { Image } from 'expo-image';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { Text } from './text';

export interface AvatarProps {
  name: string;
  /** Profile photo; the initials show while it is missing or loading. */
  uri?: string | null;
  /** Cache key of the photo (its storage path), so a new signed URL isn't a new download. */
  cacheKey?: string;
  size?: number;
  className?: string;
}

/** Profile photo or initials avatar with the design's dark ring. */
export function Avatar({ name, uri, cacheKey, size = 42, className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  const fontSize = size * 0.38;
  return (
    <View
      className={cn(
        'items-center justify-center overflow-hidden rounded-full border-2 border-line bg-elevated',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {/* The line height follows the size; a fixed one clipped large initials. */}
      <Text variant="label" style={{ fontSize, lineHeight: Math.round(fontSize * 1.25) }}>
        {initials || '·'}
      </Text>
      {uri ? (
        <Image
          source={{ uri, cacheKey }}
          contentFit="cover"
          transition={150}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
      ) : null}
    </View>
  );
}
