import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Shows a leading check when selected (multi-select chips). */
  showCheck?: boolean;
  /** Selected fill; red marks pain or injuries. */
  tone?: 'accent' | 'red';
  className?: string;
}

export function Chip({
  label,
  selected,
  onPress,
  showCheck,
  tone = 'accent',
  className,
}: ChipProps) {
  return (
    <PressableScale
      activeScale={0.98}
      haptic="select"
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!selected }}
      className={cn(
        'h-10 flex-row items-center gap-1.5 rounded-full px-4',
        selected ? (tone === 'red' ? 'bg-red' : 'bg-accent') : 'bg-pill',
        className,
      )}
    >
      {showCheck && selected ? <Icon name="check" size={11} color={colors.onAccent} /> : null}
      <Text
        variant="caption"
        tone={selected && tone === 'accent' ? 'onAccent' : 'default'}
        className="text-sm"
      >
        {label}
      </Text>
    </PressableScale>
  );
}
