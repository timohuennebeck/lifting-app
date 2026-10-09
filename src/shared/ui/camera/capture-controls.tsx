import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { PressableScale, type PressableScaleProps } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface CaptureRowProps {
  /** Left of the shutter, e.g. a `CameraSideButton`. */
  start: ReactNode;
  /** The shutter, centred. */
  children: ReactNode;
  /** Right of the shutter, e.g. the `DonePill`. */
  end?: ReactNode;
}

/** Bottom control row of the cameras: shutter centred between two equal slots. */
export function CaptureRow({ start, children, end }: CaptureRowProps) {
  return (
    <View className="w-full flex-row items-center px-7">
      <View className="flex-1 items-start">{start}</View>
      {children}
      <View className="flex-1 items-end">{end}</View>
    </View>
  );
}

export interface ShutterButtonProps {
  accessibilityLabel: string;
  onPress: () => void;
  /** Dims the shutter and ignores presses (capturing, camera not ready). */
  busy?: boolean;
  /** Ignores presses without dimming. */
  disabled?: boolean;
  /** Light core while a self-timer runs; a press then cancels it. */
  counting?: boolean;
}

/** 78pt shutter with an accent core. */
export function ShutterButton({
  accessibilityLabel,
  onPress,
  busy,
  disabled,
  counting,
}: ShutterButtonProps) {
  return (
    <PressableScale
      haptic="none"
      activeScale={0.94}
      disabled={busy || disabled}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="size-19.5 items-center justify-center rounded-full bg-elevated"
    >
      <View
        className={cn(
          'size-15.5 rounded-full',
          counting ? 'bg-fg' : 'bg-accent',
          busy && 'opacity-60',
        )}
      />
    </PressableScale>
  );
}

/** 52pt round button beside the shutter (flip camera, photo library). */
export function CameraSideButton(props: PressableScaleProps) {
  return (
    <PressableScale
      {...props}
      className="size-13 items-center justify-center rounded-full bg-elevated"
    />
  );
}

export interface DonePillProps {
  label: string;
  /** Photos taken so far. */
  count: number;
  onPress: () => void;
  disabled?: boolean;
}

/** "Done" pill with the photo count that ends the capture. */
export function DonePill({ label, count, onPress, disabled }: DonePillProps) {
  return (
    <PressableScale
      haptic="press"
      disabled={disabled}
      onPress={onPress}
      className="h-11 flex-row items-center gap-2 rounded-full bg-elevated pr-2 pl-4"
    >
      <Text variant="label">{label}</Text>
      <View className="h-6.5 min-w-6.5 items-center justify-center rounded-full bg-accent px-1.5">
        <Text variant="caption" tone="onAccent">
          {count}
        </Text>
      </View>
    </PressableScale>
  );
}
