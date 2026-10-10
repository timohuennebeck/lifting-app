import type { LayoutChangeEvent } from 'react-native';

import { NumberKeypad } from '@/shared/ui/number-keypad';

import { useWorkoutSessionStore } from '../stores/workout-session-store';

export interface WeightKeypadProps {
  onConfirm: () => void;
  /** Hides the pad; what was typed stays. */
  onDismiss: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
}

/** The number pad wired to the box being typed into in the live workout. */
export function WeightKeypad({ onConfirm, onDismiss, onLayout }: WeightKeypadProps) {
  const field = useWorkoutSessionStore((s) => s.field);
  const pressKey = useWorkoutSessionStore((s) => s.pressKey);
  const pressBackspace = useWorkoutSessionStore((s) => s.pressBackspace);
  return (
    <NumberKeypad
      decimal={field === 'weight'}
      onKey={pressKey}
      onBackspace={pressBackspace}
      onConfirm={onConfirm}
      onDismiss={onDismiss}
      onLayout={onLayout}
    />
  );
}
