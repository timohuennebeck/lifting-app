import { useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';

import { parseInput, toInput } from '@/shared/lib/keypad';
import { NumberKeypad } from '@/shared/ui/number-keypad';

import type { PlateSetup } from '../lib/plates';
import { useWorkoutSessionStore } from '../stores/workout-session-store';
import { KeypadPlates } from './keypad-plates';
import { KeypadRir } from './keypad-rir';
import { PlatesSheet } from './plates-sheet';

export interface SetKeypadProps {
  onConfirm: () => void;
  /** Hides the pad; what was typed stays. */
  onDismiss: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
  /** Sets counted in reps get their reps in reserve picked above the keys. */
  withRir: boolean;
  /** The row's target reps in reserve, shown as picked until one is. */
  rirTarget: number | null;
  /** Saves the picked reps in reserve to the row. */
  onPickRir: (rir: number) => void;
  /** An exercise loaded with plates: typing the weight shows them above the keys. */
  plates: { exerciseId: string; setup: PlateSetup } | null;
}

/**
 * The number pad wired to the box being typed into in the live workout: weight, reps or seconds.
 */
export function SetKeypad({
  onConfirm,
  onDismiss,
  onLayout,
  withRir,
  rirTarget,
  onPickRir,
  plates,
}: SetKeypadProps) {
  const field = useWorkoutSessionStore((s) => s.field);
  const rir = useWorkoutSessionStore((s) => s.rir);
  const pressKey = useWorkoutSessionStore((s) => s.pressKey);
  const pressBackspace = useWorkoutSessionStore((s) => s.pressBackspace);
  const setInput = useWorkoutSessionStore((s) => s.setInput);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetWeight, setSheetWeight] = useState<number | null>(null);

  // Plates only make sense for the weight, not for reps or seconds.
  const platesShown = plates != null && field === 'weight';
  const withAccessory = platesShown || withRir;
  const openSheet = () => {
    setSheetWeight(parseInput(useWorkoutSessionStore.getState().input.weight));
    setSheetOpen(true);
  };

  return (
    <>
      <NumberKeypad
        decimal={field === 'weight'}
        onKey={pressKey}
        onBackspace={pressBackspace}
        onConfirm={onConfirm}
        onDismiss={onDismiss}
        onLayout={onLayout}
        accessory={
          withAccessory ? (
            <View className="gap-2.5">
              {platesShown ? (
                <KeypadPlates
                  exerciseId={plates.exerciseId}
                  setup={plates.setup}
                  onOpenSheet={openSheet}
                />
              ) : null}
              {withRir ? <KeypadRir value={rir} target={rirTarget} onSelect={onPickRir} /> : null}
            </View>
          ) : undefined
        }
      />
      {plates ? (
        <PlatesSheet
          visible={sheetOpen}
          weight={sheetWeight}
          exerciseId={plates.exerciseId}
          setup={plates.setup}
          onClose={() => setSheetOpen(false)}
          onDone={(weight) => {
            setInput('weight', toInput(weight));
            setSheetOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
