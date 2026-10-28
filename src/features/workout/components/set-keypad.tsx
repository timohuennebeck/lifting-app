import type { LayoutChangeEvent } from 'react-native';

import { NumberKeypad } from '@/shared/ui/number-keypad';

import { useWorkoutSessionStore } from '../stores/workout-session-store';
import { KeypadRir } from './keypad-rir';

export interface SetKeypadProps {
  onConfirm: () => void;
  /** Hides the pad; what was typed stays. */
  onDismiss: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
  /** Sets counted in reps get their reps in reserve picked above the keys. */
  withRir: boolean;
  /** The row's target reps in reserve, shown as picked until one is. */
  rirTarget: number | null;
}

/**
 * The number pad wired to the box being typed into in the live workout: weight, reps or seconds.
 */
export function SetKeypad({ onConfirm, onDismiss, onLayout, withRir, rirTarget }: SetKeypadProps) {
  const field = useWorkoutSessionStore((s) => s.field);
  const rir = useWorkoutSessionStore((s) => s.rir);
  const setRir = useWorkoutSessionStore((s) => s.setRir);
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
      accessory={
        withRir ? <KeypadRir value={rir} target={rirTarget} onSelect={setRir} /> : undefined
      }
    />
  );
}
