import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { UnitSystem } from '@/shared/lib/format';
import { clamp } from '@/shared/lib/math';
import { Button } from '@/shared/ui/button';
import { RulerPicker } from '@/shared/ui/ruler-picker';
import { StepScreen } from '@/shared/ui/step-screen';

import { MeasureValue, StepButtons } from '../components/measure-value';
import { ABOUT_STEPS } from '../lib/flow';
import { useDraft, useUpdateDraft } from '../stores/onboarding-store';

const CM_PER_INCH = 2.54;
const HEIGHT_CM = { min: 120, max: 230 } as const;
const HEIGHT_IN = { min: 47, max: 91 } as const;

/** Height range in the user's unit (cm or inches). */
const heightRange = (units: UnitSystem) => (units === 'imperial' ? HEIGHT_IN : HEIGHT_CM);

/** Stored cm → value edited in the user's unit (whole inches), clamped to the range. */
function heightToDisplay(cm: number, units: UnitSystem) {
  const { min, max } = heightRange(units);
  return clamp(units === 'imperial' ? Math.round(cm / CM_PER_INCH) : cm, min, max);
}

/** Edited value → whole centimetres as the profile stores them. */
function heightFromDisplay(value: number, units: UnitSystem) {
  const { min, max } = heightRange(units);
  const v = clamp(value, min, max);
  return units === 'imperial' ? Math.round(v * CM_PER_INCH) : v;
}

/** 70 → 5′10″ */
function feetInches(totalInches: number) {
  const inches = Math.round(totalInches);
  return `${Math.floor(inches / 12)}′${inches % 12}″`;
}

export function HeightScreen() {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation();
  const { heightCm, unitPreference } = useDraft();
  const update = useUpdateDraft();
  const imperial = unitPreference === 'imperial';

  // Imperial users scroll in inches; the draft always stores whole centimetres.
  const range = heightRange(unitPreference);
  const value = heightToDisplay(heightCm, unitPreference);
  const setValue = (next: number) => update({ heightCm: heightFromDisplay(next, unitPreference) });

  return (
    <StepScreen
      step={6}
      total={ABOUT_STEPS}
      title={t('height.title')}
      footer={<Button label={tc('actions.continue')} onPress={() => router.push('/experience')} />}
    >
      <View className="flex-row items-center gap-5 pt-7.5 pr-5 pl-7">
        <View className="flex-1 gap-5.5">
          <MeasureValue
            value={imperial ? feetInches(value) : String(value)}
            amount={value}
            unit={imperial ? undefined : tc('units.cm')}
          />
          <StepButtons
            onDecrease={() => setValue(value - 1)}
            onIncrease={() => setValue(value + 1)}
          />
        </View>
        <RulerPicker
          vertical
          value={value}
          onChange={setValue}
          min={range.min}
          max={range.max}
          step={1}
          majorEvery={imperial ? 12 : 10}
          midEvery={imperial ? 6 : 5}
          className="h-82.5"
        />
      </View>
    </StepScreen>
  );
}
