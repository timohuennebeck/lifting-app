import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { IconButton } from './icon-button';
import { Text } from './text';

type HeaderIcon = 'chevron-left' | 'chevron-left-thin' | 'close';

/** Icon sizes from the design: 7×11 back chevron, 10×16 thin chevron, 12pt cross. */
const ICON_SIZE: Record<HeaderIcon, number> = {
  'chevron-left': 7,
  'chevron-left-thin': 10,
  close: 12,
};

export interface ScreenHeaderProps {
  /** Leading button: back chevron (thin on the training screens) or close cross. */
  icon?: HeaderIcon;
  iconSize?: number;
  /** Defaults to `router.back()`. */
  onBack?: () => void;
  /** A string renders as a centred one-line title. */
  title?: ReactNode;
  /** Trailing button; an empty slot of the same size keeps the title centred. */
  action?: ReactNode;
  /** Overrides the row's gap and padding. */
  className?: string;
}

/** Top bar of pushed and modal screens: back/close button, title and an optional action. */
export function ScreenHeader({
  icon = 'chevron-left',
  iconSize,
  onBack,
  title,
  action,
  className,
}: ScreenHeaderProps) {
  const { t } = useTranslation();
  return (
    <View className={cn('flex-row items-center gap-3 px-4 py-1.5', className)}>
      <IconButton
        icon={icon}
        iconSize={iconSize ?? ICON_SIZE[icon]}
        accessibilityLabel={t(icon === 'close' ? 'actions.close' : 'actions.back')}
        onPress={onBack ?? (() => router.back())}
      />
      <View className="min-w-0 flex-1">
        {typeof title === 'string' ? (
          <Text variant="bodyStrong" numberOfLines={1} className="text-center">
            {title}
          </Text>
        ) : (
          title
        )}
      </View>
      {action ?? <View className="size-10.5" />}
    </View>
  );
}
