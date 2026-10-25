import { View } from 'react-native';

import { Button } from './button';
import { Sheet } from './sheet';
import { Text } from './text';
import { TextButton } from './text-button';

export interface ErrorSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  /** The neon button: "Try again", "Open settings" or, alone, "Got it". */
  actionLabel: string;
  onAction: () => void;
  /** The text button under it ("Close"); left out when the action only closes the sheet. */
  dismissLabel?: string;
}

/** Bottom sheet for an error: a neon "!" before the title, what to do, then its actions. */
export function ErrorSheet({
  visible,
  onClose,
  title,
  message,
  actionLabel,
  onAction,
  dismissLabel,
}: ErrorSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} uncounted>
      <View className="flex-row items-center gap-3 px-1 pt-3">
        <View
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          className="size-9 items-center justify-center rounded-full bg-accent"
        >
          <Text className="font-inter-bold text-lg leading-5 text-on-accent">!</Text>
        </View>
        <Text variant="headline" accessibilityRole="header" className="min-w-0 flex-1">
          {title}
        </Text>
      </View>
      <Text variant="paragraph" tone="subtle" className="px-1 pt-3">
        {message}
      </Text>
      <Button label={actionLabel} onPress={onAction} className="mt-6" />
      {dismissLabel ? (
        <TextButton label={dismissLabel} tone="secondary" onPress={onClose} className="mt-1" />
      ) : null}
    </Sheet>
  );
}
