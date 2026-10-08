import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

import { Icon, type IconName } from './icon';
import { PressableScale, type PressableScaleProps } from './pressable-scale';

export interface IconButtonProps extends Omit<PressableScaleProps, 'children'> {
  icon: IconName;
  accessibilityLabel: string;
  size?: number;
  iconSize?: number;
  color?: string;
}

/** Round icon button, 42pt by default (back, close, settings). */
export function IconButton({
  icon,
  size = 42,
  iconSize = 12,
  color = colors.fg,
  className,
  style,
  ...props
}: IconButtonProps) {
  return (
    <PressableScale
      hitSlop={8}
      className={cn('items-center justify-center rounded-full bg-elevated', className)}
      {...props}
      style={[{ width: size, height: size }, style as object]}
    >
      <Icon name={icon} size={iconSize} color={color} />
    </PressableScale>
  );
}
