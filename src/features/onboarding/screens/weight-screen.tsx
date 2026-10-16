import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { snapTo, toStoredKg, toUnits } from '@/shared/lib/body-weight';
import { formatNumber, type UnitSystem, weightUnit } from '@/shared/lib/format';
import { clamp } from '@/shared/lib/math';
import { Button } from '@/shared/ui/button';
import { RulerPicker } from '@/shared/ui/ruler-picker';
import { StepScreen } from '@/shared/ui/step-screen';

import { MeasureValue, StepButtons } from '../components/measure-value';
import { ABOUT_STEPS } from '../lib/flow';
import { useDraft, useUpdateDraft } from '../stores/onboarding-store';

/** The ruler in the user's unit: half kilos or whole pounds. */
const WEIGHT_KG = { min: 30, max: 250, step: 0.5 } as const;
const WEIGHT_LB = { min: 66, max: 550, step: 1 } as const;

/** The ruler's range and step in the user's unit. */
const weightRange = (units: UnitSystem) => (units === 'imperial' ? WEIGHT_LB : WEIGHT_KG);

/** Stored kg → the ruler's value, on its steps and in its range. */
function weightToDisplay(kg: number, units: UnitSystem) {
  const { min, max, step } = weightRange(units);
  return clamp(snapTo(toUnits(kg, units), step), min, max);
}

/** The ruler's value → kg to store. */
function weightFromDisplay(value: number, units: UnitSystem) {
  const { min, max } = weightRange(units);
  return toStoredKg(clamp(value, min, max), units);
}

export function WeightScreen() {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation();
  const { weightKg, unitPreference } = useDraft();
  const update = useUpdateDraft();
  const imperial = unitPreference === 'imperial';

  // The ruler works in the display unit; the draft always stores kg.
  const range = weightRange(unitPreference);
  const value = weightToDisplay(weightKg, unitPreference);
  const setValue = (next: number) => update({ weightKg: weightFromDisplay(next, unitPreference) });

  return (
    <StepScreen
      step={5}
      total={ABOUT_STEPS}
      title={t('weight.title')}
      footer={<Button label={tc('actions.continue')} onPress={() => router.push('/height')} />}
    >
      <View className="mx-4 mt-6 items-center py-5">
        <MeasureValue
          value={imperial ? String(value) : formatNumber(value, 1)}
          amount={value}
          unit={weightUnit(unitPreference)}
        />
        <RulerPicker
          value={value}
          onChange={setValue}
          min={range.min}
          max={range.max}
          step={range.step}
          majorEvery={10}
          midEvery={imperial ? 5 : 2}
          className="mt-5"
        />
        <StepButtons
          className="mt-5"
          onDecrease={() => setValue(value - range.step)}
          onIncrease={() => setValue(value + range.step)}
        />
      </View>
    </StepScreen>
  );
}
