import type { LayoutChangeEvent } from 'react-native';

import { NumberKeypad } from '@/shared/ui/number-keypad';

import { useWorkoutSessionStore } from '../stores/workout-session-store';

export interface WeightKeypadProps {
  onConfirm: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
}

/** The number pad wired to the box being typed into in the live workout. */
export function WeightKeypad({ onConfirm, onLayout }: WeightKeypadProps) {
  const field = useWorkoutSessionStore((s) => s.field);
  const pressKey = useWorkoutSessionStore((s) => s.pressKey);
  const pressBackspace = useWorkoutSessionStore((s) => s.pressBackspace);
  const closeKeypad = useWorkoutSessionStore((s) => s.closeKeypad);
  return (
    <NumberKeypad
      decimal={field === 'weight'}
      onKey={pressKey}
      onBackspace={pressBackspace}
      onConfirm={onConfirm}
      onDismiss={closeKeypad}
      onLayout={onLayout}
    />
  );
}
